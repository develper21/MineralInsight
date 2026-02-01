import { Router } from 'express';
import { query } from 'express-validator';
import { MineralController } from '@/controllers/MineralController';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validateRequest';
import { optionalAuth } from '@/middleware/auth';

const router = Router();
const mineralController = new MineralController();

// Get all minerals
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('category').optional().isString().withMessage('Category must be a string'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(mineralController.getMinerals.bind(mineralController))
);

// Get mineral by ID
router.get('/:id',
  [
    query('includeStats').optional().isBoolean().withMessage('includeStats must be boolean'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(mineralController.getMineralById.bind(mineralController))
);

// Get mineral statistics
router.get('/:id/stats',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y', 'ALL']).withMessage('Invalid period'),
    query('metric').optional().isIn(['import', 'export', 'price', 'volume']).withMessage('Invalid metric'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(mineralController.getMineralStats.bind(mineralController))
);

// Get mineral prices
router.get('/:id/prices',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y', 'ALL']).withMessage('Invalid period'),
    query('frequency').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid frequency'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(mineralController.getMineralPrices.bind(mineralController))
);

// Get mineral trade data
router.get('/:id/trade',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y', 'ALL']).withMessage('Invalid period'),
    query('type').optional().isIn(['import', 'export', 'both']).withMessage('Invalid type'),
    query('country').optional().isString().withMessage('Country must be a string'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(mineralController.getMineralTrade.bind(mineralController))
);

// Get mineral risk assessment
router.get('/:id/risk',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(mineralController.getMineralRisk.bind(mineralController))
);

// Get mineral forecasts
router.get('/:id/forecast',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
    query('type').optional().isIn(['price', 'demand', 'supply']).withMessage('Invalid type'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(mineralController.getMineralForecast.bind(mineralController))
);

export default router;
