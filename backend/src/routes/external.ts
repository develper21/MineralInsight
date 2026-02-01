import { Router } from 'express';
import { query } from 'express-validator';
import { ExternalAPIController } from '@/controllers/ExternalAPIController';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validateRequest';
import { authenticateToken, authorizeRoles } from '@/middleware/auth';

const router = Router();
const externalAPIController = new ExternalAPIController();

// DGCI API endpoints
router.get('/dgci/prices',
  [
    query('commodity').optional().isString().withMessage('Commodity must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getDGCIPrices.bind(externalAPIController))
);

router.get('/dgci/trade',
  [
    query('commodity').optional().isString().withMessage('Commodity must be a string'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getDGCITradeData.bind(externalAPIController))
);

router.get('/dgci/production',
  [
    query('commodity').optional().isString().withMessage('Commodity must be a string'),
    query('state').optional().isString().withMessage('State must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getDGCIProductionData.bind(externalAPIController))
);

router.get('/dgci/intelligence',
  [
    query('commodity').optional().isString().withMessage('Commodity must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getDGCIMarketIntelligence.bind(externalAPIController))
);

router.get('/dgci/policy-updates',
  authenticateToken,
  asyncHandler(externalAPIController.getDGCIPolicyUpdates.bind(externalAPIController))
);

// Commerce API endpoints
router.get('/commerce/trade',
  [
    query('commodity').optional().isString().withMessage('Commodity must be a string'),
    query('tradeType').optional().isIn(['import', 'export', 'both']).withMessage('Invalid trade type'),
    query('country').optional().isString().withMessage('Country must be a string'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getCommerceTradeData.bind(externalAPIController))
);

router.get('/commerce/country/:country',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getCommerceCountryTradeData.bind(externalAPIController))
);

router.get('/commerce/commodity/:commodity',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getCommerceCommodityTradeData.bind(externalAPIController))
);

router.get('/commerce/statistics',
  [
    query('commodity').optional().isString().withMessage('Commodity must be a string'),
    query('country').optional().isString().withMessage('Country must be a string'),
    query('period').optional().isString().withMessage('Period must be a string'),
    query('tradeType').optional().isIn(['import', 'export', 'both']).withMessage('Invalid trade type'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getCommerceTradeStatistics.bind(externalAPIController))
);

router.get('/commerce/top-partners',
  [
    query('commodity').optional().isString().withMessage('Commodity must be a string'),
    query('tradeType').optional().isIn(['import', 'export']).withMessage('Invalid trade type'),
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getCommerceTopPartners.bind(externalAPIController))
);

router.get('/commerce/trends',
  [
    query('commodity').optional().isString().withMessage('Commodity must be a string'),
    query('country').optional().isString().withMessage('Country must be a string'),
    query('period').optional().isString().withMessage('Period must be a string'),
    query('frequency').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid frequency'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getCommerceTradeTrends.bind(externalAPIController))
);

router.get('/commerce/policy-updates',
  authenticateToken,
  asyncHandler(externalAPIController.getCommercePolicyUpdates.bind(externalAPIController))
);

router.get('/commerce/tariffs/:commodity',
  [
    query('country').optional().isString().withMessage('Country must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getCommerceTariffInformation.bind(externalAPIController))
);

router.get('/commerce/balance/:country',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getCommerceTradeBalance.bind(externalAPIController))
);

// TEXMiN API endpoints
router.get('/texmin/mining',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('state').optional().isString().withMessage('State must be a string'),
    query('district').optional().isString().withMessage('District must be a string'),
    query('company').optional().isString().withMessage('Company must be a string'),
    query('mineType').optional().isIn(['open_cast', 'underground', 'alluvial', 'all']).withMessage('Invalid mine type'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getTEXMiNMiningData.bind(externalAPIController))
);

router.get('/texmin/states/:state',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getTEXMiNStateData.bind(externalAPIController))
);

router.get('/texmin/minerals/:mineral/reserves',
  [
    query('state').optional().isString().withMessage('State must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getTEXMiNReserves.bind(externalAPIController))
);

router.get('/texmin/minerals/:mineral/production',
  [
    query('state').optional().isString().withMessage('State must be a string'),
    query('period').optional().isString().withMessage('Period must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getTEXMiNProduction.bind(externalAPIController))
);

router.get('/texmin/companies',
  [
    query('state').optional().isString().withMessage('State must be a string'),
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getTEXMiNMiningCompanies.bind(externalAPIController))
);

router.get('/texmin/mines/locations',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('state').optional().isString().withMessage('State must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getTEXMiNMineLocations.bind(externalAPIController))
);

router.get('/texmin/projects',
  [
    query('status').optional().isIn(['active', 'planned', 'completed', 'suspended']).withMessage('Invalid status'),
    query('state').optional().isString().withMessage('State must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getTEXMiNMiningProjects.bind(externalAPIController))
);

router.get('/texmin/environmental/:mineral',
  [
    query('state').optional().isString().withMessage('State must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getTEXMiNEnvironmentalData.bind(externalAPIController))
);

router.get('/texmin/policy',
  [
    query('state').optional().isString().withMessage('State must be a string'),
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getTEXMiNPolicyRegulations.bind(externalAPIController))
);

router.get('/texmin/intelligence',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isString().withMessage('Period must be a string'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getTEXMiNMarketIntelligence.bind(externalAPIController))
);

// ETL Pipeline endpoints (Admin only)
router.get('/etl/jobs',
  authenticateToken,
  authorizeRoles('admin'),
  asyncHandler(externalAPIController.getETLJobs.bind(externalAPIController))
);

router.get('/etl/jobs/:jobId',
  authenticateToken,
  authorizeRoles('admin'),
  asyncHandler(externalAPIController.getETLJobStatus.bind(externalAPIController))
);

router.post('/etl/jobs/:jobId/run',
  authenticateToken,
  authorizeRoles('admin'),
  asyncHandler(externalAPIController.runETLJob.bind(externalAPIController))
);

router.post('/etl/jobs/:jobId/enable',
  authenticateToken,
  authorizeRoles('admin'),
  asyncHandler(externalAPIController.enableETLJob.bind(externalAPIController))
);

router.post('/etl/jobs/:jobId/disable',
  authenticateToken,
  authorizeRoles('admin'),
  asyncHandler(externalAPIController.disableETLJob.bind(externalAPIController))
);

router.post('/etl/comprehensive-sync',
  authenticateToken,
  authorizeRoles('admin'),
  asyncHandler(externalAPIController.runComprehensiveSync.bind(externalAPIController))
);

router.get('/etl/data-quality',
  authenticateToken,
  authorizeRoles('admin'),
  asyncHandler(externalAPIController.getDataQualityReport.bind(externalAPIController))
);

// Combined data endpoints
router.get('/combined/market-overview',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getCombinedMarketOverview.bind(externalAPIController))
);

router.get('/combined/trade-analysis',
  [
    query('commodity').optional().isString().withMessage('Commodity must be a string'),
    query('country').optional().isString().withMessage('Country must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getCombinedTradeAnalysis.bind(externalAPIController))
);

router.get('/combined/production-analysis',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('state').optional().isString().withMessage('State must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  authenticateToken,
  asyncHandler(externalAPIController.getCombinedProductionAnalysis.bind(externalAPIController))
);

export default router;
