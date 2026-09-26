import './env'; // load env files before knex config is captured
import knex from 'knex';
import { logger } from '@/utils/logger';

/**
 * Normalize a connection string: strip sslmode/channel_binding query params
 * (they trigger the pg-connection-string verify-full warning) and pass an
 * explicit ssl config instead.
 */
const normalizeConnectionString = (
  url: string
): { connectionString: string; ssl: any } => {
  const ssl =
    process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false };
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('sslmode');
    parsed.searchParams.delete('channel_binding');
    return { connectionString: parsed.toString(), ssl };
  } catch {
    return { connectionString: url, ssl };
  }
};

const dbConfig = {
  client: 'pg',
  // Support full DATABASE_URL (Render/Neon/Heroku style) OR discrete DB_* variables
  connection: process.env.DATABASE_URL
    ? normalizeConnectionString(process.env.DATABASE_URL)
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'mineralinsight',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    directory: './src/database/migrations',
    tableName: 'knex_migrations',
    disableTransactions: false,
  },
  seeds: {
    directory: './src/database/seeds',
  },
  debug: process.env.NODE_ENV === 'development',
  acquireConnectionTimeout: 60000,
};

const db = knex(dbConfig);

export const connectDatabase = async (): Promise<void> => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    logger.info('Database connection established successfully');

    const isProduction = process.env.NODE_ENV === 'production';

    // Run migrations in production or when explicitly requested
    if (isProduction || process.env.RUN_MIGRATIONS === 'true') {
      await db.migrate.latest();
      logger.info('Database migrations completed');
    }

    // Seeds:
    //  1. RUN_SEEDS=true      -> always seed (explicit reseed request)
    //  2. production + empty  -> first-boot bootstrap (schema exists, no data)
    //     (won't re-run on later deploys once data exists)
    if (process.env.RUN_SEEDS === 'true') {
      await db.seed.run();
      logger.info('Database seeds completed (RUN_SEEDS=true)');
    } else if (isProduction || process.env.RUN_MIGRATIONS === 'true') {
      const [row] = await db('minerals').count('* as count');
      if (Number(row?.count || 0) === 0) {
        logger.info('Empty database detected — loading seed data (first boot)');
        await db.seed.run();
        logger.info('Database bootstrap seeds completed');
      }
    }
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await db.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

export { db };
