import { Request, Response } from 'express';
import { db } from '@/config/database';
import { cacheSet, cacheGet } from '@/config/redis';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class ForecastController {
  async getPriceForecasts(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, period = '1Y', model = 'ensemble', confidence = '95' } = req.query;

      const cacheKey = `forecast:prices:${mineral}:${period}:${model}:${confidence}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Calculate date range for forecast
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
      }

      let query = db('forecasts')
        .join('minerals', 'forecasts.mineral_id', 'minerals.id')
        .where('forecasts.forecast_type', 'price')
        .where('forecasts.model_type', model)
        .where('forecasts.confidence_level', confidence)
        .where('forecasts.forecast_date', '<=', endDate)
        .where('forecasts.forecast_date', '>=', now)
        .select(
          'forecasts.*',
          'minerals.name as mineral_name',
          'minerals.symbol as mineral_symbol',
          'minerals.current_price'
        )
        .orderBy('forecasts.forecast_date');

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      const forecasts = await query;

      // Calculate forecast statistics
      const forecastStats = this.calculateForecastStats(forecasts);

      const result = {
        forecasts,
        stats: forecastStats,
        metadata: {
          model,
          confidence: `${confidence}%`,
          period,
          generatedAt: now.toISOString()
        }
      };

      // Cache for 30 minutes
      await cacheSet(cacheKey, result, 1800);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching price forecasts:', error);
      throw new CustomError('Failed to fetch price forecasts', 500);
    }
  }

  async getDemandForecasts(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, period = '3M', region } = req.query;

      const cacheKey = `forecast:demand:${mineral}:${period}:${region}`;
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
      let endDate = new Date();
      
      switch (period) {
        case '3M':
          endDate.setMonth(now.getMonth() + 3);
          break;
        case '6M':
          endDate.setMonth(now.getMonth() + 6);
          break;
        case '1Y':
          endDate.setFullYear(now.getFullYear() + 1);
          break;
        case '2Y':
          endDate.setFullYear(now.getFullYear() + 2);
          break;
      }

      let query = db('forecasts')
        .join('minerals', 'forecasts.mineral_id', 'minerals.id')
        .where('forecasts.forecast_type', 'demand')
        .where('forecasts.forecast_date', '<=', endDate)
        .where('forecasts.forecast_date', '>=', now)
        .select(
          'forecasts.*',
          'minerals.name as mineral_name',
          'minerals.symbol as mineral_symbol'
        )
        .orderBy('forecasts.forecast_date');

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      const forecasts = await query;

      // Group by region if specified
      let demandForecasts = forecasts;
      if (region) {
        demandForecasts = forecasts.filter(f => 
          f.metadata && JSON.parse(f.metadata).region === region
        );
      }

      // Calculate demand growth rates
      const demandGrowth = this.calculateGrowthRates(demandForecasts);

      const result = {
        forecasts: demandForecasts,
        growthAnalysis: demandGrowth,
        metadata: {
          period,
          region: region || 'Global',
          generatedAt: now.toISOString()
        }
      };

      // Cache for 45 minutes
      await cacheSet(cacheKey, result, 2700);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching demand forecasts:', error);
      throw new CustomError('Failed to fetch demand forecasts', 500);
    }
  }

  async getSupplyForecasts(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, period = '3M', country } = req.query;

      const cacheKey = `forecast:supply:${mineral}:${period}:${country}`;
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
      let endDate = new Date();
      
      switch (period) {
        case '3M':
          endDate.setMonth(now.getMonth() + 3);
          break;
        case '6M':
          endDate.setMonth(now.getMonth() + 6);
          break;
        case '1Y':
          endDate.setFullYear(now.getFullYear() + 1);
          break;
        case '2Y':
          endDate.setFullYear(now.getFullYear() + 2);
          break;
      }

      let query = db('forecasts')
        .join('minerals', 'forecasts.mineral_id', 'minerals.id')
        .leftJoin('countries', 'forecasts.country_id', 'countries.id')
        .where('forecasts.forecast_type', 'supply')
        .where('forecasts.forecast_date', '<=', endDate)
        .where('forecasts.forecast_date', '>=', now)
        .select(
          'forecasts.*',
          'minerals.name as mineral_name',
          'minerals.symbol as mineral_symbol',
          'countries.name as country_name',
          'countries.code_2 as country_code'
        )
        .orderBy('forecasts.forecast_date');

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      if (country) {
        query = query.where('countries.name', country);
      }

      const forecasts = await query;

      // Analyze supply constraints
      const supplyConstraints = this.analyzeSupplyConstraints(forecasts);
      const productionCapacity = this.estimateProductionCapacity(forecasts);

      const result = {
        forecasts,
        analysis: {
          constraints: supplyConstraints,
          capacity: productionCapacity
        },
        metadata: {
          period,
          country: country || 'Global',
          generatedAt: now.toISOString()
        }
      };

      // Cache for 45 minutes
      await cacheSet(cacheKey, result, 2700);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching supply forecasts:', error);
      throw new CustomError('Failed to fetch supply forecasts', 500);
    }
  }

  async getTradeForecasts(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, country, type = 'both', period = '3M' } = req.query;

      const cacheKey = `forecast:trade:${mineral}:${country}:${type}:${period}`;
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
      let endDate = new Date();
      
      switch (period) {
        case '3M':
          endDate.setMonth(now.getMonth() + 3);
          break;
        case '6M':
          endDate.setMonth(now.getMonth() + 6);
          break;
        case '1Y':
          endDate.setFullYear(now.getFullYear() + 1);
          break;
      }

      let query = db('forecasts')
        .join('minerals', 'forecasts.mineral_id', 'minerals.id')
        .leftJoin('countries', 'forecasts.country_id', 'countries.id')
        .where('forecasts.forecast_type', 'trade')
        .where('forecasts.forecast_date', '<=', endDate)
        .where('forecasts.forecast_date', '>=', now)
        .select(
          'forecasts.*',
          'minerals.name as mineral_name',
          'minerals.symbol as mineral_symbol',
          'countries.name as country_name',
          'countries.code_2 as country_code'
        )
        .orderBy('forecasts.forecast_date');

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      if (country) {
        query = query.where('countries.name', country);
      }

      if (type !== 'both') {
        query = query.whereRaw("JSON_EXTRACT(forecasts.metadata, '$.trade_type') = ?", [type]);
      }

      const forecasts = await query;

      // Analyze trade patterns
      const tradePatterns = this.analyzeTradePatterns(forecasts);
      const tradeBalance = this.calculateTradeBalance(forecasts);

      const result = {
        forecasts,
        analysis: {
          patterns: tradePatterns,
          balance: tradeBalance
        },
        metadata: {
          period,
          type,
          generatedAt: now.toISOString()
        }
      };

      // Cache for 30 minutes
      await cacheSet(cacheKey, result, 1800);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching trade forecasts:', error);
      throw new CustomError('Failed to fetch trade forecasts', 500);
    }
  }

  async getScenarioAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, scenario = 'baseline', period = '6M' } = req.query;

      const cacheKey = `forecast:scenarios:${mineral}:${scenario}:${period}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Mock scenario analysis - in production, integrate with scenario planning tools
      const scenarios = {
        baseline: {
          description: 'Business as usual scenario',
          assumptions: ['Current trends continue', 'No major disruptions', 'Stable demand growth'],
          outlook: 'moderate growth',
          confidence: 0.75
        },
        optimistic: {
          description: 'Best case scenario',
          assumptions: ['Increased demand', 'Supply chain improvements', 'Favorable policies'],
          outlook: 'strong growth',
          confidence: 0.60
        },
        pessimistic: {
          description: 'Worst case scenario',
          assumptions: ['Supply disruptions', 'Reduced demand', 'Trade restrictions'],
          outlook: 'decline',
          confidence: 0.65
        },
        disruption: {
          description: 'Major supply disruption scenario',
          assumptions: ['Geopolitical conflicts', 'Natural disasters', 'Production issues'],
          outlook: 'volatile',
          confidence: 0.40
        }
      };

      const selectedScenario = scenarios[scenario as keyof typeof scenarios];
      
      if (!selectedScenario) {
        throw new CustomError('Invalid scenario', 400);
      }

      // Generate scenario-specific forecasts
      const scenarioForecasts = this.generateScenarioForecasts(mineral as string, scenario as string, period as string);

      const result = {
        scenario,
        description: selectedScenario.description,
        assumptions: selectedScenario.assumptions,
        outlook: selectedScenario.outlook,
        confidence: selectedScenario.confidence,
        forecasts: scenarioForecasts,
        metadata: {
          period,
          generatedAt: new Date().toISOString()
        }
      };

      // Cache for 1 hour
      await cacheSet(cacheKey, result, 3600);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error fetching scenario analysis:', error);
      throw new CustomError('Failed to fetch scenario analysis', 500);
    }
  }

  async getForecastAccuracy(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, model, period = '1Y' } = req.query;

      const cacheKey = `forecast:accuracy:${mineral}:${model}:${period}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Calculate date range for historical comparison
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

      // Get historical forecasts and actual values
      let query = db('forecasts')
        .join('minerals', 'forecasts.mineral_id', 'minerals.id')
        .where('forecasts.forecast_date', '<=', now)
        .where('forecasts.created_date', '>=', startDate)
        .whereNotNull('forecasts.accuracy_score')
        .select(
          'forecasts.*',
          'minerals.name as mineral_name'
        )
        .orderBy('forecasts.created_date', 'desc');

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      if (model) {
        query = query.where('forecasts.model_type', model);
      }

      const historicalForecasts = await query;

      // Calculate accuracy metrics
      const accuracyMetrics = this.calculateAccuracyMetrics(historicalForecasts);
      const modelComparison = this.compareModels(historicalForecasts);

      const result = {
        accuracyMetrics,
        modelComparison,
        sampleSize: historicalForecasts.length,
        period,
        metadata: {
          generatedAt: now.toISOString()
        }
      };

      // Cache for 2 hours
      await cacheSet(cacheKey, result, 7200);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching forecast accuracy:', error);
      throw new CustomError('Failed to fetch forecast accuracy', 500);
    }
  }

  // Helper methods
  private calculateForecastStats(forecasts: any[]): any {
    if (forecasts.length === 0) return null;

    const values = forecasts.map(f => f.forecast_value);
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    return {
      avgValue,
      minValue,
      maxValue,
      range: maxValue - minValue,
      volatility: this.calculateVolatility(values),
      trend: this.calculateTrend(values)
    };
  }

  private calculateGrowthRates(forecasts: any[]): any[] {
    const grouped = forecasts.reduce((acc, forecast) => {
      const mineral = forecast.mineral_name;
      if (!acc[mineral]) acc[mineral] = [];
      acc[mineral].push(forecast);
      return acc;
    }, {});

    return Object.keys(grouped).map(mineral => {
      const mineralForecasts = grouped[mineral].sort((a, b) => 
        new Date(a.forecast_date).getTime() - new Date(b.forecast_date).getTime()
      );

      const growthRates = [];
      for (let i = 1; i < mineralForecasts.length; i++) {
        const prev = mineralForecasts[i - 1].forecast_value;
        const curr = mineralForecasts[i].forecast_value;
        const growth = ((curr - prev) / prev) * 100;
        growthRates.push(growth);
      }

      return {
        mineral,
        avgGrowthRate: growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length,
        forecasts: mineralForecasts
      };
    });
  }

  private analyzeSupplyConstraints(forecasts: any[]): any[] {
    // Identify potential supply constraints based on forecast data
    return forecasts
      .filter(f => f.forecast_value < 1000) // Low supply threshold
      .map(f => ({
        mineral: f.mineral_name,
        country: f.country_name,
        constraintLevel: this.getConstraintLevel(f.forecast_value),
        forecastValue: f.forecast_value,
        forecastDate: f.forecast_date
      }));
  }

  private estimateProductionCapacity(forecasts: any[]): any {
    const capacity = forecasts.reduce((acc, forecast) => {
      const mineral = forecast.mineral_name;
      if (!acc[mineral]) acc[mineral] = [];
      acc[mineral].push(forecast.forecast_value);
      return acc;
    }, {});

    return Object.keys(capacity).map(mineral => {
      const values = capacity[mineral];
      return {
        mineral,
        avgCapacity: values.reduce((sum, val) => sum + val, 0) / values.length,
        maxCapacity: Math.max(...values),
        utilizationRate: this.calculateUtilizationRate(values)
      };
    });
  }

  private analyzeTradePatterns(forecasts: any[]): any[] {
    // Analyze trade patterns from forecast data
    const patterns = forecasts.reduce((acc, forecast) => {
      const metadata = JSON.parse(forecast.metadata || '{}');
      const pattern = metadata.pattern || 'unknown';
      if (!acc[pattern]) acc[pattern] = [];
      acc[pattern].push(forecast);
      return acc;
    }, {});

    return Object.keys(patterns).map(pattern => ({
      pattern,
      count: patterns[pattern].length,
      avgValue: patterns[pattern].reduce((sum, f) => sum + f.forecast_value, 0) / patterns[pattern].length
    }));
  }

  private calculateTradeBalance(forecasts: any[]): any {
    const balance = forecasts.reduce((acc, forecast) => {
      const metadata = JSON.parse(forecast.metadata || '{}');
      const type = metadata.trade_type || 'unknown';
      if (!acc[type]) acc[type] = 0;
      acc[type] += forecast.forecast_value;
      return acc;
    }, {});

    return {
      imports: balance.import || 0,
      exports: balance.export || 0,
      balance: (balance.export || 0) - (balance.import || 0)
    };
  }

  private generateScenarioForecasts(mineral: string, scenario: string, period: string): any[] {
    // Mock scenario forecasts - in production, use actual scenario models
    const baseValues = {
      lithium: { baseline: 15000, optimistic: 18000, pessimistic: 12000, disruption: 20000 },
      cobalt: { baseline: 75000, optimistic: 85000, pessimistic: 65000, disruption: 95000 },
      copper: { baseline: 8500, optimistic: 9500, pessimistic: 7500, disruption: 11000 }
    };

    const baseValue = baseValues[mineral.toLowerCase()]?.[scenario] || 10000;
    const forecasts = [];

    let months = 3;
    switch (period) {
      case '6M': months = 6; break;
      case '1Y': months = 12; break;
      case '2Y': months = 24; break;
    }

    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      const variance = scenario === 'disruption' ? 0.3 : 0.1;
      const value = baseValue * (1 + (Math.random() - 0.5) * variance);

      forecasts.push({
        forecast_date: date.toISOString().split('T')[0],
        forecast_value: value,
        confidence_lower: value * 0.8,
        confidence_upper: value * 1.2,
        scenario
      });
    }

    return forecasts;
  }

  private calculateAccuracyMetrics(forecasts: any[]): any {
    if (forecasts.length === 0) return null;

    const accuracyScores = forecasts.map(f => f.accuracy_score || 0);
    const avgAccuracy = accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length;
    const maxAccuracy = Math.max(...accuracyScores);
    const minAccuracy = Math.min(...accuracyScores);

    return {
      avgAccuracy,
      maxAccuracy,
      minAccuracy,
      accuracyDistribution: this.getAccuracyDistribution(accuracyScores)
    };
  }

  private compareModels(forecasts: any[]): any[] {
    const models = forecasts.reduce((acc, forecast) => {
      const model = forecast.model_type;
      if (!acc[model]) acc[model] = [];
      acc[model].push(forecast);
      return acc;
    }, {});

    return Object.keys(models).map(model => {
      const modelForecasts = models[model];
      const avgAccuracy = modelForecasts.reduce((sum, f) => sum + (f.accuracy_score || 0), 0) / modelForecasts.length;
      
      return {
        model,
        avgAccuracy,
        forecastCount: modelForecasts.length,
        reliability: this.getReliability(avgAccuracy)
      };
    });
  }

  private calculateVolatility(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateTrend(values: number[]): string {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  private getConstraintLevel(value: number): string {
    if (value < 500) return 'critical';
    if (value < 1000) return 'high';
    if (value < 5000) return 'medium';
    return 'low';
  }

  private calculateUtilizationRate(values: number[]): number {
    const maxCapacity = Math.max(...values);
    const avgUtilization = values.reduce((sum, val) => sum + (val / maxCapacity), 0) / values.length;
    return avgUtilization * 100;
  }

  private getAccuracyDistribution(scores: number[]): any {
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
    scores.forEach(score => {
      if (score >= 90) distribution.excellent++;
      else if (score >= 75) distribution.good++;
      else if (score >= 60) distribution.fair++;
      else distribution.poor++;
    });
    return distribution;
  }

  private getReliability(accuracy: number): string {
    if (accuracy >= 90) return 'very high';
    if (accuracy >= 80) return 'high';
    if (accuracy >= 70) return 'medium';
    return 'low';
  }
}
