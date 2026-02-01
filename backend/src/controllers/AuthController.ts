import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/config/database';
import { cacheSet, cacheDel } from '@/config/redis';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { sendEmail } from '@/utils/email';
import { generateToken, generateRefreshToken } from '@/utils/jwt';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { email, password, name, role = 'user' }: RegisterRequest = req.body;

    try {
      // Check if user already exists
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        throw new CustomError('User already exists', 409);
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const [user] = await db('users')
        .insert({
          email,
          password: hashedPassword,
          name,
          role,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning(['id', 'email', 'name', 'role', 'created_at']);

      // Generate tokens
      const token = generateToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Cache user data
      await cacheSet(`user:${user.id}`, user, 3600);

      logger.info(`User registered: ${email}`);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Registration error:', error);
      throw new CustomError('Registration failed', 500);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password }: LoginRequest = req.body;

    try {
      // Find user
      const user = await db('users').where({ email }).first() as User;
      if (!user) {
        throw new CustomError('Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError('Invalid credentials', 401);
      }

      // Generate tokens
      const token = generateToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Cache user data
      await cacheSet(`user:${user.id}`, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }, 3600);

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Login error:', error);
      throw new CustomError('Login failed', 500);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    try {
      if (!refreshToken) {
        throw new CustomError('Refresh token is required', 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      
      // Get user from database
      const user = await db('users').where({ id: decoded.userId }).first() as User;
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Generate new tokens
      const newToken = generateToken(user.id, user.email, user.role);
      const newRefreshToken = generateRefreshToken(user.id);

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid refresh token', 401);
      }
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Token refresh error:', error);
      throw new CustomError('Token refresh failed', 500);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.id;

    try {
      // Remove user from cache
      await cacheDel(`user:${userId}`);

      logger.info(`User logged out: ${userId}`);

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      throw new CustomError('Logout failed', 500);
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.id;

    try {
      // Try to get from cache first
      let user = await cacheGet(`user:${userId}`);

      if (!user) {
        // Get from database
        user = await db('users')
          .where({ id: userId })
          .select('id', 'email', 'name', 'role', 'created_at', 'updated_at')
          .first();

        if (!user) {
          throw new CustomError('User not found', 404);
        }

        // Cache user data
        await cacheSet(`user:${userId}`, user, 3600);
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Get current user error:', error);
      throw new CustomError('Failed to get user data', 500);
    }
  }

  async updatePassword(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    try {
      // Get user with password
      const user = await db('users').where({ id: userId }).first() as User;
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new CustomError('Current password is incorrect', 400);
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db('users')
        .where({ id: userId })
        .update({
          password: hashedNewPassword,
          updated_at: new Date(),
        });

      // Remove user from cache
      await cacheDel(`user:${userId}`);

      logger.info(`Password updated for user: ${userId}`);

      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Update password error:', error);
      throw new CustomError('Failed to update password', 500);
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    try {
      const user = await db('users').where({ email }).first();
      if (!user) {
        // Don't reveal if user exists or not
        res.json({
          success: true,
          message: 'If the email exists, a reset link has been sent',
        });
        return;
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password-reset' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      // Cache reset token
      await cacheSet(`reset:${resetToken}`, user.id, 3600);

      // Send reset email (implement email service)
      await sendEmail(email, 'Password Reset', `Reset token: ${resetToken}`);

      logger.info(`Password reset requested for: ${email}`);

      res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw new CustomError('Failed to process password reset', 500);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;

    try {
      // Verify reset token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (decoded.type !== 'password-reset') {
        throw new CustomError('Invalid reset token', 400);
      }

      // Get user ID from cache
      const userId = await cacheGet(`reset:${token}`);
      if (!userId) {
        throw new CustomError('Reset token expired or invalid', 400);
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db('users')
        .where({ id: userId })
        .update({
          password: hashedPassword,
          updated_at: new Date(),
        });

      // Remove reset token from cache
      await cacheDel(`reset:${token}`);

      logger.info(`Password reset completed for user: ${userId}`);

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid reset token', 400);
      }
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Reset password error:', error);
      throw new CustomError('Failed to reset password', 500);
    }
  }
}
