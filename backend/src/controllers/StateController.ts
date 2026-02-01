import { Request, Response } from 'express';
import { db } from '@/config/database';
import { cacheSet, cacheGet } from '@/config/redis';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class StateController {
  async getStates(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        search
      } = req.query;

      const cacheKey = `states:${JSON.stringify(req.query)}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      let query = db('states')
        .join('countries', 'states.country_id', 'countries.id')
        .where('states.is_active', true)
        .select(
          'states.*',
          'countries.name as country_name',
          'countries.code_2 as country_code',
          'countries.region'
        );

      // Apply search filter
      if (search) {
        query = query.where(function() {
          this.where('states.name', 'ilike', `%${search}%`)
              .orWhere('states.code', 'ilike', `%${search}%`)
              .orWhere('countries.name', 'ilike', `%${search}%`);
        });
      }

      // Get total count
      const total = await query.clone().count('* as count').first();

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      const states = await query
        .orderBy('states.name')
        .limit(Number(limit))
        .offset(offset);

      const result = {
        states,
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
      logger.error('Error fetching states:', error);
      throw new CustomError('Failed to fetch states', 500);
    }
  }

  async getStateById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { includeStats = false } = req.query;

      const cacheKey = `state:${id}:${includeStats}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      const state = await db('states')
        .join('countries', 'states.country_id', 'countries.id')
        .where('states.id', id)
        .where('states.is_active', true)
        .select(
          'states.*',
          'countries.name as country_name',
          'countries.code_2 as country_code',
          'countries.region'
        )
        .first();

      if (!state) {
        throw new CustomError('State not found', 404);
      }

      let result: any = { state };

      if (includeStats === 'true') {
        // Get additional statistics
        const [productionStats, mineralStats, companyStats] = await Promise.all([
          db('production_data')
            .join('minerals', 'production_data.mineral_id', 'minerals.id')
            .where('production_data.state_id', id)
            .orderBy('production_data.production_date', 'desc')
            .limit(30)
            .select(
              'production_data.*',
              'minerals.name as mineral_name',
              'minerals.symbol as mineral_symbol'
            ),
          db('states')
            .join('countries', 'states.country_id', 'countries.id')
            .join('minerals', db.raw('JSON_EXTRACT(states.mineral_resources, ?) = minerals.name', ['%name%']))
            .where('states.id', id)
            .select('minerals.*')
            .limit(10),
          this.getTopCompanies(id)
        ]);

        result = {
          ...result,
          stats: {
            recentProduction: productionStats,
            availableMinerals: mineralStats,
            topCompanies: companyStats
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
      logger.error('Error fetching state:', error);
      throw new CustomError('Failed to fetch state', 500);
    }
  }

  async getStateMinerals(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { mineral, period = 'ALL', type = 'production' } = req.query;

      const cacheKey = `state:${id}:minerals:${mineral}:${period}:${type}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Verify state exists
      const state = await db('states').where({ id, is_active: true }).first();
      if (!state) {
        throw new CustomError('State not found', 404);
      }

      let query;
      
      if (type === 'production') {
        query = db('production_data')
          .join('minerals', 'production_data.mineral_id', 'minerals.id')
          .where('production_data.state_id', id)
          .select(
            'minerals.name',
            'minerals.symbol',
            'minerals.category',
            db.raw('SUM(production_data.quantity) as total_quantity'),
            db.raw('AVG(production_data.quantity) as avg_quantity'),
            db.raw('COUNT(*) as production_periods')
          )
          .groupBy('minerals.id', 'minerals.name', 'minerals.symbol', 'minerals.category');

        // Apply date range if specified
        if (period !== 'ALL') {
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
          
          query = query.whereBetween('production_data.production_date', [startDate, now]);
        }
      } else {
        // For reserves and resources, use state's mineral_resources JSON
        const mineralResources = state.mineral_resources ? JSON.parse(state.mineral_resources) : [];
        const minerals = await db('minerals')
          .whereIn('name', mineralResources)
          .select('*');

        query = minerals.map(mineral => ({
          ...mineral,
          total_quantity: 0, // Reserves data would come from geological surveys
          avg_quantity: 0,
          production_periods: 0
        }));
      }

      if (mineral) {
        if (typeof query === 'function') {
          query = query.where('minerals.name', 'ilike', `%${mineral}%`);
        } else {
          query = query.filter((m: any) => m.name.toLowerCase().includes((mineral as string).toLowerCase()));
        }
      }

      const mineralData = typeof query === 'function' ? await query : query;

      // Cache for 10 minutes
      await cacheSet(cacheKey, mineralData, 600);

      res.json({
        success: true,
        data: mineralData,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error fetching state minerals:', error);
      throw new CustomError('Failed to fetch state minerals', 500);
    }
  }

  async getStateProduction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { mineral, period = '1Y', frequency = 'monthly' } = req.query;

      const cacheKey = `state:${id}:production:${mineral}:${period}:${frequency}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Verify state exists
      const state = await db('states').where({ id, is_active: true }).first();
      if (!state) {
        throw new CustomError('State not found', 404);
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

      let query = db('production_data')
        .join('minerals', 'production_data.mineral_id', 'minerals.id')
        .where('production_data.state_id', id)
        .whereBetween('production_data.production_date', [startDate, now])
        .select(
          'production_data.production_date',
          'production_data.quantity',
          'production_data.grade',
          'minerals.name as mineral_name',
          'minerals.symbol as mineral_symbol'
        )
        .orderBy('production_data.production_date');

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      const productionData = await query;

      // Group by frequency if needed
      let groupedData = productionData;
      if (frequency !== 'daily') {
        groupedData = this.groupProductionByFrequency(productionData, frequency);
      }

      // Calculate production statistics
      const stats = this.calculateProductionStats(groupedData);

      const result = {
        productionData: groupedData,
        stats,
        metadata: {
          period,
          frequency,
          stateName: state.name
        }
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
      logger.error('Error fetching state production:', error);
      throw new CustomError('Failed to fetch state production', 500);
    }
  }

  async getStateReserves(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { mineral, type = 'proven' } = req.query;

      const cacheKey = `state:${id}:reserves:${mineral}:${type}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Verify state exists
      const state = await db('states')
        .join('countries', 'states.country_id', 'countries.id')
        .where('states.id', id)
        .where('states.is_active', true)
        .select(
          'states.*',
          'countries.name as country_name'
        )
        .first();

      if (!state) {
        throw new CustomError('State not found', 404);
      }

      // Mock reserves data - in production, integrate with geological survey data
      const mineralResources = state.mineral_resources ? JSON.parse(state.mineral_resources) : [];
      
      let reserves = mineralResources.map((resource: any) => ({
        mineral: resource.name,
        type: 'proven',
        quantity: Math.random() * 1000000 + 100000, // Mock data
        unit: 'metric_tons',
        grade: 0.8 + Math.random() * 0.2, // Mock grade
        lastUpdated: new Date().toISOString(),
        source: 'Geological Survey'
      }));

      if (mineral) {
        reserves = reserves.filter((r: any) => 
          r.mineral.toLowerCase().includes((mineral as string).toLowerCase())
        );
      }

      if (type !== 'all') {
        reserves = reserves.filter((r: any) => r.type === type);
      }

      // Cache for 30 minutes
      await cacheSet(cacheKey, reserves, 1800);

      res.json({
        success: true,
        data: reserves,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error fetching state reserves:', error);
      throw new CustomError('Failed to fetch state reserves', 500);
    }
  }

  async getStateCompanies(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { mineral, page = 1, limit = 20 } = req.query;

      const cacheKey = `state:${id}:companies:${mineral}:${page}:${limit}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Verify state exists
      const state = await db('states').where({ id, is_active: true }).first();
      if (!state) {
        throw new CustomError('State not found', 404);
      }

      // Get companies from state's mining_companies JSON
      const miningCompanies = state.mining_companies ? JSON.parse(state.mining_companies) : [];
      
      let companies = miningCompanies.map((company: any, index: number) => ({
        id: index + 1,
        name: company,
        type: 'mining',
        established: 1900 + Math.floor(Math.random() * 120), // Mock data
        employees: Math.floor(Math.random() * 5000) + 100,
        headquarters: state.name,
        minerals: ['Iron Ore', 'Coal', 'Copper'], // Mock data
        marketCap: Math.random() * 10000000000, // Mock data
        website: `https://www.${company.toLowerCase().replace(/\s+/g, '')}.com`
      }));

      if (mineral) {
        companies = companies.filter((c: any) =>
          c.minerals.some((m: string) => 
            m.toLowerCase().includes((mineral as string).toLowerCase())
          )
        );
      }

      // Apply pagination
      const total = companies.length;
      const offset = (Number(page) - 1) * Number(limit);
      const paginatedCompanies = companies.slice(offset, offset + Number(limit));

      const result = {
        companies: paginatedCompanies,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      };

      // Cache for 15 minutes
      await cacheSet(cacheKey, result, 900);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error fetching state companies:', error);
      throw new CustomError('Failed to fetch state companies', 500);
    }
  }

  async getStateProjects(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { mineral, status, page = 1, limit = 20 } = req.query;

      const cacheKey = `state:${id}:projects:${mineral}:${status}:${page}:${limit}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        res.json({
          success: true,
          data: cached,
        });
        return;
      }

      // Verify state exists
      const state = await db('states').where({ id, is_active: true }).first();
      if (!state) {
        throw new CustomError('State not found', 404);
      }

      // Mock project data - in production, integrate with mining project databases
      const projects = [
        {
          id: 1,
          name: 'Iron Ore Expansion Project',
          company: 'Steel Authority of India',
          mineral: 'Iron Ore',
          status: 'active',
          startDate: '2020-01-15',
          expectedCompletion: '2025-12-31',
          estimatedCapacity: 10000000,
          capacityUnit: 'metric_tons/year',
          investment: 500000000,
          currency: 'USD',
          location: `${state.name} - District 1`,
          description: 'Major iron ore mining expansion project'
        },
        {
          id: 2,
          name: 'Copper Mine Development',
          company: 'Hindustan Copper',
          mineral: 'Copper',
          status: 'planned',
          startDate: '2024-06-01',
          expectedCompletion: '2028-12-31',
          estimatedCapacity: 5000000,
          capacityUnit: 'metric_tons/year',
          investment: 750000000,
          currency: 'USD',
          location: `${state.name} - District 2`,
          description: 'New copper mining development project'
        },
        {
          id: 3,
          name: 'Coal Processing Plant',
          company: 'Coal India',
          mineral: 'Coal',
          status: 'completed',
          startDate: '2018-03-01',
          expectedCompletion: '2022-12-31',
          estimatedCapacity: 15000000,
          capacityUnit: 'metric_tons/year',
          investment: 300000000,
          currency: 'USD',
          location: `${state.name} - District 3`,
          description: 'Coal processing and beneficiation plant'
        }
      ];

      let filteredProjects = projects;

      if (mineral) {
        filteredProjects = filteredProjects.filter(p => 
          p.mineral.toLowerCase().includes((mineral as string).toLowerCase())
        );
      }

      if (status) {
        filteredProjects = filteredProjects.filter(p => p.status === status);
      }

      // Apply pagination
      const total = filteredProjects.length;
      const offset = (Number(page) - 1) * Number(limit);
      const paginatedProjects = filteredProjects.slice(offset, offset + Number(limit));

      const result = {
        projects: paginatedProjects,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      };

      // Cache for 20 minutes
      await cacheSet(cacheKey, result, 1200);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error fetching state projects:', error);
      throw new CustomError('Failed to fetch state projects', 500);
    }
  }

  // Helper methods
  private async getTopCompanies(stateId: number): Promise<any[]> {
    const state = await db('states').where('id', stateId).first();
    const miningCompanies = state?.mining_companies ? JSON.parse(state.mining_companies) : [];
    
    return miningCompanies.slice(0, 5).map((company: string, index: number) => ({
      rank: index + 1,
      name: company,
      marketShare: Math.random() * 30 + 5, // Mock data
      revenue: Math.random() * 1000000000, // Mock data
      employees: Math.floor(Math.random() * 10000) + 1000
    }));
  }

  private groupProductionByFrequency(data: any[], frequency: string): any[] {
    // Simple grouping - in production, use proper date aggregation
    const grouped: any = {};
    
    data.forEach(item => {
      let key = item.production_date;
      if (frequency === 'weekly') {
        const date = new Date(item.production_date);
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        key = weekStart.toISOString().split('T')[0];
      } else if (frequency === 'monthly') {
        key = item.production_date.substring(0, 7); // YYYY-MM
      } else if (frequency === 'yearly') {
        key = item.production_date.substring(0, 4); // YYYY
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          total_quantity: 0,
          minerals: {}
        };
      }
      
      grouped[key].total_quantity += item.quantity;
      
      if (!grouped[key].minerals[item.mineral_name]) {
        grouped[key].minerals[item.mineral_name] = {
          quantity: 0,
          avg_grade: 0,
          count: 0
        };
      }
      
      const mineral = grouped[key].minerals[item.mineral_name];
      mineral.quantity += item.quantity;
      mineral.avg_grade = (mineral.avg_grade * mineral.count + (item.grade || 0)) / (mineral.count + 1);
      mineral.count += 1;
    });
    
    return Object.values(grouped);
  }

  private calculateProductionStats(data: any[]): any {
    if (data.length === 0) return null;
    
    const quantities = data.map(d => d.total_quantity || d.quantity);
    const totalQuantity = quantities.reduce((sum, q) => sum + q, 0);
    const avgQuantity = totalQuantity / quantities.length;
    const maxQuantity = Math.max(...quantities);
    const minQuantity = Math.min(...quantities);
    
    return {
      totalQuantity,
      avgQuantity,
      maxQuantity,
      minQuantity,
      productionPeriods: data.length
    };
  }
}
