import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';

let redisClient: RedisClientType | undefined;
let failureLogged = false;

/**
 * Redis is OPTIONAL — the API is fully functional without it (cache helpers
 * fail soft). Connection strategy:
 *  - No REDIS_URL / REDIS_HOST configured  -> skip entirely
 *  - Connection fails                      -> log ONCE, never retry-spam
 *  - REDIS_ENABLED=false                   -> force disable
 */
export const isRedisConfigured = (): boolean => {
  if (process.env.REDIS_ENABLED === 'false') return false;
  return Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);
};

export const connectRedis = async (): Promise<RedisClientType | null> => {
  if (!isRedisConfigured()) {
    logger.info('Redis not configured — running without cache (set REDIS_URL to enable)');
    return null;
  }

  try {
    const redisConfig: any = process.env.REDIS_URL
      ? { url: process.env.REDIS_URL }
      : {
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            reconnectStrategy: (retries: number) => {
              // Cap retries: after 3 failures give up entirely (cache is optional)
              if (retries >= 3) return false as any;
              return Math.min(retries * 500, 2000);
            },
          },
          database: parseInt(process.env.REDIS_DB || '0'),
        };

    if (!process.env.REDIS_URL && process.env.REDIS_PASSWORD) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    // URL-based config also gets the capped reconnect strategy
    if (process.env.REDIS_URL) {
      redisConfig.socket = {
        reconnectStrategy: (retries: number) => {
          if (retries >= 3) return false as any;
          return Math.min(retries * 500, 2000);
        },
      };
    }

    redisClient = createClient(redisConfig);

    redisClient.on('error', (err) => {
      // Log the first failure only — no spam when Redis is unreachable
      if (!failureLogged) {
        failureLogged = true;
        logger.warn(`Redis unavailable (${err.message}) — continuing without cache`);
      }
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      failureLogged = false;
      logger.info('Redis Client Ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis Client Disconnected');
    });

    // Race the connection against a short timeout so a dead Redis
    // can never block server startup or the port binding.
    const connectPromise = redisClient.connect();
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Redis connect timeout (5s)')), 5000)
    );

    await Promise.race([connectPromise, timeout]);
    return redisClient;
  } catch (error) {
    logger.warn(
      `Redis unavailable (${(error as Error).message}) — continuing without cache`
    );
    // Clean up the half-open client so it can't keep retrying in background
    try {
      if (redisClient && redisClient.isOpen) await redisClient.quit();
    } catch {
      /* ignore */
    }
    redisClient = undefined;
    return null;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.debug('Error closing Redis connection');
  }
};

const getClient = (): RedisClientType | null => {
  if (!redisClient || !redisClient.isOpen) return null;
  return redisClient;
};

// Cache helper functions — all fail soft so the API works without Redis
export const cacheSet = async (
  key: string,
  value: any,
  ttl: number = parseInt(process.env.CACHE_TTL || '3600')
): Promise<void> => {
  try {
    const client = getClient();
    if (!client) return;
    await client.setEx(key, ttl, JSON.stringify(value));
    logger.debug(`Cache set for key: ${key}`);
  } catch {
    /* cache unavailable — ignore */
  }
};

export const cacheGet = async <T = any>(key: string): Promise<T | null> => {
  try {
    const client = getClient();
    if (!client) return null;
    const value = await client.get(key);
    if (value) {
      logger.debug(`Cache hit for key: ${key}`);
      return JSON.parse(value) as T;
    }
    return null;
  } catch {
    return null;
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    const client = getClient();
    if (!client) return;
    await client.del(key);
  } catch {
    /* ignore */
  }
};

export const cacheExists = async (key: string): Promise<boolean> => {
  try {
    const client = getClient();
    if (!client) return false;
    return (await client.exists(key)) === 1;
  } catch {
    return false;
  }
};

export const cacheFlush = async (): Promise<void> => {
  try {
    const client = getClient();
    if (!client) return;
    await client.flushDb();
    logger.info('Cache flushed');
  } catch {
    /* ignore */
  }
};
