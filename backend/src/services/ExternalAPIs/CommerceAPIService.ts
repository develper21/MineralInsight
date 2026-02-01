import axios from 'axios';
import { logger } from '@/utils/logger';
import { cacheSet, cacheGet } from '@/config/redis';

interface CommerceAPIData {
  commodity: string;
  trade_type: 'import' | 'export';
  country: string;
  value_usd: number;
  quantity: number;
  unit: string;
  date: string;
  hs_code?: string;
  source: string;
  metadata?: any;
}

interface CommerceResponse {
  success: boolean;
  data: CommerceAPIData[];
  message?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class CommerceAPIService {
  private baseURL: string;
  private apiKey: string;
  private rateLimitDelay: number = 1500; // 1.5 seconds between requests

  constructor() {
    this.baseURL = process.env.COMMERCE_API_URL || 'https://commerce.gov.in/api';
    this.apiKey = process.env.COMMERCE_API_KEY || '';
  }

  async getTradeData(params: {
    commodity?: string;
    tradeType?: 'import' | 'export' | 'both';
    country?: string;
    startDate: string;
    endDate: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: CommerceAPIData[]; pagination?: any }> {
    try {
      const cacheKey = `commerce:trade:${JSON.stringify(params)}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Commerce API cache hit for trade data`);
        return cached;
      }

      const url = `${this.baseURL}/trade/data`;
      const response = await axios.get<CommerceResponse>(url, {
        params: {
          commodity: params.commodity,
          trade_type: params.tradeType,
          country: params.country,
          start_date: params.startDate,
          end_date: params.endDate,
          page: params.page || 1,
          limit: params.limit || 100
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error(`Commerce API Error: ${response.data.message}`);
      }

      const result = {
        data: response.data.data,
        pagination: response.data.pagination
      };
      
      // Cache for 20 minutes
      await cacheSet(cacheKey, result, 1200);
      
      logger.info(`Commerce API: Fetched ${response.data.data.length} trade records`);
      return result;
    } catch (error) {
      logger.error('Commerce API Error fetching trade data:', error);
      throw new Error(`Failed to fetch trade data from Commerce API: ${error}`);
    }
  }

  async getCountryTradeData(country: string, period: string = '1Y'): Promise<CommerceAPIData[]> {
    try {
      const cacheKey = `commerce:country:${country}:${period}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Commerce API cache hit for country ${country} trade data`);
        return cached;
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

      const url = `${this.baseURL}/countries/${country}/trade`;
      const response = await axios.get<CommerceResponse>(url, {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error(`Commerce API Error: ${response.data.message}`);
      }

      const data = response.data.data;
      
      // Cache for 30 minutes
      await cacheSet(cacheKey, data, 1800);
      
      logger.info(`Commerce API: Fetched ${data.length} trade records for ${country}`);
      return data;
    } catch (error) {
      logger.error(`Commerce API Error fetching trade data for ${country}:`, error);
      throw new Error(`Failed to fetch trade data for ${country} from Commerce API: ${error}`);
    }
  }

  async getCommodityTradeData(commodity: string, period: string = '1Y'): Promise<CommerceAPIData[]> {
    try {
      const cacheKey = `commerce:commodity:${commodity}:${period}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Commerce API cache hit for commodity ${commodity} trade data`);
        return cached;
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

      const url = `${this.baseURL}/commodities/${commodity}/trade`;
      const response = await axios.get<CommerceResponse>(url, {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error(`Commerce API Error: ${response.data.message}`);
      }

      const data = response.data.data;
      
      // Cache for 25 minutes
      await cacheSet(cacheKey, data, 1500);
      
      logger.info(`Commerce API: Fetched ${data.length} trade records for ${commodity}`);
      return data;
    } catch (error) {
      logger.error(`Commerce API Error fetching trade data for ${commodity}:`, error);
      throw new Error(`Failed to fetch trade data for ${commodity} from Commerce API: ${error}`);
    }
  }

  async getTradeStatistics(params: {
    commodity?: string;
    country?: string;
    period?: string;
    tradeType?: 'import' | 'export' | 'both';
  }): Promise<any> {
    try {
      const cacheKey = `commerce:stats:${JSON.stringify(params)}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Commerce API cache hit for trade statistics`);
        return cached;
      }

      const url = `${this.baseURL}/trade/statistics`;
      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      const data = response.data;
      
      // Cache for 45 minutes
      await cacheSet(cacheKey, data, 2700);
      
      logger.info(`Commerce API: Fetched trade statistics`);
      return data;
    } catch (error) {
      logger.error('Commerce API Error fetching trade statistics:', error);
      throw new Error(`Failed to fetch trade statistics from Commerce API: ${error}`);
    }
  }

  async getTopTradingPartners(commodity?: string, tradeType?: 'import' | 'export', limit: number = 10): Promise<any[]> {
    try {
      const cacheKey = `commerce:top-partners:${commodity || 'all'}:${tradeType || 'both'}:${limit}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Commerce API cache hit for top trading partners`);
        return cached;
      }

      const url = `${this.baseURL}/trade/top-partners`;
      const response = await axios.get(url, {
        params: {
          commodity,
          trade_type: tradeType,
          limit
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      const data = response.data;
      
      // Cache for 1 hour
      await cacheSet(cacheKey, data, 3600);
      
      logger.info(`Commerce API: Fetched top trading partners`);
      return data;
    } catch (error) {
      logger.error('Commerce API Error fetching top trading partners:', error);
      throw new Error(`Failed to fetch top trading partners from Commerce API: ${error}`);
    }
  }

  async getTradeTrends(params: {
    commodity?: string;
    country?: string;
    period?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
  }): Promise<any[]> {
    try {
      const cacheKey = `commerce:trends:${JSON.stringify(params)}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Commerce API cache hit for trade trends`);
        return cached;
      }

      const url = `${this.baseURL}/trade/trends`;
      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      const data = response.data;
      
      // Cache for 30 minutes
      await cacheSet(cacheKey, data, 1800);
      
      logger.info(`Commerce API: Fetched trade trends`);
      return data;
    } catch (error) {
      logger.error('Commerce API Error fetching trade trends:', error);
      throw new Error(`Failed to fetch trade trends from Commerce API: ${error}`);
    }
  }

  async getPolicyUpdates(): Promise<any[]> {
    try {
      const cacheKey = 'commerce:policy-updates';
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info('Commerce API cache hit for policy updates');
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
      
      // Cache for 4 hours
      await cacheSet(cacheKey, data, 14400);
      
      logger.info('Commerce API: Fetched policy updates');
      return data;
    } catch (error) {
      logger.error('Commerce API Error fetching policy updates:', error);
      throw new Error(`Failed to fetch policy updates from Commerce API: ${error}`);
    }
  }

  async getTariffInformation(commodity: string, country?: string): Promise<any> {
    try {
      const cacheKey = `commerce:tariff:${commodity}:${country || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Commerce API cache hit for tariff information`);
        return cached;
      }

      const url = `${this.baseURL}/tariffs/${commodity}`;
      const response = await axios.get(url, {
        params: { country },
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
      
      logger.info(`Commerce API: Fetched tariff information for ${commodity}`);
      return data;
    } catch (error) {
      logger.error(`Commerce API Error fetching tariff information for ${commodity}:`, error);
      throw new Error(`Failed to fetch tariff information for ${commodity} from Commerce API: ${error}`);
    }
  }

  async getTradeBalance(country: string, period: string = '1Y'): Promise<any> {
    try {
      const cacheKey = `commerce:balance:${country}:${period}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Commerce API cache hit for trade balance`);
        return cached;
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

      const url = `${this.baseURL}/countries/${country}/balance`;
      const response = await axios.get(url, {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        },
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
      
      logger.info(`Commerce API: Fetched trade balance for ${country}`);
      return data;
    } catch (error) {
      logger.error(`Commerce API Error fetching trade balance for ${country}:`, error);
      throw new Error(`Failed to fetch trade balance for ${country} from Commerce API: ${error}`);
    }
  }

  // Helper method to map Commerce API commodities to our mineral database
  mapCommerceCommodityToMineral(commerceCommodity: string): string | null {
    const commodityMap: { [key: string]: string } = {
      'iron_ore': 'Iron Ore',
      'coal': 'Coal',
      'bauxite': 'Bauxite',
      'copper_ore': 'Copper',
      'lead_ore': 'Lead',
      'zinc_ore': 'Zinc',
      'manganese_ore': 'Manganese',
      'chromite_ore': 'Chromite',
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
      'aluminum': 'Aluminum',
      'tin': 'Tin',
      'tungsten': 'Tungsten',
      'uranium': 'Uranium'
    };

    return commodityMap[commerceCommodity.toLowerCase()] || null;
  }

  // Rate limiting helper
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Bulk data fetch with rate limiting
  async fetchBulkTradeData(requests: Array<{
    commodity?: string;
    country?: string;
    startDate: string;
    endDate: string;
  }>): Promise<CommerceAPIData[]> {
    const allData: CommerceAPIData[] = [];
    
    for (const request of requests) {
      try {
        const result = await this.getTradeData(request);
        allData.push(...result.data);
        
        // Rate limiting delay
        await this.delay(this.rateLimitDelay);
      } catch (error) {
        logger.error(`Failed to fetch trade data for request:`, error);
        // Continue with other requests
      }
    }
    
    return allData;
  }

  // Data validation helper
  validateTradeData(data: CommerceAPIData[]): boolean {
    return data.every(item => 
      item.commodity && 
      item.trade_type && 
      item.country && 
      item.value_usd > 0 && 
      item.quantity > 0 && 
      item.date
    );
  }

  // Data transformation helper
  transformTradeData(data: CommerceAPIData[]): any[] {
    return data.map(item => ({
      mineral_id: this.mapCommerceCommodityToMineral(item.commodity),
      country_id: item.country,
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
    }));
  }
}
