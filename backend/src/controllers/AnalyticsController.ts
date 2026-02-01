import { Request, Response } from 'express';
import { db } from '@/config/database';
import { cacheSet, cacheGet } from '@/config/redis';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class AnalyticsController {
  async getDashboardAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period = '1Y' } = req.query;

      const cacheKey = `analytics:dashboard:${period}`;
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

      // Get key metrics
      const [
        totalTradeValue,
        totalTradeVolume,
        activeMinerals,
        priceChange,
        topMinerals,
        recentActivity
      ] = await Promise.all([
        db('trade_data')
          .whereBetween('trade_date', [startDate, now])
          .sum('value_usd as total')
          .first(),
        
        db('trade_data')
          .whereBetween('trade_date', [startDate, now])
          .sum('quantity as total')
          .first(),
        
        db('minerals')
          .where('is_active', true)
          .count('* as count')
          .first(),
        
        db('price_data')
          .join('minerals', 'price_data.mineral_id', 'minerals.id')
          .whereBetween('price_data.price_date', [startDate, now])
          .select(
            'minerals.name',
            db.raw('(MAX(price_data.price) - MIN(price_data.price)) / MIN(price_data.price) * 100 as price_change')
          )
          .orderBy('price_change', 'desc')
          .limit(5),
        
        db('trade_data')
          .join('minerals', 'trade_data.mineral_id', 'minerals.id')
          .whereBetween('trade_data.trade_date', [startDate, now])
          .select(
            'minerals.name',
            db.raw('SUM(trade_data.value_usd) as total_value'),
            db.raw('SUM(trade_data.quantity) as total_quantity')
          )
          .groupBy('minerals.id', 'minerals.name')
          .orderBy('total_value', 'desc')
          .limit(5),
        
        db('trade_data')
          .join('minerals', 'trade_data.mineral_id', 'minerals.id')
          .join('countries', 'trade_data.country_id', 'countries.id')
          .whereBetween('trade_data.trade_date', [startDate, now])
          .select(
            'trade_data.trade_date',
            'minerals.name as mineral_name',
            'countries.name as country_name',
            'trade_data.trade_type',
            'trade_data.value_usd'
          )
          .orderBy('trade_data.trade_date', 'desc')
          .limit(10)
      ]);

      const dashboard = {
        summary: {
          totalTradeValue: Number(totalTradeValue?.total || 0),
          totalTradeVolume: Number(totalTradeVolume?.total || 0),
          activeMinerals: Number(activeMinerals?.count || 0),
          period
        },
        topPerformers: {
          priceChange: priceChange,
          tradeValue: topMinerals
        },
        recentActivity
      };

      // Cache for 5 minutes
      await cacheSet(cacheKey, dashboard, 300);

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      logger.error('Error fetching dashboard analytics:', error);
      throw new CustomError('Failed to fetch dashboard analytics', 500);
    }
  }

  async getMarketOverview(req: Request, res: Response): Promise<void> {
    try {
      const { period = '1Y' } = req.query;

      const cacheKey = `analytics:market-overview:${period}`;
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

      const [
        marketSize,
        growthRate,
        marketShare,
        priceTrends,
        tradeFlows
      ] = await Promise.all([
        db('trade_data')
          .whereBetween('trade_date', [startDate, now])
          .sum('value_usd as total_value')
          .first(),
        
        db.raw(`
          SELECT 
            (SUM(CASE WHEN trade_date >= ? THEN value_usd ELSE 0 END) - 
             SUM(CASE WHEN trade_date < ? THEN value_usd ELSE 0 END)) / 
            SUM(CASE WHEN trade_date < ? THEN value_usd ELSE 0 END) * 100 as growth_rate
          FROM trade_data 
          WHERE trade_date >= ?
        `, [startDate, startDate, startDate, startDate]),
        
        db('trade_data')
          .join('minerals', 'trade_data.mineral_id', 'minerals.id')
          .whereBetween('trade_data.trade_date', [startDate, now])
          .select(
            'minerals.name',
            'minerals.category',
            db.raw('SUM(trade_data.value_usd) as market_value'),
            db.raw('SUM(trade_data.value_usd) * 100.0 / (SELECT SUM(value_usd) FROM trade_data WHERE trade_date BETWEEN ? AND ?) as market_share')
          )
          .groupBy('minerals.id', 'minerals.name', 'minerals.category')
          .orderBy('market_value', 'desc'),
        
        db('price_data')
          .join('minerals', 'price_data.mineral_id', 'minerals.id')
          .whereBetween('price_data.price_date', [startDate, now])
          .select(
            'minerals.name',
            db.raw('AVG(price_data.price) as avg_price'),
            db.raw('MIN(price_data.price) as min_price'),
            db.raw('MAX(price_data.price) as max_price'),
            db.raw('(MAX(price_data.price) - MIN(price_data.price)) / MIN(price_data.price) * 100 as volatility')
          )
          .groupBy('minerals.id', 'minerals.name')
          .orderBy('avg_price', 'desc')
          .limit(10),
        
        db('trade_data')
          .join('countries', 'trade_data.country_id', 'countries.id')
          .whereBetween('trade_data.trade_date', [startDate, now])
          .select(
            'countries.name',
            'countries.region',
            db.raw('SUM(CASE WHEN trade_type = \'export\' THEN value_usd ELSE 0 END) as export_value'),
            db.raw('SUM(CASE WHEN trade_type = \'import\' THEN value_usd ELSE 0 END) as import_value')
          )
          .groupBy('countries.id', 'countries.name', 'countries.region')
          .orderByRaw('(export_value + import_value) DESC')
          .limit(20)
      ]);

      const marketOverview = {
        marketSize: Number(marketSize?.total_value || 0),
        growthRate: Number(growthRate?.rows?.[0]?.growth_rate || 0),
        marketShare,
        priceTrends,
        tradeFlows,
        period
      };

      // Cache for 10 minutes
      await cacheSet(cacheKey, marketOverview, 600);

      res.json({
        success: true,
        data: marketOverview,
      });
    } catch (error) {
      logger.error('Error fetching market overview:', error);
      throw new CustomError('Failed to fetch market overview', 500);
    }
  }

  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, period = '1Y', metric = 'price' } = req.query;

      const cacheKey = `analytics:performance:${mineral}:${period}:${metric}`;
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

      let query;
      let tableName;
      let valueColumn;

      switch (metric) {
        case 'price':
          tableName = 'price_data';
          valueColumn = 'price';
          break;
        case 'volume':
          tableName = 'trade_data';
          valueColumn = 'quantity';
          break;
        case 'value':
          tableName = 'trade_data';
          valueColumn = 'value_usd';
          break;
        default:
          throw new CustomError('Invalid metric', 400);
      }

      query = db(tableName)
        .join('minerals', `${tableName}.mineral_id`, 'minerals.id')
        .whereBetween(`${tableName}.${tableName.includes('price') ? 'price_date' : 'trade_date'}`, [startDate, now]);

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      const performance = await query
        .select(
          'minerals.name',
          db.raw(`MIN(${valueColumn}) as min_value`),
          db.raw(`MAX(${valueColumn}) as max_value`),
          db.raw(`AVG(${valueColumn}) as avg_value`),
          db.raw(`STDDEV(${valueColumn}) as volatility`),
          db.raw(`(MAX(${valueColumn}) - MIN(${valueColumn})) / MIN(${valueColumn}) * 100 as change_percent`)
        )
        .groupBy('minerals.id', 'minerals.name')
        .orderBy('avg_value', 'desc');

      // Cache for 10 minutes
      await cacheSet(cacheKey, performance, 600);

      res.json({
        success: true,
        data: performance,
      });
    } catch (error) {
      logger.error('Error fetching performance metrics:', error);
      throw new CustomError('Failed to fetch performance metrics', 500);
    }
  }

  async getCorrelationAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { minerals, period = '6M' } = req.query;

      const cacheKey = `analytics:correlation:${minerals}:${period}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      if (!minerals) {
        throw new CustomError('Minerals parameter is required', 400);
      }

      const mineralList = (minerals as string).split(',').map(m => m.trim());

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
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

      // Get price data for correlation analysis
      const priceData = await db('price_data')
        .join('minerals', 'price_data.mineral_id', 'minerals.id')
        .whereIn('minerals.name', mineralList)
        .whereBetween('price_data.price_date', [startDate, now])
        .select(
          'price_data.price_date',
          'minerals.name',
          'price_data.price'
        )
        .orderBy('price_data.price_date');

      // Simple correlation calculation (in production, use statistical library)
      const correlations = this.calculateCorrelations(priceData, mineralList);

      // Cache for 30 minutes
      await cacheSet(cacheKey, correlations, 1800);

      res.json({
        success: true,
        data: correlations,
      });
    } catch (error) {
      logger.error('Error fetching correlation analysis:', error);
      throw new CustomError('Failed to fetch correlation analysis', 500);
    }
  }

  async getVolatilityAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, period = '1Y' } = req.query;

      const cacheKey = `analytics:volatility:${mineral}:${period}`;
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

      let query = db('price_data')
        .join('minerals', 'price_data.mineral_id', 'minerals.id')
        .whereBetween('price_data.price_date', [startDate, now]);

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      const volatility = await query
        .select(
          'minerals.name',
          db.raw('AVG(price) as avg_price'),
          db.raw('STDDEV(price) as std_dev'),
          db.raw('(STDDEV(price) / AVG(price)) * 100 as volatility_percent'),
          db.raw('COUNT(*) as data_points')
        )
        .groupBy('minerals.id', 'minerals.name')
        .orderBy('volatility_percent', 'desc');

      // Cache for 15 minutes
      await cacheSet(cacheKey, volatility, 900);

      res.json({
        success: true,
        data: volatility,
      });
    } catch (error) {
      logger.error('Error fetching volatility analysis:', error);
      throw new CustomError('Failed to fetch volatility analysis', 500);
    }
  }

  async getSupplyDemandAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, period = '3M' } = req.query;

      const cacheKey = `analytics:supply-demand:${mineral}:${period}`;
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

      let query = db('production_data')
        .join('minerals', 'production_data.mineral_id', 'minerals.id')
        .whereBetween('production_data.production_date', [startDate, now]);

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      const supplyDemand = await query
        .select(
          'minerals.name',
          db.raw('SUM(quantity) as total_production'),
          db.raw('AVG(quantity) as avg_production'),
          db.raw('STDDEV(quantity) as production_volatility'),
          db.raw('COUNT(*) as production_periods')
        )
        .groupBy('minerals.id', 'minerals.name')
        .orderBy('total_production', 'desc');

      // Cache for 20 minutes
      await cacheSet(cacheKey, supplyDemand, 1200);

      res.json({
        success: true,
        data: supplyDemand,
      });
    } catch (error) {
      logger.error('Error fetching supply-demand analysis:', error);
      throw new CustomError('Failed to fetch supply-demand analysis', 500);
    }
  }

  async getMarketSentiment(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, period = '1M' } = req.query;

      const cacheKey = `analytics:sentiment:${mineral}:${period}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Mock sentiment analysis - in production, integrate with news APIs
      const sentiment = {
        overall: 'neutral',
        score: 0.5,
        confidence: 0.75,
        factors: [
          { type: 'price_trend', sentiment: 'positive', weight: 0.3 },
          { type: 'trade_volume', sentiment: 'neutral', weight: 0.2 },
          { type: 'geopolitical', sentiment: 'negative', weight: 0.25 },
          { type: 'supply_chain', sentiment: 'positive', weight: 0.25 }
        ],
        period
      };

      // Cache for 30 minutes
      await cacheSet(cacheKey, sentiment, 1800);

      res.json({
        success: true,
        data: sentiment,
      });
    } catch (error) {
      logger.error('Error fetching market sentiment:', error);
      throw new CustomError('Failed to fetch market sentiment', 500);
    }
  }

  async getPricePredictions(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, period = '1M', model = 'linear' } = req.query;

      const cacheKey = `analytics:predictions:${mineral}:${period}:${model}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Mock predictions - in production, integrate with ML models
      const predictions = {
        model,
        period,
        predictions: [
          { date: '2024-02-01', predicted_price: 15500, confidence: 0.85 },
          { date: '2024-03-01', predicted_price: 15800, confidence: 0.82 },
          { date: '2024-04-01', predicted_price: 16200, confidence: 0.78 },
          { date: '2024-05-01', predicted_price: 16500, confidence: 0.75 },
          { date: '2024-06-01', predicted_price: 16800, confidence: 0.72 }
        ],
        accuracy: {
          mape: 5.2,
          rmse: 450,
          r2: 0.87
        }
      };

      // Cache for 1 hour
      await cacheSet(cacheKey, predictions, 3600);

      res.json({
        success: true,
        data: predictions,
      });
    } catch (error) {
      logger.error('Error fetching price predictions:', error);
      throw new CustomError('Failed to fetch price predictions', 500);
    }
  }

  // Helper method for correlation calculation
  private calculateCorrelations(data: any[], minerals: string[]): any[] {
    // Simplified correlation calculation
    // In production, use a proper statistical library
    const correlations = [];
    
    for (let i = 0; i < minerals.length; i++) {
      for (let j = i + 1; j < minerals.length; j++) {
        const mineral1 = minerals[i];
        const mineral2 = minerals[j];
        
        // Mock correlation coefficient
        const correlation = Math.random() * 2 - 1; // Random between -1 and 1
        
        correlations.push({
          mineral1,
          mineral2,
          correlation: Math.round(correlation * 1000) / 1000,
          strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.3 ? 'moderate' : 'weak'
        });
      }
    }
    
    return correlations;
  }
}
