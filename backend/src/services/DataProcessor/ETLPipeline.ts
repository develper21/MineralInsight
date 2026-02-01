import { db } from '@/config/database';
import { logger } from '@/utils/logger';
import { DGCIAPIService } from '@/services/ExternalAPIs/DGCIAPIService';
import { CommerceAPIService } from '@/services/ExternalAPIs/CommerceAPIService';
import { TEXMiNAPIService } from '@/services/ExternalAPIs/TEXMiNAPIService';
import cron from 'node-cron';

interface ETLJob {
  id: string;
  name: string;
  schedule: string;
  source: 'dgci' | 'commerce' | 'texmin';
  dataType: 'prices' | 'trade' | 'production' | 'reserves';
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  status: 'idle' | 'running' | 'completed' | 'failed';
  error?: string;
}

export class ETLPipeline {
  private dgciService: DGCIAPIService;
  private commerceService: CommerceAPIService;
  private texminService: TEXMiNAPIService;
  private jobs: Map<string, ETLJob> = new Map();
  private isProcessing: boolean = false;

  constructor() {
    this.dgciService = new DGCIAPIService();
    this.commerceService = new CommerceAPIService();
    this.texminService = new TEXMiNAPIService();
    this.initializeJobs();
    this.setupCronJobs();
  }

  private initializeJobs(): void {
    const defaultJobs: ETLJob[] = [
      {
        id: 'dgci-prices-hourly',
        name: 'DGCI Price Data Sync',
        schedule: '0 * * * *', // Every hour
        source: 'dgci',
        dataType: 'prices',
        enabled: true,
        status: 'idle'
      },
      {
        id: 'dgci-trade-daily',
        name: 'DGCI Trade Data Sync',
        schedule: '0 2 * * *', // Daily at 2 AM
        source: 'dgci',
        dataType: 'trade',
        enabled: true,
        status: 'idle'
      },
      {
        id: 'commerce-trade-daily',
        name: 'Commerce Trade Data Sync',
        schedule: '0 3 * * *', // Daily at 3 AM
        source: 'commerce',
        dataType: 'trade',
        enabled: true,
        status: 'idle'
      },
      {
        id: 'texmin-production-daily',
        name: 'TEXMiN Production Data Sync',
        schedule: '0 4 * * *', // Daily at 4 AM
        source: 'texmin',
        dataType: 'production',
        enabled: true,
        status: 'idle'
      },
      {
        id: 'texmin-reserves-weekly',
        name: 'TEXMiN Reserves Data Sync',
        schedule: '0 5 * * 0', // Weekly on Sunday at 5 AM
        source: 'texmin',
        dataType: 'reserves',
        enabled: true,
        status: 'idle'
      },
      {
        id: 'comprehensive-sync-weekly',
        name: 'Comprehensive Data Sync',
        schedule: '0 6 * * 0', // Weekly on Sunday at 6 AM
        source: 'dgci',
        dataType: 'prices',
        enabled: true,
        status: 'idle'
      }
    ];

    defaultJobs.forEach(job => {
      this.jobs.set(job.id, job);
    });

    logger.info(`ETL Pipeline initialized with ${defaultJobs.length} jobs`);
  }

  private setupCronJobs(): void {
    this.jobs.forEach((job, jobId) => {
      if (job.enabled) {
        cron.schedule(job.schedule, () => {
          this.runJob(jobId);
        });
        
        logger.info(`Scheduled job: ${job.name} (${job.schedule})`);
      }
    });
  }

  async runJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      logger.error(`Job not found: ${jobId}`);
      return;
    }

    if (job.status === 'running') {
      logger.warn(`Job ${job.name} is already running`);
      return;
    }

    logger.info(`Starting ETL job: ${job.name}`);
    job.status = 'running';
    job.lastRun = new Date();

    try {
      switch (job.source) {
        case 'dgci':
          await this.processDGCIJob(job);
          break;
        case 'commerce':
          await this.processCommerceJob(job);
          break;
        case 'texmin':
          await this.processTEXMiNJob(job);
          break;
      }

      job.status = 'completed';
      job.error = undefined;
      logger.info(`ETL job completed successfully: ${job.name}`);
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`ETL job failed: ${job.name}`, error);
    }
  }

  private async processDGCIJob(job: ETLJob): Promise<void> {
    switch (job.dataType) {
      case 'prices':
        await this.processDGCIPrices();
        break;
      case 'trade':
        await this.processDGCITrade();
        break;
      case 'production':
        await this.processDGCIProduction();
        break;
    }
  }

  private async processCommerceJob(job: ETLJob): Promise<void> {
    switch (job.dataType) {
      case 'trade':
        await this.processCommerceTrade();
        break;
    }
  }

  private async processTEXMiNJob(job: ETLJob): Promise<void> {
    switch (job.dataType) {
      case 'production':
        await this.processTEXMiNProduction();
        break;
      case 'reserves':
        await this.processTEXMiNReserves();
        break;
    }
  }

  private async processDGCIPrices(): Promise<void> {
    logger.info('Processing DGCI price data...');
    
    try {
      // Get all active minerals
      const minerals = await db('minerals').where('is_active', true).select('name');
      const commodityNames = minerals.map(m => this.dgciService.mapDGCICommodityToMineral(m.name)).filter(Boolean);

      // Fetch bulk price data
      const priceData = await this.dgciService.fetchBulkData(commodityNames as string[], 'prices');
      
      // Transform and insert data
      const transformedData = priceData.map(item => ({
        mineral_id: this.getMineralIdByName(item.commodity),
        price: item.price,
        price_unit: item.unit,
        price_date: item.date,
        source: 'DGCI API',
        metadata: item.metadata
      })).filter(item => item.mineral_id);

      if (transformedData.length > 0) {
        await this.upsertPriceData(transformedData);
        logger.info(`Processed ${transformedData.length} DGCI price records`);
      }
    } catch (error) {
      logger.error('Error processing DGCI price data:', error);
      throw error;
    }
  }

  private async processDGCITrade(): Promise<void> {
    logger.info('Processing DGCI trade data...');
    
    try {
      // Get recent trade data for the last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const minerals = await db('minerals').where('is_active', true).select('name');
      const commodityNames = minerals.map(m => this.dgciService.mapDGCICommodityToMineral(m.name)).filter(Boolean);

      const tradeData = [];
      for (const commodity of commodityNames) {
        try {
          const data = await this.dgciService.getTradeData(commodity as string, startDate, endDate);
          tradeData.push(...data);
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          logger.error(`Error fetching trade data for ${commodity}:`, error);
        }
      }

      // Transform and insert data
      const transformedData = tradeData.map(item => ({
        mineral_id: this.getMineralIdByName(item.commodity),
        country_id: this.getCountryIdByName(item.metadata?.country),
        trade_type: item.metadata?.trade_type || 'import',
        quantity: item.metadata?.quantity || 0,
        quantity_unit: item.unit,
        value_usd: item.price * (item.metadata?.quantity || 1),
        price_per_unit: item.price,
        trade_date: item.date,
        source: 'DGCI API',
        metadata: item.metadata
      })).filter(item => item.mineral_id && item.country_id);

      if (transformedData.length > 0) {
        await this.upsertTradeData(transformedData);
        logger.info(`Processed ${transformedData.length} DGCI trade records`);
      }
    } catch (error) {
      logger.error('Error processing DGCI trade data:', error);
      throw error;
    }
  }

  private async processDGCIProduction(): Promise<void> {
    logger.info('Processing DGCI production data...');
    
    try {
      const minerals = await db('minerals').where('is_active', true).select('name');
      const commodityNames = minerals.map(m => this.dgciService.mapDGCICommodityToMineral(m.name)).filter(Boolean);

      const productionData = [];
      for (const commodity of commodityNames) {
        try {
          const data = await this.dgciService.getProductionData(commodity as string);
          productionData.push(...data);
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          logger.error(`Error fetching production data for ${commodity}:`, error);
        }
      }

      // Transform and insert data
      const transformedData = productionData.map(item => ({
        mineral_id: this.getMineralIdByName(item.commodity),
        state_id: this.getStateIdByName(item.metadata?.state),
        quantity: item.metadata?.quantity || 0,
        quantity_unit: item.unit,
        production_date: item.date,
        period_type: 'monthly',
        grade: item.metadata?.grade,
        mine_name: item.metadata?.mine_name,
        company: item.metadata?.company,
        source: 'DGCI API',
        metadata: item.metadata
      })).filter(item => item.mineral_id);

      if (transformedData.length > 0) {
        await this.upsertProductionData(transformedData);
        logger.info(`Processed ${transformedData.length} DGCI production records`);
      }
    } catch (error) {
      logger.error('Error processing DGCI production data:', error);
      throw error;
    }
  }

  private async processCommerceTrade(): Promise<void> {
    logger.info('Processing Commerce trade data...');
    
    try {
      // Get recent trade data
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const result = await this.commerceService.getTradeData({
        startDate,
        endDate,
        limit: 1000
      });

      // Transform and insert data
      const transformedData = result.data.map(item => ({
        mineral_id: this.getMineralIdByName(item.commodity),
        country_id: this.getCountryIdByName(item.country),
        trade_type: item.trade_type,
        quantity: item.quantity,
        quantity_unit: item.unit,
        value_usd: item.value_usd,
        price_per_unit: item.value_usd / item.quantity,
        trade_date: item.date,
        source: 'Commerce API',
        metadata: {
          hs_code: item.hs_code,
          original_data: item.metadata
        }
      })).filter(item => item.mineral_id && item.country_id);

      if (transformedData.length > 0) {
        await this.upsertTradeData(transformedData);
        logger.info(`Processed ${transformedData.length} Commerce trade records`);
      }
    } catch (error) {
      logger.error('Error processing Commerce trade data:', error);
      throw error;
    }
  }

  private async processTEXMiNProduction(): Promise<void> {
    logger.info('Processing TEXMiN production data...');
    
    try {
      const states = await db('states').where('is_active', true).select('name');
      const minerals = await db('minerals').where('is_active', true).select('name');

      const productionData = [];
      for (const state of states) {
        for (const mineral of minerals) {
          try {
            const data = await this.texminService.getProductionData(
              mineral.name,
              state.name,
              'current'
            );
            productionData.push(...data);
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (error) {
            logger.error(`Error fetching TEXMiN data for ${mineral.name} in ${state.name}:`, error);
          }
        }
      }

      // Transform and insert data
      const transformedData = productionData.map(item => ({
        mineral_id: this.getMineralIdByName(item.mineral),
        state_id: this.getStateIdByName(item.state),
        quantity: item.production,
        quantity_unit: 'metric_tons',
        production_date: item.last_updated.split('T')[0],
        period_type: 'monthly',
        grade: item.grade,
        mine_name: item.company,
        company: item.company,
        source: 'TEXMiN API',
        metadata: {
          district: item.district,
          coordinates: item.coordinates,
          original_data: item.metadata
        }
      })).filter(item => item.mineral_id && item.state_id);

      if (transformedData.length > 0) {
        await this.upsertProductionData(transformedData);
        logger.info(`Processed ${transformedData.length} TEXMiN production records`);
      }
    } catch (error) {
      logger.error('Error processing TEXMiN production data:', error);
      throw error;
    }
  }

  private async processTEXMiNReserves(): Promise<void> {
    logger.info('Processing TEXMiN reserves data...');
    
    try {
      const minerals = await db('minerals').where('is_active', true).select('name');

      const reservesData = [];
      for (const mineral of minerals) {
        try {
          const data = await this.texminService.getMineralReserves(mineral.name);
          reservesData.push(...data);
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          logger.error(`Error fetching TEXMiN reserves for ${mineral.name}:`, error);
        }
      }

      // Update state mineral_resources with reserves data
      for (const item of reservesData) {
        const stateId = this.getStateIdByName(item.state);
        if (stateId) {
          await db('states')
            .where('id', stateId)
            .update({
              mineral_resources: JSON.stringify([
                ...(JSON.parse(await db('states').where('id', stateId).first().then(s => s.mineral_resources || '[]'))),
                {
                  name: item.mineral,
                  reserves: item.reserves,
                  grade: item.grade,
                  last_updated: item.last_updated
                }
              ]),
              updated_at: new Date()
            });
        }
      }

      logger.info(`Processed ${reservesData.length} TEXMiN reserves records`);
    } catch (error) {
      logger.error('Error processing TEXMiN reserves data:', error);
      throw error;
    }
  }

  // Helper methods for data transformation
  private async getMineralIdByName(name: string): Promise<number | null> {
    try {
      const mineral = await db('minerals').where('name', name).first();
      return mineral?.id || null;
    } catch (error) {
      logger.error(`Error getting mineral ID for ${name}:`, error);
      return null;
    }
  }

  private async getCountryIdByName(name: string): Promise<number | null> {
    try {
      const country = await db('countries').where('name', name).first();
      return country?.id || null;
    } catch (error) {
      logger.error(`Error getting country ID for ${name}:`, error);
      return null;
    }
  }

  private async getStateIdByName(name: string): Promise<number | null> {
    try {
      const state = await db('states').where('name', name).first();
      return state?.id || null;
    } catch (error) {
      logger.error(`Error getting state ID for ${name}:`, error);
      return null;
    }
  }

  // Database upsert methods
  private async upsertPriceData(data: any[]): Promise<void> {
    try {
      for (const item of data) {
        await db('price_data')
          .insert(item)
          .onConflict(['mineral_id', 'price_date'])
          .merge();
      }
    } catch (error) {
      logger.error('Error upserting price data:', error);
      throw error;
    }
  }

  private async upsertTradeData(data: any[]): Promise<void> {
    try {
      for (const item of data) {
        await db('trade_data')
          .insert(item)
          .onConflict(['mineral_id', 'country_id', 'trade_type', 'trade_date'])
          .merge();
      }
    } catch (error) {
      logger.error('Error upserting trade data:', error);
      throw error;
    }
  }

  private async upsertProductionData(data: any[]): Promise<void> {
    try {
      for (const item of data) {
        await db('production_data')
          .insert(item)
          .onConflict(['mineral_id', 'state_id', 'production_date'])
          .merge();
      }
    } catch (error) {
      logger.error('Error upserting production data:', error);
      throw error;
    }
  }

  // Public API methods
  async runJobManually(jobId: string): Promise<void> {
    await this.runJob(jobId);
  }

  getJobStatus(jobId: string): ETLJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): ETLJob[] {
    return Array.from(this.jobs.values());
  }

  async enableJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.enabled = true;
      logger.info(`Job enabled: ${job.name}`);
    }
  }

  async disableJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.enabled = false;
      logger.info(`Job disabled: ${job.name}`);
    }
  }

  async runComprehensiveSync(): Promise<void> {
    if (this.isProcessing) {
      logger.warn('Comprehensive sync is already running');
      return;
    }

    this.isProcessing = true;
    logger.info('Starting comprehensive data sync...');

    try {
      // Run all enabled jobs sequentially
      const enabledJobs = Array.from(this.jobs.values()).filter(job => job.enabled);
      
      for (const job of enabledJobs) {
        await this.runJob(job.id);
        // Wait between jobs to prevent overwhelming APIs
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      logger.info('Comprehensive data sync completed successfully');
    } catch (error) {
      logger.error('Comprehensive data sync failed:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  async getDataQualityReport(): Promise<any> {
    try {
      const [
        priceCount,
        tradeCount,
        productionCount,
        lastPriceUpdate,
        lastTradeUpdate,
        lastProductionUpdate
      ] = await Promise.all([
        db('price_data').count('* as count').first(),
        db('trade_data').count('* as count').first(),
        db('production_data').count('* as count').first(),
        db('price_data').max('created_at as last_update').first(),
        db('trade_data').max('created_at as last_update').first(),
        db('production_data').max('created_at as last_update').first()
      ]);

      return {
        dataCounts: {
          prices: Number(priceCount?.count || 0),
          trade: Number(tradeCount?.count || 0),
          production: Number(productionCount?.count || 0)
        },
        lastUpdates: {
          prices: lastPriceUpdate?.last_update,
          trade: lastTradeUpdate?.last_update,
          production: lastProductionUpdate?.last_update
        },
        jobStatus: this.getAllJobs().map(job => ({
          id: job.id,
          name: job.name,
          status: job.status,
          lastRun: job.lastRun,
          error: job.error
        }))
      };
    } catch (error) {
      logger.error('Error generating data quality report:', error);
      throw error;
    }
  }
}
