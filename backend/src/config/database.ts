import knex from 'knex';
import { logger } from '@/utils/logger';

const dbConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mineralinsight',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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
    disableTransactions: false
  },
  seeds: {
    directory: './src/database/seeds'
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
    
    // Run migrations in production
    if (process.env.NODE_ENV === 'production') {
      await db.migrate.latest();
      logger.info('Database migrations completed');
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
