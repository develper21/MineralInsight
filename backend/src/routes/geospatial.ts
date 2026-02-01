import { Router } from 'express';
import { query } from 'express-validator';
import { GeospatialController } from '@/controllers/GeospatialController';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validateRequest';
import { authenticateToken, optionalAuth } from '@/middleware/auth';

const router = Router();
const geospatialController = new GeospatialController();

// Mine locations
router.get('/mines',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('state').optional().isString().withMessage('State must be a string'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.getMineLocations.bind(geospatialController))
);

// State boundaries
router.get('/boundaries',
  [
    query('state').optional().isString().withMessage('State must be a string'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.getStateBoundaries.bind(geospatialController))
);

// Production heatmap
router.get('/heatmap/:mineral',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.getProductionHeatmap.bind(geospatialController))
);

// Trade flow routes
router.get('/trade-flows/:commodity',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.getTradeFlowRoutes.bind(geospatialController))
);

// Risk zones
router.get('/risk-zones',
  [
    query('riskType').optional().isIn(['supply', 'price', 'geopolitical', 'environmental']).withMessage('Invalid risk type'),
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.getRiskZones.bind(geospatialController))
);

// Nearby mines
router.get('/nearby-mines',
  [
    query('latitude').isFloat().withMessage('Latitude must be a number'),
    query('longitude').isFloat().withMessage('Longitude must be a number'),
    query('radius').optional().isFloat({ min: 1, max: 500 }).withMessage('Radius must be between 1 and 500'),
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.getNearbyMines.bind(geospatialController))
);

// Distance calculation
router.post('/distance',
  [
    query('lat1').isFloat().withMessage('Latitude 1 must be a number'),
    query('lon1').isFloat().withMessage('Longitude 1 must be a number'),
    query('lat2').isFloat().withMessage('Latitude 2 must be a number'),
    query('lon2').isFloat().withMessage('Longitude 2 must be a number'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.calculateDistance.bind(geospatialController))
);

// Cluster analysis
router.get('/clusters/:mineral',
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.getClusterAnalysis.bind(geospatialController))
);

// Geospatial statistics
router.get('/statistics',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('state').optional().isString().withMessage('State must be a string'),
    query('metric').optional().isIn(['production', 'mines', 'risk']).withMessage('Invalid metric'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.getGeospatialStatistics.bind(geospatialController))
);

// Regional analysis
router.get('/regional-analysis',
  [
    query('region').optional().isString().withMessage('Region must be a string'),
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.getRegionalAnalysis.bind(geospatialController))
);

// Supply chain mapping
router.get('/supply-chain/:mineral',
  [
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
    query('includeFlows').optional().isBoolean().withMessage('includeFlows must be boolean'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.getSupplyChainMapping.bind(geospatialController))
);

// Infrastructure analysis
router.get('/infrastructure',
  [
    query('type').optional().isIn(['mines', 'plants', 'ports', 'roads']).withMessage('Invalid infrastructure type'),
    query('state').optional().isString().withMessage('State must be a string'),
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.getInfrastructureAnalysis.bind(geospatialController))
);

// Environmental impact zones
router.get('/environmental-impact/:mineral',
  [
    query('state').optional().isString().withMessage('State must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(geospatialController.getEnvironmentalImpact.bind(geospatialController))
);

export default router;
