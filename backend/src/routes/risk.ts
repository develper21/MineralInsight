import { Router } from 'express';
import { query } from 'express-validator';
import { RiskController } from '@/controllers/RiskController';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validateRequest';
import { optionalAuth } from '@/middleware/auth';

const router = Router();
const riskController = new RiskController();

// Get overall risk index
router.get('/index',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(riskController.getRiskIndex.bind(riskController))
);

// Get risk by mineral
router.get('/mineral/:mineral',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
    query('factors').optional().isString().withMessage('Factors must be a string'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(riskController.getMineralRisk.bind(riskController))
);

// Get risk by country
router.get('/country/:country',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(riskController.getCountryRisk.bind(riskController))
);

// Get supply chain risk
router.get('/supply-chain',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(riskController.getSupplyChainRisk.bind(riskController))
);

// Get geopolitical risk
router.get('/geopolitical',
  [
    query('region').optional().isString().withMessage('Region must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(riskController.getGeopoliticalRisk.bind(riskController))
);

// Get risk scenarios
router.get('/scenarios',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('scenario').optional().isIn(['supply-disruption', 'price-spike', 'demand-surge']).withMessage('Invalid scenario'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(riskController.getRiskScenarios.bind(riskController))
);

// Get risk mitigation strategies
router.get('/mitigation',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid risk level'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(riskController.getMitigationStrategies.bind(riskController))
);

export default router;
