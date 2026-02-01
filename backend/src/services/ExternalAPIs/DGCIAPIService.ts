import axios from 'axios';
import { logger } from '@/utils/logger';
import { cacheSet, cacheGet } from '@/config/redis';

interface DGCIAPIData {
  commodity: string;
  price: number;
  unit: string;
  date: string;
  source: string;
  metadata?: any;
}

interface DGCIResponse {
  success: boolean;
  data: DGCIAPIData[];
  message?: string;
  timestamp: string;
}

export class DGCIAPIService {
  private baseURL: string;
  private apiKey: string;
  private rateLimitDelay: number = 1000; // 1 second between requests

  constructor() {
    this.baseURL = process.env.DGCI_API_URL || 'https://dgci.gov.in/api';
    this.apiKey = process.env.DGCI_API_KEY || '';
  }

  async getCommodityPrices(commodity?: string): Promise<DGCIAPIData[]> {
    try {
      const cacheKey = `dgci:prices:${commodity || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`DGCI API cache hit for ${commodity || 'all'} prices`);
        return cached;
      }

      const url = commodity 
        ? `${this.baseURL}/commodities/${commodity}/prices`
        : `${this.baseURL}/commodities/prices`;

      const response = await axios.get<DGCIResponse>(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error(`DGCI API Error: ${response.data.message}`);
      }

      const data = response.data.data;
      
      // Cache for 15 minutes
      await cacheSet(cacheKey, data, 900);
      
      logger.info(`DGCI API: Fetched ${data.length} price records for ${commodity || 'all commodities'}`);
      return data;
    } catch (error) {
      logger.error('DGCI API Error fetching commodity prices:', error);
      throw new Error(`Failed to fetch commodity prices from DGCI API: ${error}`);
    }
  }

  async getTradeData(commodity: string, startDate: string, endDate: string): Promise<DGCIAPIData[]> {
    try {
      const cacheKey = `dgci:trade:${commodity}:${startDate}:${endDate}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`DGCI API cache hit for ${commodity} trade data`);
        return cached;
      }

      const url = `${this.baseURL}/trade/data`;
      const response = await axios.get<DGCIResponse>(url, {
        params: {
          commodity,
          start_date: startDate,
          end_date: endDate
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error(`DGCI API Error: ${response.data.message}`);
      }

      const data = response.data.data;
      
      // Cache for 30 minutes
      await cacheSet(cacheKey, data, 1800);
      
      logger.info(`DGCI API: Fetched ${data.length} trade records for ${commodity}`);
      return data;
    } catch (error) {
      logger.error('DGCI API Error fetching trade data:', error);
      throw new Error(`Failed to fetch trade data from DGCI API: ${error}`);
    }
  }

  async getProductionData(commodity: string, state?: string): Promise<DGCIAPIData[]> {
    try {
      const cacheKey = `dgci:production:${commodity}:${state || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`DGCI API cache hit for ${commodity} production data`);
        return cached;
      }

      const url = `${this.baseURL}/production/data`;
      const params: any = { commodity };
      
      if (state) {
        params.state = state;
      }

      const response = await axios.get<DGCIResponse>(url, {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error(`DGCI API Error: ${response.data.message}`);
      }

      const data = response.data.data;
      
      // Cache for 1 hour
      await cacheSet(cacheKey, data, 3600);
      
      logger.info(`DGCI API: Fetched ${data.length} production records for ${commodity}`);
      return data;
    } catch (error) {
      logger.error('DGCI API Error fetching production data:', error);
      throw new Error(`Failed to fetch production data from DGCI API: ${error}`);
    }
  }

  async getMarketIntelligence(commodity?: string): Promise<any> {
    try {
      const cacheKey = `dgci:intelligence:${commodity || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`DGCI API cache hit for market intelligence`);
        return cached;
      }

      const url = commodity 
        ? `${this.baseURL}/intelligence/${commodity}`
        : `${this.baseURL}/intelligence`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      const data = response.data;
      
      // Cache for 2 hours
      await cacheSet(cacheKey, data, 7200);
      
      logger.info(`DGCI API: Fetched market intelligence for ${commodity || 'all commodities'}`);
      return data;
    } catch (error) {
      logger.error('DGCI API Error fetching market intelligence:', error);
      throw new Error(`Failed to fetch market intelligence from DGCI API: ${error}`);
    }
  }

  async getExportImportData(type: 'export' | 'import', commodity?: string, period?: string): Promise<DGCIAPIData[]> {
    try {
      const cacheKey = `dgci:${type}:${commodity || 'all'}:${period || 'current'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`DGCI API cache hit for ${type} data`);
        return cached;
      }

      const url = `${this.baseURL}/${type}/data`;
      const params: any = {};
      
      if (commodity) params.commodity = commodity;
      if (period) params.period = period;

      const response = await axios.get<DGCIResponse>(url, {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error(`DGCI API Error: ${response.data.message}`);
      }

      const data = response.data.data;
      
      // Cache for 20 minutes
      await cacheSet(cacheKey, data, 1200);
      
      logger.info(`DGCI API: Fetched ${data.length} ${type} records`);
      return data;
    } catch (error) {
      logger.error(`DGCI API Error fetching ${type} data:`, error);
      throw new Error(`Failed to fetch ${type} data from DGCI API: ${error}`);
    }
  }

  async getPolicyUpdates(): Promise<any> {
    try {
      const cacheKey = 'dgci:policy-updates';
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info('DGCI API cache hit for policy updates');
        return cached;
      }

      const url = `${this.baseURL}/policy/updates`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      const data = response.data;
      
      // Cache for 6 hours
      await cacheSet(cacheKey, data, 21600);
      
      logger.info('DGCI API: Fetched policy updates');
      return data;
    } catch (error) {
      logger.error('DGCI API Error fetching policy updates:', error);
      throw new Error(`Failed to fetch policy updates from DGCI API: ${error}`);
    }
  }

  // Helper method to map DGCI commodities to our mineral database
  mapDGCICommodityToMineral(dgciCommodity: string): string | null {
    const commodityMap: { [key: string]: string } = {
      'iron_ore': 'Iron Ore',
      'coal': 'Coal',
      'bauxite': 'Bauxite',
      'copper': 'Copper',
      'lead': 'Lead',
      'zinc': 'Zinc',
      'manganese': 'Manganese',
      'chromite': 'Chromite',
      'limestone': 'Limestone',
      'dolomite': 'Dolomite',
      'gold': 'Gold',
      'silver': 'Silver',
      'platinum': 'Platinum',
      'nickel': 'Nickel',
      'cobalt': 'Cobalt',
      'lithium': 'Lithium',
      'rare_earth': 'Rare Earth Elements',
      'graphite': 'Graphite',
      'aluminum': 'Aluminum'
    };

    return commodityMap[dgciCommodity.toLowerCase()] || null;
  }

  // Rate limiting helper
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Bulk data fetch with rate limiting
  async fetchBulkData(commodities: string[], dataType: 'prices' | 'trade' | 'production'): Promise<DGCIAPIData[]> {
    const allData: DGCIAPIData[] = [];
    
    for (const commodity of commodities) {
      try {
        let data: DGCIAPIData[] = [];
        
        switch (dataType) {
          case 'prices':
            data = await this.getCommodityPrices(commodity);
            break;
          case 'trade':
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            data = await this.getTradeData(commodity, startDate, endDate);
            break;
          case 'production':
            data = await this.getProductionData(commodity);
            break;
        }
        
        allData.push(...data);
        
        // Rate limiting delay
        await this.delay(this.rateLimitDelay);
      } catch (error) {
        logger.error(`Failed to fetch ${dataType} for ${commodity}:`, error);
        // Continue with other commodities
      }
    }
    
    return allData;
  }
}
