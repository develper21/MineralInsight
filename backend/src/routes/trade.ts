import { Router } from 'express';
import { query, body } from 'express-validator';
import { TradeController } from '@/controllers/TradeController';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validateRequest';
import { optionalAuth } from '@/middleware/auth';

const router = Router();
const tradeController = new TradeController();

// Get trade data
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('country').optional().isString().withMessage('Country must be a string'),
    query('type').optional().isIn(['import', 'export', 'both']).withMessage('Invalid type'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y', 'ALL']).withMessage('Invalid period'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(tradeController.getTradeData.bind(tradeController))
);

// Get trade summary
router.get('/summary',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('type').optional().isIn(['import', 'export', 'both']).withMessage('Invalid type'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(tradeController.getTradeSummary.bind(tradeController))
);

// Get top trading countries
router.get('/top-countries',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('type').optional().isIn(['import', 'export']).withMessage('Invalid type'),
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(tradeController.getTopCountries.bind(tradeController))
);

// Get trade trends
router.get('/trends',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('country').optional().isString().withMessage('Country must be a string'),
    query('type').optional().isIn(['import', 'export', 'both']).withMessage('Invalid type'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
    query('frequency').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid frequency'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(tradeController.getTradeTrends.bind(tradeController))
);

// Get trade by country
router.get('/country/:country',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('type').optional().isIn(['import', 'export', 'both']).withMessage('Invalid type'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y', 'ALL']).withMessage('Invalid period'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(tradeController.getTradeByCountry.bind(tradeController))
);

// Get trade by mineral
router.get('/mineral/:mineral',
  [
    query('country').optional().isString().withMessage('Country must be a string'),
    query('type').optional().isIn(['import', 'export', 'both']).withMessage('Invalid type'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y', 'ALL']).withMessage('Invalid period'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(tradeController.getTradeByMineral.bind(tradeController))
);

export default router;
