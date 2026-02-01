import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/jwt';
import { cacheGet } from '@/config/redis';
import { CustomError } from '@/middleware/errorHandler';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new CustomError('Access token required', 401);
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Try to get user from cache first
    let user = await cacheGet(`user:${decoded.userId}`);
    
    if (!user) {
      throw new CustomError('User not found or session expired', 401);
    }

    // Attach user to request
    req.user = user as {
      id: number;
      email: string;
      role: string;
    };
    next();
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Invalid or expired token', 401);
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new CustomError('Insufficient permissions', 403);
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      let user = await cacheGet(`user:${decoded.userId}`);
      
      if (user) {
        req.user = user as {
          id: number;
          email: string;
          role: string;
        };
      }
    }

    next();
  } catch (error) {
    // Optional auth should not throw errors, just continue without user
    next();
  }
};
