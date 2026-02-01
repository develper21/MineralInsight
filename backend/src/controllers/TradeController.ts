import { Request, Response } from 'express';
import { db } from '@/config/database';
import { cacheSet, cacheGet } from '@/config/redis';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class TradeController {
  async getTradeData(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        mineral,
        country,
        type = 'both',
        period = '1Y',
        startDate,
        endDate
      } = req.query;

      const cacheKey = `trade:${JSON.stringify(req.query)}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      let query = db('trade_data')
        .join('minerals', 'trade_data.mineral_id', 'minerals.id')
        .join('countries', 'trade_data.country_id', 'countries.id')
        .select(
          'trade_data.*',
          'minerals.name as mineral_name',
          'minerals.symbol as mineral_symbol',
          'countries.name as country_name',
          'countries.code_2 as country_code'
        );

      // Apply filters
      if (mineral) {
        query = query.where('minerals.name', 'ilike', `%${mineral}%`);
      }

      if (country) {
        query = query.where('countries.name', 'ilike', `%${country}%`);
      }

      if (type !== 'both') {
        query = query.where('trade_data.trade_type', type);
      }

      // Apply date range
      if (startDate && endDate) {
        query = query.whereBetween('trade_data.trade_date', [startDate, endDate]);
      } else if (period !== 'ALL') {
        const now = new Date();
        let start = new Date();
        
        switch (period) {
          case '1M':
            start.setMonth(now.getMonth() - 1);
            break;
          case '3M':
            start.setMonth(now.getMonth() - 3);
            break;
          case '6M':
            start.setMonth(now.getMonth() - 6);
            break;
          case '1Y':
            start.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        query = query.whereBetween('trade_data.trade_date', [start, now]);
      }

      // Get total count
      const total = await query.clone().count('* as count').first();

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      const tradeData = await query
        .orderBy('trade_data.trade_date', 'desc')
        .limit(Number(limit))
        .offset(offset);

      const result = {
        tradeData,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total?.count || 0),
          pages: Math.ceil(Number(total?.count || 0) / Number(limit))
        }
      };

      // Cache for 5 minutes
      await cacheSet(cacheKey, result, 300);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching trade data:', error);
      throw new CustomError('Failed to fetch trade data', 500);
    }
  }

  async getTradeSummary(req: Request, res: Response): Promise<void> {
    try {
      const { period = '1Y', mineral, type = 'both' } = req.query;

      const cacheKey = `trade:summary:${period}:${mineral}:${type}`;
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
      }

      let query = db('trade_data')
        .join('minerals', 'trade_data.mineral_id', 'minerals.id')
        .whereBetween('trade_data.trade_date', [startDate, now]);

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      if (type !== 'both') {
        query = query.where('trade_data.trade_type', type);
      }

      const summary = await query
        .select(
          db.raw('COUNT(*) as total_transactions'),
          db.raw('SUM(trade_data.quantity) as total_quantity'),
          db.raw('SUM(trade_data.value_usd) as total_value'),
          db.raw('AVG(trade_data.price_per_unit) as avg_price'),
          db.raw('MIN(trade_data.price_per_unit) as min_price'),
          db.raw('MAX(trade_data.price_per_unit) as max_price')
        )
        .first();

      // Cache for 10 minutes
      await cacheSet(cacheKey, summary, 600);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logger.error('Error fetching trade summary:', error);
      throw new CustomError('Failed to fetch trade summary', 500);
    }
  }

  async getTopCountries(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, type = 'import', limit = 10, period = '1Y' } = req.query;

      const cacheKey = `trade:top-countries:${mineral}:${type}:${limit}:${period}`;
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
      }

      let query = db('trade_data')
        .join('countries', 'trade_data.country_id', 'countries.id')
        .join('minerals', 'trade_data.mineral_id', 'minerals.id')
        .where('trade_data.trade_type', type)
        .whereBetween('trade_data.trade_date', [startDate, now]);

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      const topCountries = await query
        .select(
          'countries.name',
          'countries.code_2',
          db.raw('SUM(trade_data.value_usd) as total_value'),
          db.raw('SUM(trade_data.quantity) as total_quantity'),
          db.raw('COUNT(*) as transaction_count')
        )
        .groupBy('countries.id', 'countries.name', 'countries.code_2')
        .orderBy('total_value', 'desc')
        .limit(Number(limit));

      // Cache for 15 minutes
      await cacheSet(cacheKey, topCountries, 900);

      res.json({
        success: true,
        data: topCountries,
      });
    } catch (error) {
      logger.error('Error fetching top countries:', error);
      throw new CustomError('Failed to fetch top countries', 500);
    }
  }

  async getTradeTrends(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, country, type = 'both', period = '1Y', frequency = 'monthly' } = req.query;

      const cacheKey = `trade:trends:${mineral}:${country}:${type}:${period}:${frequency}`;
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
      }

      let query = db('trade_data')
        .join('minerals', 'trade_data.mineral_id', 'minerals.id')
        .join('countries', 'trade_data.country_id', 'countries.id')
        .whereBetween('trade_data.trade_date', [startDate, now]);

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      if (country) {
        query = query.where('countries.name', country);
      }

      if (type !== 'both') {
        query = query.where('trade_data.trade_type', type);
      }

      // Group by frequency
      let dateFormat = 'YYYY-MM-DD';
      if (frequency === 'weekly') {
        dateFormat = 'YYYY-"W"WW';
      } else if (frequency === 'monthly') {
        dateFormat = 'YYYY-MM';
      }

      const trends = await query
        .select(
          db.raw(`DATE_TRUNC('${frequency}', trade_data.trade_date) as period`),
          db.raw('SUM(trade_data.value_usd) as total_value'),
          db.raw('SUM(trade_data.quantity) as total_quantity'),
          db.raw('AVG(trade_data.price_per_unit) as avg_price'),
          db.raw('COUNT(*) as transaction_count')
        )
        .groupBy(db.raw(`DATE_TRUNC('${frequency}', trade_data.trade_date)`))
        .orderBy('period', 'asc');

      // Cache for 10 minutes
      await cacheSet(cacheKey, trends, 600);

      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      logger.error('Error fetching trade trends:', error);
      throw new CustomError('Failed to fetch trade trends', 500);
    }
  }

  async getTradeByCountry(req: Request, res: Response): Promise<void> {
    try {
      const { country } = req.params;
      const { mineral, type = 'both', period = '1Y', page = 1, limit = 20 } = req.query;

      const cacheKey = `trade:country:${country}:${JSON.stringify(req.query)}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      let query = db('trade_data')
        .join('minerals', 'trade_data.mineral_id', 'minerals.id')
        .join('countries', 'trade_data.country_id', 'countries.id')
        .where('countries.name', 'ilike', `%${country}%`)
        .select(
          'trade_data.*',
          'minerals.name as mineral_name',
          'minerals.symbol as mineral_symbol',
          'countries.name as country_name',
          'countries.code_2 as country_code'
        );

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      if (type !== 'both') {
        query = query.where('trade_data.trade_type', type);
      }

      // Apply date range
      if (period !== 'ALL') {
        const now = new Date();
        let start = new Date();
        
        switch (period) {
          case '1M':
            start.setMonth(now.getMonth() - 1);
            break;
          case '3M':
            start.setMonth(now.getMonth() - 3);
            break;
          case '6M':
            start.setMonth(now.getMonth() - 6);
            break;
          case '1Y':
            start.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        query = query.whereBetween('trade_data.trade_date', [start, now]);
      }

      // Get total count
      const total = await query.clone().count('* as count').first();

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      const tradeData = await query
        .orderBy('trade_data.trade_date', 'desc')
        .limit(Number(limit))
        .offset(offset);

      const result = {
        tradeData,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total?.count || 0),
          pages: Math.ceil(Number(total?.count || 0) / Number(limit))
        }
      };

      // Cache for 5 minutes
      await cacheSet(cacheKey, result, 300);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching trade by country:', error);
      throw new CustomError('Failed to fetch trade by country', 500);
    }
  }

  async getTradeByMineral(req: Request, res: Response): Promise<void> {
    try {
      const { mineral } = req.params;
      const { country, type = 'both', period = '1Y', page = 1, limit = 20 } = req.query;

      const cacheKey = `trade:mineral:${mineral}:${JSON.stringify(req.query)}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      let query = db('trade_data')
        .join('minerals', 'trade_data.mineral_id', 'minerals.id')
        .join('countries', 'trade_data.country_id', 'countries.id')
        .where('minerals.name', 'ilike', `%${mineral}%`)
        .select(
          'trade_data.*',
          'minerals.name as mineral_name',
          'minerals.symbol as mineral_symbol',
          'countries.name as country_name',
          'countries.code_2 as country_code'
        );

      if (country) {
        query = query.where('countries.name', country);
      }

      if (type !== 'both') {
        query = query.where('trade_data.trade_type', type);
      }

      // Apply date range
      if (period !== 'ALL') {
        const now = new Date();
        let start = new Date();
        
        switch (period) {
          case '1M':
            start.setMonth(now.getMonth() - 1);
            break;
          case '3M':
            start.setMonth(now.getMonth() - 3);
            break;
          case '6M':
            start.setMonth(now.getMonth() - 6);
            break;
          case '1Y':
            start.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        query = query.whereBetween('trade_data.trade_date', [start, now]);
      }

      // Get total count
      const total = await query.clone().count('* as count').first();

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      const tradeData = await query
        .orderBy('trade_data.trade_date', 'desc')
        .limit(Number(limit))
        .offset(offset);

      const result = {
        tradeData,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total?.count || 0),
          pages: Math.ceil(Number(total?.count || 0) / Number(limit))
        }
      };

      // Cache for 5 minutes
      await cacheSet(cacheKey, result, 300);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching trade by mineral:', error);
      throw new CustomError('Failed to fetch trade by mineral', 500);
    }
  }
}
