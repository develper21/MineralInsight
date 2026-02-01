import { Request, Response } from 'express';
import { db } from '@/config/database';
import { cacheSet, cacheGet } from '@/config/redis';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class MineralController {
  async getMinerals(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category
      } = req.query;

      const cacheKey = `minerals:${JSON.stringify(req.query)}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      let query = db('minerals').where('is_active', true);

      // Apply filters
      if (search) {
        query = query.where(function() {
          this.where('name', 'ilike', `%${search}%`)
              .orWhere('symbol', 'ilike', `%${search}%`)
              .orWhere('description', 'ilike', `%${search}%`);
        });
      }

      if (category) {
        query = query.where('category', category);
      }

      // Get total count
      const total = await query.clone().count('* as count').first();

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      const minerals = await query
        .orderBy('name')
        .limit(Number(limit))
        .offset(offset);

      const result = {
        minerals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total?.count || 0),
          pages: Math.ceil(Number(total?.count || 0) / Number(limit))
        }
      };

      // Cache for 15 minutes
      await cacheSet(cacheKey, result, 900);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching minerals:', error);
      throw new CustomError('Failed to fetch minerals', 500);
    }
  }

  async getMineralById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { includeStats = false } = req.query;

      const cacheKey = `mineral:${id}:${includeStats}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      const mineral = await db('minerals')
        .where({ id, is_active: true })
        .first();

      if (!mineral) {
        throw new CustomError('Mineral not found', 404);
      }

      let result: any = { mineral };

      if (includeStats === 'true') {
        // Get additional statistics
        const [priceStats, tradeStats, productionStats] = await Promise.all([
          db('price_data')
            .where('mineral_id', id)
            .orderBy('price_date', 'desc')
            .limit(30)
            .select('*'),
          db('trade_data')
            .where('mineral_id', id)
            .orderBy('trade_date', 'desc')
            .limit(30)
            .select('*'),
          db('production_data')
            .where('mineral_id', id)
            .orderBy('production_date', 'desc')
            .limit(30)
            .select('*')
        ]);

        result = {
          ...result,
          stats: {
            recentPrices: priceStats,
            recentTrade: tradeStats,
            recentProduction: productionStats
          }
        };
      }

      // Cache for 10 minutes
      await cacheSet(cacheKey, result, 600);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error fetching mineral:', error);
      throw new CustomError('Failed to fetch mineral', 500);
    }
  }

  async getMineralStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { period = '1Y', metric = 'all' } = req.query;

      const cacheKey = `mineral:${id}:stats:${period}:${metric}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Calculate date range based on period
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '1M':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6M':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1Y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setFullYear(now.getFullYear() - 5);
      }

      const stats: any = {};

      if (metric === 'all' || metric === 'price') {
        stats['price'] = await db('price_data')
          .where('mineral_id', id)
          .where('price_date', '>=', startDate)
          .orderBy('price_date')
          .select('*');
      }

      if (metric === 'all' || metric === 'import') {
        stats['import'] = await db('trade_data')
          .where('mineral_id', id)
          .where('trade_type', 'import')
          .where('trade_date', '>=', startDate)
          .orderBy('trade_date')
          .select('*');
      }

      if (metric === 'all' || metric === 'export') {
        stats['export'] = await db('trade_data')
          .where('mineral_id', id)
          .where('trade_type', 'export')
          .where('trade_date', '>=', startDate)
          .orderBy('trade_date')
          .select('*');
      }

      if (metric === 'all' || metric === 'volume') {
        stats['volume'] = await db('production_data')
          .where('mineral_id', id)
          .where('production_date', '>=', startDate)
          .orderBy('production_date')
          .select('*');
      }

      // Cache for 5 minutes
      await cacheSet(cacheKey, stats, 300);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error fetching mineral stats:', error);
      throw new CustomError('Failed to fetch mineral statistics', 500);
    }
  }

  async getMineralPrices(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { period = '1Y', frequency = 'daily' } = req.query;

      const cacheKey = `mineral:${id}:prices:${period}:${frequency}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '1M':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6M':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1Y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setFullYear(now.getFullYear() - 5);
      }

      let query = db('price_data')
        .where('mineral_id', id)
        .where('price_date', '>=', startDate)
        .orderBy('price_date');

      // Apply frequency grouping if needed
      if (frequency === 'weekly' || frequency === 'monthly') {
        // This would need more complex SQL for grouping
        // For now, return daily data
      }

      const prices = await query.select('*');

      // Cache for 5 minutes
      await cacheSet(cacheKey, prices, 300);

      res.json({
        success: true,
        data: prices,
      });
    } catch (error) {
      logger.error('Error fetching mineral prices:', error);
      throw new CustomError('Failed to fetch mineral prices', 500);
    }
  }

  async getMineralTrade(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { period = '1Y', type = 'both', country } = req.query;

      const cacheKey = `mineral:${id}:trade:${period}:${type}:${country}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '1M':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6M':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1Y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setFullYear(now.getFullYear() - 5);
      }

      let query = db('trade_data')
        .join('countries', 'trade_data.country_id', 'countries.id')
        .where('trade_data.mineral_id', id)
        .where('trade_data.trade_date', '>=', startDate)
        .orderBy('trade_data.trade_date', 'desc')
        .select(
          'trade_data.*',
          'countries.name as country_name',
          'countries.code_2 as country_code'
        );

      if (type !== 'both') {
        query = query.where('trade_data.trade_type', type);
      }

      if (country) {
        query = query.where('countries.name', 'ilike', `%${country}%`);
      }

      const tradeData = await query;

      // Cache for 5 minutes
      await cacheSet(cacheKey, tradeData, 300);

      res.json({
        success: true,
        data: tradeData,
      });
    } catch (error) {
      logger.error('Error fetching mineral trade data:', error);
      throw new CustomError('Failed to fetch mineral trade data', 500);
    }
  }

  async getMineralRisk(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { period = '1Y' } = req.query;

      const cacheKey = `mineral:${id}:risk:${period}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '1M':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6M':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1Y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setFullYear(now.getFullYear() - 1);
      }

      const riskData = await db('risk_assessments')
        .leftJoin('countries', 'risk_assessments.country_id', 'countries.id')
        .where('risk_assessments.mineral_id', id)
        .where('risk_assessments.assessment_date', '>=', startDate)
        .orderBy('risk_assessments.assessment_date', 'desc')
        .select(
          'risk_assessments.*',
          'countries.name as country_name',
          'countries.code_2 as country_code'
        );

      // Cache for 10 minutes
      await cacheSet(cacheKey, riskData, 600);

      res.json({
        success: true,
        data: riskData,
      });
    } catch (error) {
      logger.error('Error fetching mineral risk data:', error);
      throw new CustomError('Failed to fetch mineral risk data', 500);
    }
  }

  async getMineralForecast(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { period = '1Y', type = 'price' } = req.query;

      const cacheKey = `mineral:${id}:forecast:${period}:${type}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Calculate date range for forecast dates
      const now = new Date();
      let endDate = new Date();
      
      switch (period) {
        case '1M':
          endDate.setMonth(now.getMonth() + 1);
          break;
        case '3M':
          endDate.setMonth(now.getMonth() + 3);
          break;
        case '6M':
          endDate.setMonth(now.getMonth() + 6);
          break;
        case '1Y':
          endDate.setFullYear(now.getFullYear() + 1);
          break;
        default:
          endDate.setFullYear(now.getFullYear() + 1);
      }

      const forecasts = await db('forecasts')
        .where('mineral_id', id)
        .where('forecast_type', type)
        .where('forecast_date', '<=', endDate)
        .where('forecast_date', '>=', now)
        .orderBy('forecast_date')
        .select('*');

      // Cache for 15 minutes
      await cacheSet(cacheKey, forecasts, 900);

      res.json({
        success: true,
        data: forecasts,
      });
    } catch (error) {
      logger.error('Error fetching mineral forecasts:', error);
      throw new CustomError('Failed to fetch mineral forecasts', 500);
    }
  }
}
