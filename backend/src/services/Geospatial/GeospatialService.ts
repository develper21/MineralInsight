import { Request, Response } from 'express';
import { db } from '@/config/database';
import { cacheSet, cacheGet } from '@/config/redis';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

interface GeoPoint {
  latitude: number;
  longitude: number;
  properties?: any;
}

interface GeoPolygon {
  type: 'Polygon';
  coordinates: number[][][];
  properties?: any;
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoPoint | GeoPolygon;
  properties: any;
}

interface GeoJSONResponse {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export class GeospatialService {
  async getMineLocations(mineral?: string, state?: string): Promise<GeoJSONResponse> {
    try {
      const cacheKey = `geospatial:mines:${mineral || 'all'}:${state || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Geospatial API cache hit for mine locations`);
        return cached;
      }

      let query = db('states')
        .join('countries', 'states.country_id', 'countries.id')
        .leftJoin('production_data', 'states.id', 'production_data.state_id')
        .leftJoin('minerals', 'production_data.mineral_id', 'minerals.id')
        .select(
          'states.name as state_name',
          'states.latitude',
          'states.longitude',
          'states.mineral_resources',
          'states.mining_companies',
          'minerals.name as mineral_name',
          'production_data.quantity',
          'production_data.mine_name',
          'production_data.company',
          'countries.name as country_name'
        )
        .where('states.is_active', true);

      if (state) {
        query = query.where('states.name', 'ilike', `%${state}%`);
      }

      if (mineral) {
        query = query.where('minerals.name', 'ilike', `%${mineral}%`);
      }

      const results = await query;

      // Convert to GeoJSON format
      const features: GeoJSONFeature[] = results.map(row => {
        if (row.latitude && row.longitude) {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [row.longitude, row.latitude]
            },
            properties: {
              state: row.state_name,
              country: row.country_name,
              mineral: row.mineral_name,
              production: row.quantity,
              mine: row.mine_name,
              company: row.company,
              mineral_resources: row.mineral_resources ? JSON.parse(row.mineral_resources) : [],
              mining_companies: row.mining_companies ? JSON.parse(row.mining_companies) : []
            }
          };
        }
        return null;
      }).filter(Boolean) as GeoJSONFeature[];

      const geoJSON: GeoJSONResponse = {
        type: 'FeatureCollection',
        features
      };

      // Cache for 30 minutes
      await cacheSet(cacheKey, geoJSON, 1800);

      logger.info(`Generated GeoJSON for ${features.length} mine locations`);
      return geoJSON;
    } catch (error) {
      logger.error('Error generating mine locations GeoJSON:', error);
      throw new CustomError('Failed to generate mine locations', 500);
    }
  }

  async getStateBoundaries(state?: string): Promise<GeoJSONResponse> {
    try {
      const cacheKey = `geospatial:boundaries:${state || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Geospatial API cache hit for state boundaries`);
        return cached;
      }

      let query = db('states')
        .join('countries', 'states.country_id', 'countries.id')
        .select(
          'states.name',
          'states.latitude',
          'states.longitude',
          'states.area_sq_km',
          'countries.name as country_name'
        )
        .where('states.is_active', true);

      if (state) {
        query = query.where('states.name', 'ilike', `%${state}%`);
      }

      const states = await query;

      // Generate approximate boundaries (simplified - in production use proper GIS data)
      const features: GeoJSONFeature[] = states.map(stateRow => {
        // Create a simple rectangular boundary around the state center
        const lat = stateRow.latitude || 20.5937; // Default to India center
        const lon = stateRow.longitude || 78.9629;
        const size = Math.sqrt(stateRow.area_sq_km || 100000) * 0.01; // Rough size calculation

        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lon - size, lat - size],
              [lon + size, lat - size],
              [lon + size, lat + size],
              [lon - size, lat + size],
              [lon - size, lat - size]
            ]]
          },
          properties: {
            name: stateRow.name,
            country: stateRow.country_name,
            area_sq_km: stateRow.area_sq_km,
            center: [lat, lon]
          }
        };
      });

      const geoJSON: GeoJSONResponse = {
        type: 'FeatureCollection',
        features
      };

      // Cache for 2 hours
      await cacheSet(cacheKey, geoJSON, 7200);

      logger.info(`Generated boundaries for ${features.length} states`);
      return geoJSON;
    } catch (error) {
      logger.error('Error generating state boundaries GeoJSON:', error);
      throw new CustomError('Failed to generate state boundaries', 500);
    }
  }

  async getProductionHeatmap(mineral: string, period: string = '1Y'): Promise<GeoJSONResponse> {
    try {
      const cacheKey = `geospatial:heatmap:${mineral}:${period}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Geospatial API cache hit for production heatmap`);
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

      const productionData = await db('production_data')
        .join('states', 'production_data.state_id', 'states.id')
        .join('minerals', 'production_data.mineral_id', 'minerals.id')
        .where('minerals.name', mineral)
        .whereBetween('production_data.production_date', [startDate, now])
        .select(
          'states.latitude',
          'states.longitude',
          'states.name as state_name',
          db.raw('SUM(production_data.quantity) as total_production'),
          db.raw('COUNT(*) as production_periods'),
          db.raw('AVG(production_data.grade) as avg_grade')
        )
        .groupBy('states.id', 'states.latitude', 'states.longitude', 'states.name');

      // Generate heatmap points with intensity based on production
      const features: GeoJSONFeature[] = productionData.map(row => {
        if (row.latitude && row.longitude) {
          const intensity = Math.log(Number(row.total_production) + 1) / Math.log(1000000); // Normalize production
          
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [row.longitude, row.latitude]
            },
            properties: {
              state: row.state_name,
              production: Number(row.total_production),
              intensity: Math.min(intensity, 1), // Cap at 1
              periods: Number(row.production_periods),
              avg_grade: Number(row.avg_grade),
              mineral
            }
          };
        }
        return null;
      }).filter(Boolean) as GeoJSONFeature[];

      const geoJSON: GeoJSONResponse = {
        type: 'FeatureCollection',
        features
      };

      // Cache for 1 hour
      await cacheSet(cacheKey, geoJSON, 3600);

      logger.info(`Generated production heatmap for ${features.length} locations`);
      return geoJSON;
    } catch (error) {
      logger.error('Error generating production heatmap:', error);
      throw new CustomError('Failed to generate production heatmap', 500);
    }
  }

  async getTradeFlowRoutes(commodity: string, period: string = '1Y'): Promise<any> {
    try {
      const cacheKey = `geospatial:trade-flows:${commodity}:${period}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Geospatial API cache hit for trade flow routes`);
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

      // Get trade data between countries
      const tradeData = await db('trade_data')
        .join('minerals', 'trade_data.mineral_id', 'minerals.id')
        .join('countries as exporter', 'trade_data.country_id', 'exporter.id')
        .leftJoin('countries as importer', db.raw('JSON_EXTRACT(trade_data.metadata, "$.destination_country")'), 'importer.id')
        .where('minerals.name', commodity)
        .whereBetween('trade_data.trade_date', [startDate, now])
        .where('trade_data.trade_type', 'export')
        .select(
          'exporter.latitude as exporter_lat',
          'exporter.longitude as exporter_lon',
          'exporter.name as exporter_name',
          'importer.latitude as importer_lat',
          'importer.longitude as importer_lon',
          'importer.name as importer_name',
          db.raw('SUM(trade_data.value_usd) as total_value'),
          db.raw('SUM(trade_data.quantity) as total_quantity')
        )
        .groupBy('exporter.id', 'importer.id')
        .orderBy('total_value', 'desc')
        .limit(50);

      // Generate trade flow routes
      const routes = tradeData.map(row => {
        if (row.exporter_lat && row.exporter_lon && row.importer_lat && row.importer_lon) {
          return {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [row.exporter_lon, row.exporter_lat],
                [row.importer_lon, row.importer_lat]
              ]
            },
            properties: {
              exporter: row.exporter_name,
              importer: row.importer_name,
              commodity,
              value: Number(row.total_value),
              quantity: Number(row.total_quantity),
              period
            }
          };
        }
        return null;
      }).filter(Boolean);

      // Cache for 2 hours
      await cacheSet(cacheKey, routes, 7200);

      logger.info(`Generated ${routes.length} trade flow routes for ${commodity}`);
      return routes;
    } catch (error) {
      logger.error('Error generating trade flow routes:', error);
      throw new CustomError('Failed to generate trade flow routes', 500);
    }
  }

  async getRiskZones(riskType: string = 'supply', mineral?: string): Promise<GeoJSONResponse> {
    try {
      const cacheKey = `geospatial:risk-zones:${riskType}:${mineral || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Geospatial API cache hit for risk zones`);
        return cached;
      }

      let query = db('risk_assessments')
        .join('minerals', 'risk_assessments.mineral_id', 'minerals.id')
        .leftJoin('countries', 'risk_assessments.country_id', 'countries.id')
        .leftJoin('states', 'risk_assessments.state_id', 'states.id')
        .where('risk_assessments.risk_type', riskType)
        .where('risk_assessments.risk_score', '>', 50)
        .select(
          'risk_assessments.risk_score',
          'risk_assessments.risk_level',
          'risk_assessments.risk_factors',
          'minerals.name as mineral_name',
          'countries.name as country_name',
          'countries.latitude as country_lat',
          'countries.longitude as country_lon',
          'states.name as state_name',
          'states.latitude as state_lat',
          'states.longitude as state_lon'
        );

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      const riskData = await query;

      // Generate risk zones
      const features: GeoJSONFeature[] = riskData.map(row => {
        // Use state coordinates if available, otherwise country coordinates
        const lat = row.state_lat || row.country_lat;
        const lon = row.state_lon || row.country_lon;

        if (lat && lon) {
          // Create a circular risk zone around the location
          const radius = (row.risk_score / 100) * 5; // Scale radius by risk score
          const points = [];
          const sides = 32; // Number of points in the circle

          for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * 2 * Math.PI;
            const pointLat = lat + radius * Math.cos(angle);
            const pointLon = lon + radius * Math.sin(angle);
            points.push([pointLon, pointLat]);
          }

          return {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [points]
            },
            properties: {
              risk_score: row.risk_score,
              risk_level: row.risk_level,
              risk_type: riskType,
              mineral: row.mineral_name,
              country: row.country_name,
              state: row.state_name,
              risk_factors: row.risk_factors ? JSON.parse(row.risk_factors) : []
            }
          };
        }
        return null;
      }).filter(Boolean) as GeoJSONFeature[];

      const geoJSON: GeoJSONResponse = {
        type: 'FeatureCollection',
        features
      };

      // Cache for 1 hour
      await cacheSet(cacheKey, geoJSON, 3600);

      logger.info(`Generated ${features.length} risk zones for ${riskType}`);
      return geoJSON;
    } catch (error) {
      logger.error('Error generating risk zones:', error);
      throw new CustomError('Failed to generate risk zones', 500);
    }
  }

  async calculateDistance(point1: GeoPoint, point2: GeoPoint): Promise<number> {
    // Haversine formula to calculate distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async findNearbyMines(latitude: number, longitude: number, radius: number = 50, mineral?: string): Promise<any[]> {
    try {
      const cacheKey = `geospatial:nearby:${latitude}:${longitude}:${radius}:${mineral || 'all'}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Geospatial API cache hit for nearby mines`);
        return cached;
      }

      let query = db('states')
        .leftJoin('production_data', 'states.id', 'production_data.state_id')
        .leftJoin('minerals', 'production_data.mineral_id', 'minerals.id')
        .select(
          'states.name',
          'states.latitude',
          'states.longitude',
          'states.mineral_resources',
          'minerals.name as mineral_name',
          'production_data.quantity',
          'production_data.mine_name',
          'production_data.company'
        )
        .where('states.is_active', true);

      if (mineral) {
        query = query.where('minerals.name', mineral);
      }

      const mines = await query;
      const nearbyMines = [];

      for (const mine of mines) {
        if (mine.latitude && mine.longitude) {
          const distance = await this.calculateDistance(
            { latitude, longitude },
            { latitude: mine.latitude, longitude: mine.longitude }
          );

          if (distance <= radius) {
            nearbyMines.push({
              ...mine,
              distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
            });
          }
        }
      }

      // Sort by distance
      nearbyMines.sort((a, b) => a.distance - b.distance);

      // Cache for 15 minutes
      await cacheSet(cacheKey, nearbyMines, 900);

      logger.info(`Found ${nearbyMines.length} mines within ${radius}km`);
      return nearbyMines;
    } catch (error) {
      logger.error('Error finding nearby mines:', error);
      throw new CustomError('Failed to find nearby mines', 500);
    }
  }

  async getClusterAnalysis(mineral: string): Promise<any> {
    try {
      const cacheKey = `geospatial:clusters:${mineral}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        logger.info(`Geospatial API cache hit for cluster analysis`);
        return cached;
      }

      // Get all production locations for the mineral
      const locations = await db('production_data')
        .join('states', 'production_data.state_id', 'states.id')
        .join('minerals', 'production_data.mineral_id', 'minerals.id')
        .where('minerals.name', mineral)
        .whereNotNull('states.latitude')
        .whereNotNull('states.longitude')
        .select(
          'states.latitude',
          'states.longitude',
          'states.name as state_name',
          db.raw('SUM(production_data.quantity) as total_production')
        )
        .groupBy('states.id', 'states.latitude', 'states.longitude', 'states.name');

      // Simple clustering based on distance (in production, use proper clustering algorithms)
      const clusters = this.performSimpleClustering(locations, 200); // 200km cluster radius

      // Cache for 2 hours
      await cacheSet(cacheKey, clusters, 7200);

      logger.info(`Generated ${clusters.length} clusters for ${mineral}`);
      return clusters;
    } catch (error) {
      logger.error('Error performing cluster analysis:', error);
      throw new CustomError('Failed to perform cluster analysis', 500);
    }
  }

  // Helper methods
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private performSimpleClustering(locations: any[], radius: number): any[] {
    const clusters = [];
    const visited = new Set();

    for (const location of locations) {
      if (visited.has(location.state_name)) continue;

      const cluster = {
        center: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        members: [location],
        total_production: Number(location.total_production)
      };

      visited.add(location.state_name);

      // Find nearby locations
      for (const otherLocation of locations) {
        if (visited.has(otherLocation.state_name)) continue;

        const distance = Math.sqrt(
          Math.pow(location.latitude - otherLocation.latitude, 2) +
          Math.pow(location.longitude - otherLocation.longitude, 2)
        ) * 111; // Rough conversion to kilometers

        if (distance <= radius) {
          cluster.members.push(otherLocation);
          cluster.total_production += Number(otherLocation.total_production);
          visited.add(otherLocation.state_name);
        }
      }

      clusters.push(cluster);
    }

    return clusters.sort((a, b) => b.total_production - a.total_production);
  }
}
