import knex from 'knex';
import dotenv from 'dotenv';
import { logger } from '@/utils/logger';

// Load env BEFORE knex config is captured (imports evaluate before index.ts body)
dotenv.config({ path: '.env.local' });
dotenv.config();

const dbConfig = {
  client: 'pg',
  // Support full DATABASE_URL (Render/Heroku style) OR discrete DB_* variables
  connection: process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      }
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

    // Run migrations in production (e.g. on Render deploy)
    if (process.env.NODE_ENV === 'production' || process.env.RUN_MIGRATIONS === 'true') {
      await db.migrate.latest();
      logger.info('Database migrations completed');
    }

    // Optional seeding: set RUN_SEEDS=true to load seed data on boot
    if (process.env.RUN_SEEDS === 'true') {
      await db.seed.run();
      logger.info('Database seeds completed');
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
