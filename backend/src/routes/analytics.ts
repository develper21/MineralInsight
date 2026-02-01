import { Router } from 'express';
import { query } from 'express-validator';
import { AnalyticsController } from '@/controllers/AnalyticsController';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validateRequest';
import { optionalAuth } from '@/middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

// Get dashboard analytics
router.get('/dashboard',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(analyticsController.getDashboardAnalytics.bind(analyticsController))
);

// Get market overview
router.get('/market-overview',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(analyticsController.getMarketOverview.bind(analyticsController))
);

// Get performance metrics
router.get('/performance',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
    query('metric').optional().isIn(['price', 'volume', 'value']).withMessage('Invalid metric'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(analyticsController.getPerformanceMetrics.bind(analyticsController))
);

// Get correlation analysis
router.get('/correlation',
  [
    query('minerals').optional().isString().withMessage('Minerals must be a comma-separated string'),
    query('period').optional().isIn(['3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(analyticsController.getCorrelationAnalysis.bind(analyticsController))
);

// Get volatility analysis
router.get('/volatility',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(analyticsController.getVolatilityAnalysis.bind(analyticsController))
);

// Get supply-demand analysis
router.get('/supply-demand',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(analyticsController.getSupplyDemandAnalysis.bind(analyticsController))
);

// Get market sentiment
router.get('/sentiment',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(analyticsController.getMarketSentiment.bind(analyticsController))
);

// Get price predictions
router.get('/predictions',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M']).withMessage('Invalid period'),
    query('model').optional().isIn(['linear', 'arima', 'lstm']).withMessage('Invalid model'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(analyticsController.getPricePredictions.bind(analyticsController))
);

export default router;
