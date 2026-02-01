import { Router } from 'express';
import { query } from 'express-validator';
import { ForecastController } from '@/controllers/ForecastController';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validateRequest';
import { optionalAuth } from '@/middleware/auth';

const router = Router();
const forecastController = new ForecastController();

// Get price forecasts
router.get('/prices',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
    query('model').optional().isIn(['linear', 'arima', 'lstm', 'ensemble']).withMessage('Invalid model'),
    query('confidence').optional().isIn(['80', '90', '95']).withMessage('Invalid confidence level'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(forecastController.getPriceForecasts.bind(forecastController))
);

// Get demand forecasts
router.get('/demand',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['3M', '6M', '1Y', '2Y']).withMessage('Invalid period'),
    query('region').optional().isString().withMessage('Region must be a string'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(forecastController.getDemandForecasts.bind(forecastController))
);

// Get supply forecasts
router.get('/supply',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['3M', '6M', '1Y', '2Y']).withMessage('Invalid period'),
    query('country').optional().isString().withMessage('Country must be a string'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(forecastController.getSupplyForecasts.bind(forecastController))
);

// Get trade forecasts
router.get('/trade',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('country').optional().isString().withMessage('Country must be a string'),
    query('type').optional().isIn(['import', 'export', 'both']).withMessage('Invalid type'),
    query('period').optional().isIn(['3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(forecastController.getTradeForecasts.bind(forecastController))
);

// Get scenario analysis
router.get('/scenarios',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('scenario').optional().isIn(['baseline', 'optimistic', 'pessimistic', 'disruption']).withMessage('Invalid scenario'),
    query('period').optional().isIn(['6M', '1Y', '2Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(forecastController.getScenarioAnalysis.bind(forecastController))
);

// Get forecast accuracy
router.get('/accuracy',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('model').optional().isString().withMessage('Model must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(forecastController.getForecastAccuracy.bind(forecastController))
);

export default router;
