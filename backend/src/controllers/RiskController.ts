import { Request, Response } from 'express';
import { db } from '@/config/database';
import { cacheSet, cacheGet } from '@/config/redis';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class RiskController {
  async getRiskIndex(req: Request, res: Response): Promise<void> {
    try {
      const { period = '1Y' } = req.query;

      const cacheKey = `risk:index:${period}`;
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
        overallRisk,
        riskByType,
        riskByMineral,
        riskTrends,
        highRiskAreas
      ] = await Promise.all([
        // Overall risk score
        db('risk_assessments')
          .whereBetween('assessment_date', [startDate, now])
          .avg('risk_score as overall_score')
          .first(),
        
        // Risk breakdown by type
        db('risk_assessments')
          .whereBetween('assessment_date', [startDate, now])
          .select(
            'risk_type',
            db.raw('AVG(risk_score) as avg_score'),
            db.raw('COUNT(*) as assessment_count')
          )
          .groupBy('risk_type')
          .orderBy('avg_score', 'desc'),
        
        // Risk by mineral
        db('risk_assessments')
          .join('minerals', 'risk_assessments.mineral_id', 'minerals.id')
          .whereBetween('risk_assessments.assessment_date', [startDate, now])
          .select(
            'minerals.name',
            'minerals.category',
            db.raw('AVG(risk_assessments.risk_score) as avg_score'),
            db.raw('MAX(risk_assessments.risk_score) as max_score'),
            db.raw('COUNT(*) as assessment_count')
          )
          .groupBy('minerals.id', 'minerals.name', 'minerals.category')
          .orderBy('avg_score', 'desc')
          .limit(10),
        
        // Risk trends over time
        db('risk_assessments')
          .whereBetween('assessment_date', [startDate, now])
          .select(
            db.raw('DATE_TRUNC(\'month\', assessment_date) as month'),
            db.raw('AVG(risk_score) as avg_score'),
            db.raw('COUNT(*) as assessment_count')
          )
          .groupBy(db.raw('DATE_TRUNC(\'month\', assessment_date)'))
          .orderBy('month'),
        
        // High risk areas
        db('risk_assessments')
          .join('countries', 'risk_assessments.country_id', 'countries.id')
          .join('minerals', 'risk_assessments.mineral_id', 'minerals.id')
          .whereBetween('risk_assessments.assessment_date', [startDate, now])
          .where('risk_assessments.risk_score', '>', 70)
          .select(
            'countries.name as country_name',
            'countries.region',
            'minerals.name as mineral_name',
            'risk_assessments.risk_type',
            'risk_assessments.risk_score',
            'risk_assessments.risk_level',
            'risk_assessments.assessment_date'
          )
          .orderBy('risk_assessments.risk_score', 'desc')
          .limit(20)
      ]);

      const riskIndex = {
        overall: {
          score: Number(overallRisk?.overall_score || 0),
          level: this.getRiskLevel(Number(overallRisk?.overall_score || 0))
        },
        breakdown: {
          byType: riskByType,
          byMineral: riskByMineral
        },
        trends: riskTrends,
        highRiskAreas,
        period
      };

      // Cache for 10 minutes
      await cacheSet(cacheKey, riskIndex, 600);

      res.json({
        success: true,
        data: riskIndex,
      });
    } catch (error) {
      logger.error('Error fetching risk index:', error);
      throw new CustomError('Failed to fetch risk index', 500);
    }
  }

  async getMineralRisk(req: Request, res: Response): Promise<void> {
    try {
      const { mineral: mineralName } = req.params;
      const { period = '1Y', factors } = req.query;

      const cacheKey = `risk:mineral:${mineralName}:${period}:${factors}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Get mineral info
      const mineral = await db('minerals')
        .where('name', mineralName)
        .first();

      if (!mineral) {
        throw new CustomError('Mineral not found', 404);
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

      let query = db('risk_assessments')
        .leftJoin('countries', 'risk_assessments.country_id', 'countries.id')
        .where('risk_assessments.mineral_id', mineral.id)
        .whereBetween('risk_assessments.assessment_date', [startDate, now]);

      if (factors) {
        const factorList = (factors as string).split(',');
        query = query.whereIn('risk_assessments.risk_type', factorList);
      }

      const riskData = await query
        .select(
          'risk_assessments.*',
          'countries.name as country_name',
          'countries.code_2 as country_code'
        )
        .orderBy('risk_assessments.assessment_date', 'desc');

      // Calculate risk metrics
      const riskMetrics = {
        overall: {
          avgScore: riskData.reduce((sum, r) => sum + r.risk_score, 0) / riskData.length || 0,
          maxScore: Math.max(...riskData.map(r => r.risk_score), 0),
          minScore: Math.min(...riskData.map(r => r.risk_score), 100),
          level: this.getRiskLevel(riskData.reduce((sum, r) => sum + r.risk_score, 0) / riskData.length || 0)
        },
        byType: this.groupByType(riskData),
        byCountry: this.groupByCountry(riskData),
        trends: this.calculateTrends(riskData)
      };

      const result = {
        mineral: {
          id: mineral.id,
          name: mineral.name,
          symbol: mineral.symbol,
          category: mineral.category
        },
        riskData,
        riskMetrics,
        period
      };

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
      logger.error('Error fetching mineral risk:', error);
      throw new CustomError('Failed to fetch mineral risk', 500);
    }
  }

  async getCountryRisk(req: Request, res: Response): Promise<void> {
    try {
      const { country: countryName } = req.params;
      const { mineral, period = '1Y' } = req.query;

      const cacheKey = `risk:country:${countryName}:${mineral}:${period}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Get country info
      const country = await db('countries')
        .where('name', 'ilike', `%${countryName}%`)
        .first();

      if (!country) {
        throw new CustomError('Country not found', 404);
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

      let query = db('risk_assessments')
        .join('minerals', 'risk_assessments.mineral_id', 'minerals.id')
        .where('risk_assessments.country_id', country.id)
        .whereBetween('risk_assessments.assessment_date', [startDate, now]);

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      const riskData = await query
        .select(
          'risk_assessments.*',
          'minerals.name as mineral_name',
          'minerals.symbol as mineral_symbol',
          'minerals.category as mineral_category'
        )
        .orderBy('risk_assessments.assessment_date', 'desc');

      const riskMetrics = {
        overall: {
          avgScore: riskData.reduce((sum, r) => sum + r.risk_score, 0) / riskData.length || 0,
          maxScore: Math.max(...riskData.map(r => r.risk_score), 0),
          level: this.getRiskLevel(riskData.reduce((sum, r) => sum + r.risk_score, 0) / riskData.length || 0)
        },
        byMineral: this.groupByMineral(riskData),
        byType: this.groupByType(riskData)
      };

      const result = {
        country: {
          id: country.id,
          name: country.name,
          code_2: country.code_2,
          region: country.region
        },
        riskData,
        riskMetrics,
        period
      };

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
      logger.error('Error fetching country risk:', error);
      throw new CustomError('Failed to fetch country risk', 500);
    }
  }

  async getSupplyChainRisk(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, period = '3M' } = req.query;

      const cacheKey = `risk:supply-chain:${mineral}:${period}`;
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

      let query = db('risk_assessments')
        .join('minerals', 'risk_assessments.mineral_id', 'minerals.id')
        .leftJoin('countries', 'risk_assessments.country_id', 'countries.id')
        .where('risk_assessments.risk_type', 'supply')
        .whereBetween('risk_assessments.assessment_date', [startDate, now]);

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      const supplyChainRisks = await query
        .select(
          'risk_assessments.*',
          'minerals.name as mineral_name',
          'countries.name as country_name',
          'countries.region'
        )
        .orderBy('risk_assessments.risk_score', 'desc');

      // Analyze supply chain bottlenecks
      const bottlenecks = this.identifyBottlenecks(supplyChainRisks);
      const riskConcentration = this.calculateRiskConcentration(supplyChainRisks);

      const result = {
        supplyChainRisks,
        bottlenecks,
        riskConcentration,
        period
      };

      // Cache for 15 minutes
      await cacheSet(cacheKey, result, 900);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching supply chain risk:', error);
      throw new CustomError('Failed to fetch supply chain risk', 500);
    }
  }

  async getGeopoliticalRisk(req: Request, res: Response): Promise<void> {
    try {
      const { region, period = '1M' } = req.query;

      const cacheKey = `risk:geopolitical:${region}:${period}`;
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
      }

      let query = db('risk_assessments')
        .join('countries', 'risk_assessments.country_id', 'countries.id')
        .join('minerals', 'risk_assessments.mineral_id', 'minerals.id')
        .where('risk_assessments.risk_type', 'geopolitical')
        .whereBetween('risk_assessments.assessment_date', [startDate, now]);

      if (region) {
        query = query.where('countries.region', region);
      }

      const geoRisks = await query
        .select(
          'risk_assessments.*',
          'countries.name as country_name',
          'countries.region',
          'countries.subregion',
          'minerals.name as mineral_name',
          'minerals.category'
        )
        .orderBy('risk_assessments.risk_score', 'desc');

      // Analyze regional risk patterns
      const regionalAnalysis = this.analyzeRegionalRisks(geoRisks);
      const hotspots = this.identifyHotspots(geoRisks);

      const result = {
        geoRisks,
        regionalAnalysis,
        hotspots,
        period
      };

      // Cache for 20 minutes
      await cacheSet(cacheKey, result, 1200);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching geopolitical risk:', error);
      throw new CustomError('Failed to fetch geopolitical risk', 500);
    }
  }

  async getRiskScenarios(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, scenario } = req.query;

      const cacheKey = `risk:scenarios:${mineral}:${scenario}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Mock scenario analysis - in production, integrate with risk modeling tools
      const scenarios = [
        {
          name: 'Supply Disruption',
          description: 'Major supplier faces production issues',
          probability: 0.25,
          impact: 'high',
          affectedMinerals: ['Lithium', 'Cobalt', 'Rare Earth Elements'],
          estimatedPriceIncrease: '40-60%',
          duration: '3-6 months',
          mitigation: 'Diversify suppliers, increase inventory'
        },
        {
          name: 'Price Spike',
          description: 'Sudden increase in demand causes price volatility',
          probability: 0.35,
          impact: 'medium',
          affectedMinerals: ['Copper', 'Nickel', 'Aluminum'],
          estimatedPriceIncrease: '20-30%',
          duration: '1-3 months',
          mitigation: 'Hedging strategies, long-term contracts'
        },
        {
          name: 'Demand Surge',
          description: 'New technology drives increased demand',
          probability: 0.45,
          impact: 'medium',
          affectedMinerals: ['Lithium', 'Graphite', 'Nickel'],
          estimatedPriceIncrease: '15-25%',
          duration: '6-12 months',
          mitigation: 'Secure supply agreements, explore alternatives'
        }
      ];

      let filteredScenarios = scenarios;
      if (scenario) {
        filteredScenarios = scenarios.filter(s => 
          s.name.toLowerCase().includes((scenario as string).toLowerCase())
        );
      }

      if (mineral) {
        filteredScenarios = filteredScenarios.filter(s =>
          s.affectedMinerals.some((m: string) => 
            m.toLowerCase().includes((mineral as string).toLowerCase())
          )
        );
      }

      // Cache for 30 minutes
      await cacheSet(cacheKey, filteredScenarios, 1800);

      res.json({
        success: true,
        data: filteredScenarios,
      });
    } catch (error) {
      logger.error('Error fetching risk scenarios:', error);
      throw new CustomError('Failed to fetch risk scenarios', 500);
    }
  }

  async getMitigationStrategies(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, riskLevel } = req.query;

      const cacheKey = `risk:mitigation:${mineral}:${riskLevel}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Mock mitigation strategies - in production, integrate with risk management framework
      const strategies = [
        {
          riskType: 'supply',
          riskLevel: 'high',
          strategies: [
            'Diversify supplier base across multiple regions',
            'Establish strategic partnerships with key suppliers',
            'Maintain safety stock of critical materials',
            'Develop alternative material specifications'
          ],
          implementation: '6-12 months',
          cost: 'Medium',
          effectiveness: 'High'
        },
        {
          riskType: 'price',
          riskLevel: 'medium',
          strategies: [
            'Implement hedging programs',
            'Negotiate long-term supply contracts',
            'Explore price-indexed contracts',
            'Monitor market trends continuously'
          ],
          implementation: '3-6 months',
          cost: 'Low',
          effectiveness: 'Medium'
        },
        {
          riskType: 'geopolitical',
          riskLevel: 'critical',
          strategies: [
            'Geographic diversification of supply chain',
            'Government relations and diplomatic engagement',
            'Trade compliance monitoring',
            'Contingency planning for trade restrictions'
          ],
          implementation: '12-18 months',
          cost: 'High',
          effectiveness: 'High'
        }
      ];

      let filteredStrategies = strategies;
      if (riskLevel) {
        filteredStrategies = strategies.filter(s => s.riskLevel === riskLevel);
      }

      // Cache for 1 hour
      await cacheSet(cacheKey, filteredStrategies, 3600);

      res.json({
        success: true,
        data: filteredStrategies,
      });
    } catch (error) {
      logger.error('Error fetching mitigation strategies:', error);
      throw new CustomError('Failed to fetch mitigation strategies', 500);
    }
  }

  // Helper methods
  private getRiskLevel(score: number): string {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private groupByType(data: any[]): any[] {
    const grouped: any = {};
    data.forEach(item => {
      if (!grouped[item.risk_type]) {
        grouped[item.risk_type] = [];
      }
      grouped[item.risk_type].push(item);
    });
    
    return Object.keys(grouped).map(type => ({
      riskType: type,
      assessments: grouped[type],
      avgScore: grouped[type].reduce((sum: number, item: any) => sum + item.risk_score, 0) / grouped[type].length
    }));
  }

  private groupByCountry(data: any[]): any[] {
    const grouped: any = {};
    data.forEach(item => {
      const key = item.country_name || 'Global';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    
    return Object.keys(grouped).map(country => ({
      country,
      assessments: grouped[country],
      avgScore: grouped[country].reduce((sum: number, item: any) => sum + item.risk_score, 0) / grouped[country].length
    }));
  }

  private groupByMineral(data: any[]): any[] {
    const grouped: any = {};
    data.forEach(item => {
      if (!grouped[item.mineral_name]) {
        grouped[item.mineral_name] = [];
      }
      grouped[item.mineral_name].push(item);
    });
    
    return Object.keys(grouped).map(mineral => ({
      mineral,
      assessments: grouped[mineral],
      avgScore: grouped[mineral].reduce((sum: number, item: any) => sum + item.risk_score, 0) / grouped[mineral].length
    }));
  }

  private calculateTrends(data: any[]): any[] {
    // Simple trend calculation - in production, use proper time series analysis
    const sortedData = data.sort((a, b) => 
      new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime()
    );
    
    return sortedData.map((item, index) => ({
      ...item,
      trend: index > 0 ? item.risk_score - sortedData[index - 1].risk_score : 0
    }));
  }

  private identifyBottlenecks(data: any[]): any[] {
    // Identify high-risk concentration points
    const countryRisks = this.groupByCountry(data);
    return countryRisks
      .filter(cr => cr.avgScore > 70)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);
  }

  private calculateRiskConcentration(data: any[]): any {
    const totalRisk = data.reduce((sum, item) => sum + item.risk_score, 0);
    const countryRisks = this.groupByCountry(data);
    
    const concentration = countryRisks.map(cr => ({
      country: cr.country,
      riskShare: (cr.assessments.reduce((sum: number, item: any) => sum + item.risk_score, 0) / totalRisk) * 100,
      assessmentCount: cr.assessments.length
    }));

    return {
      concentration,
      hhi: this.calculateHHI(concentration.map(c => c.riskShare))
    };
  }

  private calculateHHI(shares: number[]): number {
    // Herfindahl-Hirschman Index for market concentration
    return shares.reduce((sum, share) => sum + Math.pow(share, 2), 0);
  }

  private analyzeRegionalRisks(data: any[]): any[] {
    const regionGroups = data.reduce((acc, item) => {
      const region = item.region || 'Unknown';
      if (!acc[region]) acc[region] = [];
      acc[region].push(item);
      return acc;
    }, {});

    return Object.keys(regionGroups).map(region => ({
      region,
      avgScore: regionGroups[region].reduce((sum: number, item: any) => sum + item.risk_score, 0) / regionGroups[region].length,
      assessmentCount: regionGroups[region].length,
      riskTypes: [...new Set(regionGroups[region].map((item: any) => item.risk_type))]
    }));
  }

  private identifyHotspots(data: any[]): any[] {
    return data
      .filter(item => item.risk_score > 75)
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10)
      .map(item => ({
        country: item.country_name,
        mineral: item.mineral_name,
        riskType: item.risk_type,
        riskScore: item.risk_score,
        riskLevel: this.getRiskLevel(item.risk_score)
      }));
  }
}
