import { Request, Response } from 'express';
import { DGCIAPIService } from '@/services/ExternalAPIs/DGCIAPIService';
import { CommerceAPIService } from '@/services/ExternalAPIs/CommerceAPIService';
import { TEXMiNAPIService } from '@/services/ExternalAPIs/TEXMiNAPIService';
import { ETLPipeline } from '@/services/DataProcessor/ETLPipeline';
import { cacheSet, cacheGet } from '@/config/redis';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class ExternalAPIController {
  private dgciService: DGCIAPIService;
  private commerceService: CommerceAPIService;
  private texminService: TEXMiNAPIService;
  private etlPipeline: ETLPipeline;

  constructor() {
    this.dgciService = new DGCIAPIService();
    this.commerceService = new CommerceAPIService();
    this.texminService = new TEXMiNAPIService();
    this.etlPipeline = new ETLPipeline();
  }

  // DGCI API endpoints
  async getDGCIPrices(req: Request, res: Response): Promise<void> {
    try {
      const { commodity } = req.query;
      const data = await this.dgciService.getCommodityPrices(commodity as string);
      
      res.json({
        success: true,
        data,
        source: 'DGCI API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching DGCI prices:', error);
      throw new CustomError('Failed to fetch DGCI prices', 500);
    }
  }

  async getDGCITradeData(req: Request, res: Response): Promise<void> {
    try {
      const { commodity, startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new CustomError('Start date and end date are required', 400);
      }

      const data = await this.dgciService.getTradeData(
        commodity as string,
        startDate as string,
        endDate as string
      );
      
      res.json({
        success: true,
        data,
        source: 'DGCI API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error fetching DGCI trade data:', error);
      throw new CustomError('Failed to fetch DGCI trade data', 500);
    }
  }

  async getDGCIProductionData(req: Request, res: Response): Promise<void> {
    try {
      const { commodity, state } = req.query;
      const data = await this.dgciService.getProductionData(commodity as string, state as string);
      
      res.json({
        success: true,
        data,
        source: 'DGCI API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching DGCI production data:', error);
      throw new CustomError('Failed to fetch DGCI production data', 500);
    }
  }

  async getDGCIMarketIntelligence(req: Request, res: Response): Promise<void> {
    try {
      const { commodity } = req.query;
      const data = await this.dgciService.getMarketIntelligence(commodity as string);
      
      res.json({
        success: true,
        data,
        source: 'DGCI API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching DGCI market intelligence:', error);
      throw new CustomError('Failed to fetch DGCI market intelligence', 500);
    }
  }

  async getDGCIPolicyUpdates(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.dgciService.getPolicyUpdates();
      
      res.json({
        success: true,
        data,
        source: 'DGCI API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching DGCI policy updates:', error);
      throw new CustomError('Failed to fetch DGCI policy updates', 500);
    }
  }

  // Commerce API endpoints
  async getCommerceTradeData(req: Request, res: Response): Promise<void> {
    try {
      const params = {
        commodity: req.query.commodity as string,
        tradeType: req.query.tradeType as 'import' | 'export' | 'both',
        country: req.query.country as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined
      };

      if (!params.startDate || !params.endDate) {
        throw new CustomError('Start date and end date are required', 400);
      }

      const data = await this.commerceService.getTradeData(params);
      
      res.json({
        success: true,
        data,
        source: 'Commerce API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error fetching Commerce trade data:', error);
      throw new CustomError('Failed to fetch Commerce trade data', 500);
    }
  }

  async getCommerceCountryTradeData(req: Request, res: Response): Promise<void> {
    try {
      const { country } = req.params;
      const { period = '1Y' } = req.query;
      
      const data = await this.commerceService.getCountryTradeData(country, period as string);
      
      res.json({
        success: true,
        data,
        source: 'Commerce API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching Commerce country trade data:', error);
      throw new CustomError('Failed to fetch Commerce country trade data', 500);
    }
  }

  async getCommerceCommodityTradeData(req: Request, res: Response): Promise<void> {
    try {
      const { commodity } = req.params;
      const { period = '1Y' } = req.query;
      
      const data = await this.commerceService.getCommodityTradeData(commodity, period as string);
      
      res.json({
        success: true,
        data,
        source: 'Commerce API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching Commerce commodity trade data:', error);
      throw new CustomError('Failed to fetch Commerce commodity trade data', 500);
    }
  }

  async getCommerceTradeStatistics(req: Request, res: Response): Promise<void> {
    try {
      const params = {
        commodity: req.query.commodity as string,
        country: req.query.country as string,
        period: req.query.period as string,
        tradeType: req.query.tradeType as 'import' | 'export' | 'both'
      };

      const data = await this.commerceService.getTradeStatistics(params);
      
      res.json({
        success: true,
        data,
        source: 'Commerce API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching Commerce trade statistics:', error);
      throw new CustomError('Failed to fetch Commerce trade statistics', 500);
    }
  }

  async getCommerceTopPartners(req: Request, res: Response): Promise<void> {
    try {
      const { commodity, tradeType, limit = 10 } = req.query;
      
      const data = await this.commerceService.getTopTradingPartners(
        commodity as string,
        tradeType as 'import' | 'export',
        Number(limit)
      );
      
      res.json({
        success: true,
        data,
        source: 'Commerce API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching Commerce top partners:', error);
      throw new CustomError('Failed to fetch Commerce top partners', 500);
    }
  }

  async getCommerceTradeTrends(req: Request, res: Response): Promise<void> {
    try {
      const params = {
        commodity: req.query.commodity as string,
        country: req.query.country as string,
        period: req.query.period as string,
        frequency: req.query.frequency as 'daily' | 'weekly' | 'monthly'
      };

      const data = await this.commerceService.getTradeTrends(params);
      
      res.json({
        success: true,
        data,
        source: 'Commerce API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching Commerce trade trends:', error);
      throw new CustomError('Failed to fetch Commerce trade trends', 500);
    }
  }

  async getCommercePolicyUpdates(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.commerceService.getPolicyUpdates();
      
      res.json({
        success: true,
        data,
        source: 'Commerce API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching Commerce policy updates:', error);
      throw new CustomError('Failed to fetch Commerce policy updates', 500);
    }
  }

  async getCommerceTariffInformation(req: Request, res: Response): Promise<void> {
    try {
      const { commodity } = req.params;
      const { country } = req.query;
      
      const data = await this.commerceService.getTariffInformation(commodity, country as string);
      
      res.json({
        success: true,
        data,
        source: 'Commerce API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching Commerce tariff information:', error);
      throw new CustomError('Failed to fetch Commerce tariff information', 500);
    }
  }

  async getCommerceTradeBalance(req: Request, res: Response): Promise<void> {
    try {
      const { country } = req.params;
      const { period = '1Y' } = req.query;
      
      const data = await this.commerceService.getTradeBalance(country, period as string);
      
      res.json({
        success: true,
        data,
        source: 'Commerce API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching Commerce trade balance:', error);
      throw new CustomError('Failed to fetch Commerce trade balance', 500);
    }
  }

  // TEXMiN API endpoints
  async getTEXMiNMiningData(req: Request, res: Response): Promise<void> {
    try {
      const params = {
        mineral: req.query.mineral as string,
        state: req.query.state as string,
        district: req.query.district as string,
        company: req.query.company as string,
        mineType: req.query.mineType as 'open_cast' | 'underground' | 'alluvial' | 'all',
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined
      };

      const data = await this.texminService.getMiningData(params);
      
      res.json({
        success: true,
        data,
        source: 'TEXMiN API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching TEXMiN mining data:', error);
      throw new CustomError('Failed to fetch TEXMiN mining data', 500);
    }
  }

  async getTEXMiNStateData(req: Request, res: Response): Promise<void> {
    try {
      const { state } = req.params;
      const { mineral } = req.query;
      
      const data = await this.texminService.getStateMiningData(state, mineral as string);
      
      res.json({
        success: true,
        data,
        source: 'TEXMiN API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching TEXMiN state data:', error);
      throw new CustomError('Failed to fetch TEXMiN state data', 500);
    }
  }

  async getTEXMiNReserves(req: Request, res: Response): Promise<void> {
    try {
      const { mineral } = req.params;
      const { state } = req.query;
      
      const data = await this.texminService.getMineralReserves(mineral, state as string);
      
      res.json({
        success: true,
        data,
        source: 'TEXMiN API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching TEXMiN reserves:', error);
      throw new CustomError('Failed to fetch TEXMiN reserves', 500);
    }
  }

  async getTEXMiNProduction(req: Request, res: Response): Promise<void> {
    try {
      const { mineral } = req.params;
      const { state, period } = req.query;
      
      const data = await this.texminService.getProductionData(mineral, state as string, period as string);
      
      res.json({
        success: true,
        data,
        source: 'TEXMiN API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching TEXMiN production:', error);
      throw new CustomError('Failed to fetch TEXMiN production', 500);
    }
  }

  async getTEXMiNMiningCompanies(req: Request, res: Response): Promise<void> {
    try {
      const { state, mineral } = req.query;
      
      const data = await this.texminService.getMiningCompanies(state as string, mineral as string);
      
      res.json({
        success: true,
        data,
        source: 'TEXMiN API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching TEXMiN mining companies:', error);
      throw new CustomError('Failed to fetch TEXMiN mining companies', 500);
    }
  }

  async getTEXMiNMineLocations(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, state } = req.query;
      
      const data = await this.texminService.getMineLocations(mineral as string, state as string);
      
      res.json({
        success: true,
        data,
        source: 'TEXMiN API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching TEXMiN mine locations:', error);
      throw new CustomError('Failed to fetch TEXMiN mine locations', 500);
    }
  }

  async getTEXMiNMiningProjects(req: Request, res: Response): Promise<void> {
    try {
      const { status, state } = req.query;
      
      const data = await this.texminService.getMiningProjects(
        status as 'active' | 'planned' | 'completed' | 'suspended',
        state as string
      );
      
      res.json({
        success: true,
        data,
        source: 'TEXMiN API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching TEXMiN mining projects:', error);
      throw new CustomError('Failed to fetch TEXMiN mining projects', 500);
    }
  }

  async getTEXMiNEnvironmentalData(req: Request, res: Response): Promise<void> {
    try {
      const { mineral } = req.params;
      const { state } = req.query;
      
      const data = await this.texminService.getEnvironmentalData(mineral, state as string);
      
      res.json({
        success: true,
        data,
        source: 'TEXMiN API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching TEXMiN environmental data:', error);
      throw new CustomError('Failed to fetch TEXMiN environmental data', 500);
    }
  }

  async getTEXMiNPolicyRegulations(req: Request, res: Response): Promise<void> {
    try {
      const { state, mineral } = req.query;
      
      const data = await this.texminService.getPolicyRegulations(state as string, mineral as string);
      
      res.json({
        success: true,
        data,
        source: 'TEXMiN API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching TEXMiN policy regulations:', error);
      throw new CustomError('Failed to fetch TEXMiN policy regulations', 500);
    }
  }

  async getTEXMiNMarketIntelligence(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, period } = req.query;
      
      const data = await this.texminService.getMarketIntelligence(mineral as string, period as string);
      
      res.json({
        success: true,
        data,
        source: 'TEXMiN API',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching TEXMiN market intelligence:', error);
      throw new CustomError('Failed to fetch TEXMiN market intelligence', 500);
    }
  }

  // ETL Pipeline endpoints
  async getETLJobs(req: Request, res: Response): Promise<void> {
    try {
      const jobs = this.etlPipeline.getAllJobs();
      
      res.json({
        success: true,
        data: jobs,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching ETL jobs:', error);
      throw new CustomError('Failed to fetch ETL jobs', 500);
    }
  }

  async getETLJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = this.etlPipeline.getJobStatus(jobId);
      
      if (!job) {
        throw new CustomError('Job not found', 404);
      }
      
      res.json({
        success: true,
        data: job,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error fetching ETL job status:', error);
      throw new CustomError('Failed to fetch ETL job status', 500);
    }
  }

  async runETLJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      await this.etlPipeline.runJobManually(jobId);
      
      res.json({
        success: true,
        message: `ETL job ${jobId} started successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error running ETL job:', error);
      throw new CustomError('Failed to run ETL job', 500);
    }
  }

  async enableETLJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      await this.etlPipeline.enableJob(jobId);
      
      res.json({
        success: true,
        message: `ETL job ${jobId} enabled successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error enabling ETL job:', error);
      throw new CustomError('Failed to enable ETL job', 500);
    }
  }

  async disableETLJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      await this.etlPipeline.disableJob(jobId);
      
      res.json({
        success: true,
        message: `ETL job ${jobId} disabled successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error disabling ETL job:', error);
      throw new CustomError('Failed to disable ETL job', 500);
    }
  }

  async runComprehensiveSync(req: Request, res: Response): Promise<void> {
    try {
      await this.etlPipeline.runComprehensiveSync();
      
      res.json({
        success: true,
        message: 'Comprehensive data sync started successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error running comprehensive sync:', error);
      throw new CustomError('Failed to run comprehensive sync', 500);
    }
  }

  async getDataQualityReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await this.etlPipeline.getDataQualityReport();
      
      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error generating data quality report:', error);
      throw new CustomError('Failed to generate data quality report', 500);
    }
  }

  // Combined data endpoints
  async getCombinedMarketOverview(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, period = '1Y' } = req.query;
      
      // Fetch data from multiple sources
      const [dgciIntelligence, commerceStats, texminIntelligence] = await Promise.all([
        this.dgciService.getMarketIntelligence(mineral as string).catch(() => null),
        this.commerceService.getTradeStatistics({
          commodity: mineral as string,
          period: period as string
        }).catch(() => null),
        this.texminService.getMarketIntelligence(mineral as string, period as string).catch(() => null)
      ]);

      const combinedData = {
        dgci: dgciIntelligence,
        commerce: commerceStats,
        texmin: texminIntelligence,
        period,
        mineral: mineral || 'all'
      };
      
      res.json({
        success: true,
        data: combinedData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching combined market overview:', error);
      throw new CustomError('Failed to fetch combined market overview', 500);
    }
  }

  async getCombinedTradeAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { commodity, country, period = '1Y' } = req.query;
      
      // Fetch trade data from multiple sources
      const [dgciTrade, commerceTrade, commerceTrends] = await Promise.all([
        this.dgciService.getTradeData(
          commodity as string,
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        ).catch(() => []),
        this.commerceService.getTradeData({
          commodity: commodity as string,
          country: country as string,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        }).catch(() => ({ data: [] })),
        this.commerceService.getTradeTrends({
          commodity: commodity as string,
          country: country as string,
          period: period as string,
          frequency: 'monthly'
        }).catch(() => [])
      ]);

      const combinedData = {
        dgci: dgciTrade,
        commerce: commerceTrade,
        trends: commerceTrends,
        period,
        commodity: commodity || 'all',
        country: country || 'all'
      };
      
      res.json({
        success: true,
        data: combinedData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching combined trade analysis:', error);
      throw new CustomError('Failed to fetch combined trade analysis', 500);
    }
  }

  async getCombinedProductionAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { mineral, state, period = '1Y' } = req.query;
      
      // Fetch production data from multiple sources
      const [dgciProduction, texminProduction] = await Promise.all([
        this.dgciService.getProductionData(mineral as string, state as string).catch(() => []),
        this.texminService.getProductionData(mineral as string, state as string, period as string).catch(() => [])
      ]);

      const combinedData = {
        dgci: dgciProduction,
        texmin: texminProduction,
        period,
        mineral: mineral || 'all',
        state: state || 'all'
      };
      
      res.json({
        success: true,
        data: combinedData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching combined production analysis:', error);
      throw new CustomError('Failed to fetch combined production analysis', 500);
    }
  }
}
