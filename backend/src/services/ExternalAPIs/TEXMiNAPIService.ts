import axios from 'axios';
import { logger } from '@/utils/logger';
import { cacheSet, cacheGet } from '@/config/redis';

interface TEXMiNData {
  mineral: string;
  state: string;
  district: string;
  company: string;
  mine_type: 'open_cast' | 'underground' | 'alluvial';
  production: number;
  reserves: number;
  grade: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  last_updated: string;
  source: string;
  metadata?: any;
}

interface TEXMiNResponse {
  success: boolean;
  data: TEXMiNData[];
  message?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class TEXMiNAPIService {
  private baseURL: string;
  private apiKey: string;
  private rateLimitDelay: number = 2000; // 2 seconds between requests

  constructor() {
    this.baseURL = process.env.TEXMIN_API_URL || 'https://texmin.in/api';
    this.apiKey = process.env.TEXMIN_API_KEY || '';
  }

  async getMiningData(params: {
    mineral?: string;
    state?: string;
    district?: string;
    company?: string;
    mineType?: 'open_cast' | 'underground' | 'alluvial' | 'all';
    page?: number;
    limit?: number;
  }): Promise<{ data: TEXMiNData[]; pagination?: any }> {
    try {
      const cacheKey = `texmin:mining:${JSON.stringify(params)}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`TEXMiN API cache hit for mining data`);
        return cached;
      }

      const url = `${this.baseURL}/mining/data`;
      const response = await axios.get<TEXMiNResponse>(url, {
        params: {
          mineral: params.mineral,
          state: params.state,
          district: params.district,
          company: params.company,
          mine_type: params.mineType,
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
        throw new Error(`TEXMiN API Error: ${response.data.message}`);
      }

      const result = {
        data: response.data.data,
        pagination: response.data.pagination
      };
      
      // Cache for 30 minutes
      await cacheSet(cacheKey, result, 1800);
      
      logger.info(`TEXMiN API: Fetched ${response.data.data.length} mining records`);
      return result;
    } catch (error) {
      logger.error('TEXMiN API Error fetching mining data:', error);
      throw new Error(`Failed to fetch mining data from TEXMiN API: ${error}`);
    }
  }

  async getStateMiningData(state: string, mineral?: string): Promise<TEXMiNData[]> {
    try {
      const cacheKey = `texmin:state:${state}:${mineral || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`TEXMiN API cache hit for state ${state} mining data`);
        return cached;
      }

      const url = `${this.baseURL}/states/${state}/mining`;
      const response = await axios.get<TEXMiNResponse>(url, {
        params: { mineral },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error(`TEXMiN API Error: ${response.data.message}`);
      }

      const data = response.data.data;
      
      // Cache for 45 minutes
      await cacheSet(cacheKey, data, 2700);
      
      logger.info(`TEXMiN API: Fetched ${data.length} mining records for ${state}`);
      return data;
    } catch (error) {
      logger.error(`TEXMiN API Error fetching mining data for ${state}:`, error);
      throw new Error(`Failed to fetch mining data for ${state} from TEXMiN API: ${error}`);
    }
  }

  async getMineralReserves(mineral: string, state?: string): Promise<TEXMiNData[]> {
    try {
      const cacheKey = `texmin:reserves:${mineral}:${state || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`TEXMiN API cache hit for ${mineral} reserves`);
        return cached;
      }

      const url = `${this.baseURL}/minerals/${mineral}/reserves`;
      const response = await axios.get<TEXMiNResponse>(url, {
        params: { state },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error(`TEXMiN API Error: ${response.data.message}`);
      }

      const data = response.data.data;
      
      // Cache for 2 hours
      await cacheSet(cacheKey, data, 7200);
      
      logger.info(`TEXMiN API: Fetched ${data.length} reserve records for ${mineral}`);
      return data;
    } catch (error) {
      logger.error(`TEXMiN API Error fetching reserves for ${mineral}:`, error);
      throw new Error(`Failed to fetch reserves for ${mineral} from TEXMiN API: ${error}`);
    }
  }

  async getProductionData(mineral: string, state?: string, period?: string): Promise<TEXMiNData[]> {
    try {
      const cacheKey = `texmin:production:${mineral}:${state || 'all'}:${period || 'current'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`TEXMiN API cache hit for ${mineral} production data`);
        return cached;
      }

      const url = `${this.baseURL}/minerals/${mineral}/production`;
      const response = await axios.get<TEXMiNResponse>(url, {
        params: { 
          state,
          period: period || 'current'
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error(`TEXMiN API Error: ${response.data.message}`);
      }

      const data = response.data.data;
      
      // Cache for 1 hour
      await cacheSet(cacheKey, data, 3600);
      
      logger.info(`TEXMiN API: Fetched ${data.length} production records for ${mineral}`);
      return data;
    } catch (error) {
      logger.error(`TEXMiN API Error fetching production data for ${mineral}:`, error);
      throw new Error(`Failed to fetch production data for ${mineral} from TEXMiN API: ${error}`);
    }
  }

  async getMiningCompanies(state?: string, mineral?: string): Promise<any[]> {
    try {
      const cacheKey = `texmin:companies:${state || 'all'}:${mineral || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`TEXMiN API cache hit for mining companies`);
        return cached;
      }

      const url = `${this.baseURL}/companies`;
      const response = await axios.get(url, {
        params: { state, mineral },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      const data = response.data;
      
      // Cache for 3 hours
      await cacheSet(cacheKey, data, 10800);
      
      logger.info(`TEXMiN API: Fetched mining companies data`);
      return data;
    } catch (error) {
      logger.error('TEXMiN API Error fetching mining companies:', error);
      throw new Error(`Failed to fetch mining companies from TEXMiN API: ${error}`);
    }
  }

  async getMineLocations(mineral?: string, state?: string): Promise<TEXMiNData[]> {
    try {
      const cacheKey = `texmin:locations:${mineral || 'all'}:${state || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`TEXMiN API cache hit for mine locations`);
        return cached;
      }

      const url = `${this.baseURL}/mines/locations`;
      const response = await axios.get<TEXMiNResponse>(url, {
        params: { mineral, state },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error(`TEXMiN API Error: ${response.data.message}`);
      }

      const data = response.data.data;
      
      // Cache for 2 hours
      await cacheSet(cacheKey, data, 7200);
      
      logger.info(`TEXMiN API: Fetched ${data.length} mine locations`);
      return data;
    } catch (error) {
      logger.error('TEXMiN API Error fetching mine locations:', error);
      throw new Error(`Failed to fetch mine locations from TEXMiN API: ${error}`);
    }
  }

  async getMiningProjects(status?: 'active' | 'planned' | 'completed' | 'suspended', state?: string): Promise<any[]> {
    try {
      const cacheKey = `texmin:projects:${status || 'all'}:${state || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`TEXMiN API cache hit for mining projects`);
        return cached;
      }

      const url = `${this.baseURL}/projects`;
      const response = await axios.get(url, {
        params: { status, state },
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
      
      logger.info(`TEXMiN API: Fetched mining projects`);
      return data;
    } catch (error) {
      logger.error('TEXMiN API Error fetching mining projects:', error);
      throw new Error(`Failed to fetch mining projects from TEXMiN API: ${error}`);
    }
  }

  async getEnvironmentalData(mineral: string, state?: string): Promise<any[]> {
    try {
      const cacheKey = `texmin:environmental:${mineral}:${state || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`TEXMiN API cache hit for environmental data`);
        return cached;
      }

      const url = `${this.baseURL}/environmental/data`;
      const response = await axios.get(url, {
        params: { mineral, state },
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
      
      logger.info(`TEXMiN API: Fetched environmental data for ${mineral}`);
      return data;
    } catch (error) {
      logger.error(`TEXMiN API Error fetching environmental data for ${mineral}:`, error);
      throw new Error(`Failed to fetch environmental data for ${mineral} from TEXMiN API: ${error}`);
    }
  }

  async getPolicyRegulations(state?: string, mineral?: string): Promise<any[]> {
    try {
      const cacheKey = `texmin:policy:${state || 'all'}:${mineral || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`TEXMiN API cache hit for policy regulations`);
        return cached;
      }

      const url = `${this.baseURL}/policy/regulations`;
      const response = await axios.get(url, {
        params: { state, mineral },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      const data = response.data;
      
      // Cache for 8 hours
      await cacheSet(cacheKey, data, 28800);
      
      logger.info(`TEXMiN API: Fetched policy regulations`);
      return data;
    } catch (error) {
      logger.error('TEXMiN API Error fetching policy regulations:', error);
      throw new Error(`Failed to fetch policy regulations from TEXMiN API: ${error}`);
    }
  }

  async getMarketIntelligence(mineral?: string, period?: string): Promise<any> {
    try {
      const cacheKey = `texmin:intelligence:${mineral || 'all'}:${period || 'current'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`TEXMiN API cache hit for market intelligence`);
        return cached;
      }

      const url = `${this.baseURL}/intelligence`;
      const response = await axios.get(url, {
        params: { mineral, period },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MineralInsight-API/1.0'
        },
        timeout: 30000
      });

      const data = response.data;
      
      // Cache for 3 hours
      await cacheSet(cacheKey, data, 10800);
      
      logger.info(`TEXMiN API: Fetched market intelligence`);
      return data;
    } catch (error) {
      logger.error('TEXMiN API Error fetching market intelligence:', error);
      throw new Error(`Failed to fetch market intelligence from TEXMiN API: ${error}`);
    }
  }

  // Helper method to map TEXMiN minerals to our mineral database
  mapTEXMiNMineralToMineral(texminMineral: string): string | null {
    const mineralMap: { [key: string]: string } = {
      'iron_ore': 'Iron Ore',
      'coal': 'Coal',
      'lignite': 'Coal',
      'bauxite': 'Bauxite',
      'copper_ore': 'Copper',
      'lead_ore': 'Lead',
      'zinc_ore': 'Zinc',
      'manganese_ore': 'Manganese',
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
      'tin': 'Tin',
      'tungsten': 'Tungsten',
      'magnesite': 'Magnesite',
      'kyanite': 'Kyanite',
      'sillimanite': 'Sillimanite',
      'andalusite': 'Andalusite',
      'pyrite': 'Pyrite',
      'gypsum': 'Gypsum',
      'sulphur': 'Sulphur',
      'phosphorite': 'Phosphorite',
      'asbestos': 'Asbestos',
      'mica': 'Mica',
      'vermiculite': 'Vermiculite',
      'quartz': 'Quartz',
      'silica_sand': 'Silica Sand',
      'clay': 'Clay',
      'fire_clay': 'Fire Clay',
      'ball_clay': 'Ball Clay',
      'china_clay': 'China Clay'
    };

    return mineralMap[texminMineral.toLowerCase()] || null;
  }

  // Helper method to map TEXMiN states to our state database
  mapTEXMiNStateToState(texminState: string): string | null {
    const stateMap: { [key: string]: string } = {
      'andhra_pradesh': 'Andhra Pradesh',
      'arunachal_pradesh': 'Arunachal Pradesh',
      'assam': 'Assam',
      'bihar': 'Bihar',
      'chhattisgarh': 'Chhattisgarh',
      'goa': 'Goa',
      'gujarat': 'Gujarat',
      'haryana': 'Haryana',
      'himachal_pradesh': 'Himachal Pradesh',
      'jharkhand': 'Jharkhand',
      'karnataka': 'Karnataka',
      'kerala': 'Kerala',
      'madhya_pradesh': 'Madhya Pradesh',
      'maharashtra': 'Maharashtra',
      'manipur': 'Manipur',
      'meghalaya': 'Meghalaya',
      'mizoram': 'Mizoram',
      'nagaland': 'Nagaland',
      'odisha': 'Odisha',
      'punjab': 'Punjab',
      'rajasthan': 'Rajasthan',
      'sikkim': 'Sikkim',
      'tamil_nadu': 'Tamil Nadu',
      'telangana': 'Telangana',
      'tripura': 'Tripura',
      'uttar_pradesh': 'Uttar Pradesh',
      'uttarakhand': 'Uttarakhand',
      'west_bengal': 'West Bengal'
    };

    return stateMap[texminState.toLowerCase()] || null;
  }

  // Rate limiting helper
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Bulk data fetch with rate limiting
  async fetchBulkMiningData(requests: Array<{
    mineral?: string;
    state?: string;
    dataType: 'reserves' | 'production' | 'mining';
  }>): Promise<TEXMiNData[]> {
    const allData: TEXMiNData[] = [];
    
    for (const request of requests) {
      try {
        let data: TEXMiNData[] = [];
        
        switch (request.dataType) {
          case 'reserves':
            data = await this.getMineralReserves(request.mineral!, request.state);
            break;
          case 'production':
            data = await this.getProductionData(request.mineral!, request.state);
            break;
          case 'mining':
            const result = await this.getMiningData({
              mineral: request.mineral,
              state: request.state
            });
            data = result.data;
            break;
        }
        
        allData.push(...data);
        
        // Rate limiting delay
        await this.delay(this.rateLimitDelay);
      } catch (error) {
        logger.error(`Failed to fetch ${request.dataType} data for request:`, error);
        // Continue with other requests
      }
    }
    
    return allData;
  }

  // Data validation helper
  validateMiningData(data: TEXMiNData[]): boolean {
    return data.every(item => 
      item.mineral && 
      item.state && 
      item.company && 
      item.production >= 0 && 
      item.reserves >= 0 && 
      item.grade >= 0 && 
      item.grade <= 100
    );
  }

  // Data transformation helper
  transformMiningData(data: TEXMiNData[]): any[] {
    return data.map(item => ({
      mineral_id: this.mapTEXMiNMineralToMineral(item.mineral),
      state_id: this.mapTEXMiNStateToState(item.state),
      company: item.company,
      mine_type: item.mine_type,
      production: item.production,
      reserves: item.reserves,
      grade: item.grade,
      coordinates: item.coordinates,
      last_updated: item.last_updated,
      source: 'TEXMiN API',
      metadata: {
        district: item.district,
        original_data: item.metadata
      }
    }));
  }
}
