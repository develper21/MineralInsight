import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '@/controllers/AuthController';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validateRequest';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const authController = new AuthController();

// Register user
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
  ],
  validateRequest,
  asyncHandler(authController.register.bind(authController))
);

// Login user
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  asyncHandler(authController.login.bind(authController))
);

// Refresh token
router.post('/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ],
  validateRequest,
  asyncHandler(authController.refreshToken.bind(authController))
);

// Logout user
router.post('/logout',
  authenticateToken,
  asyncHandler(authController.logout.bind(authController))
);

// Get current user
router.get('/me',
  authenticateToken,
  asyncHandler(authController.getCurrentUser.bind(authController))
);

// Update password
router.put('/password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validateRequest,
  asyncHandler(authController.updatePassword.bind(authController))
);

// Forgot password
router.post('/forgot-password',
  [
    body('email').isEmail().normalizeEmail(),
  ],
  validateRequest,
  asyncHandler(authController.forgotPassword.bind(authController))
);

// Reset password
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validateRequest,
  asyncHandler(authController.resetPassword.bind(authController))
);

export default router;
