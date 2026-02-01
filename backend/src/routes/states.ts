import { Router } from 'express';
import { query } from 'express-validator';
import { StateController } from '@/controllers/StateController';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validateRequest';
import { optionalAuth } from '@/middleware/auth';

const router = Router();
const stateController = new StateController();

// Get all states
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('search').optional().isString().withMessage('Search must be a string'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(stateController.getStates.bind(stateController))
);

// Get state by ID
router.get('/:id',
  [
    query('includeStats').optional().isBoolean().withMessage('includeStats must be boolean'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(stateController.getStateById.bind(stateController))
);

// Get state mineral data
router.get('/:id/minerals',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y', 'ALL']).withMessage('Invalid period'),
    query('type').optional().isIn(['production', 'reserves', 'resources']).withMessage('Invalid type'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(stateController.getStateMinerals.bind(stateController))
);

// Get state production data
router.get('/:id/production',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('period').optional().isIn(['1M', '3M', '6M', '1Y']).withMessage('Invalid period'),
    query('frequency').optional().isIn(['monthly', 'quarterly', 'yearly']).withMessage('Invalid frequency'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(stateController.getStateProduction.bind(stateController))
);

// Get state reserves
router.get('/:id/reserves',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('type').optional().isIn(['proven', 'probable', 'possible']).withMessage('Invalid reserve type'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(stateController.getStateReserves.bind(stateController))
);

// Get state mining companies
router.get('/:id/companies',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(stateController.getStateCompanies.bind(stateController))
);

// Get state mining projects
router.get('/:id/projects',
  [
    query('mineral').optional().isString().withMessage('Mineral must be a string'),
    query('status').optional().isIn(['active', 'planned', 'completed', 'suspended']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
  validateRequest,
  optionalAuth,
  asyncHandler(stateController.getStateProjects.bind(stateController))
);

export default router;
