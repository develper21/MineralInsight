// Application Configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },

  // Application Info
  app: {
    name: import.meta.env.VITE_APP_NAME || 'MineralInsight',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Critical Mineral Intelligence Platform',
  },

  // Data Configuration
  data: {
    source: import.meta.env.VITE_DATA_SOURCE || 'DGCI&S',
    refreshInterval: parseInt(import.meta.env.VITE_DATA_REFRESH_INTERVAL) || 300000,
    lastUpdated: import.meta.env.VITE_LAST_UPDATED || new Date().toISOString().split('T')[0],
  },

  // Feature Flags
  features: {
    darkMode: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
    export: import.meta.env.VITE_ENABLE_EXPORT === 'true',
    print: import.meta.env.VITE_ENABLE_PRINT === 'true',
    share: import.meta.env.VITE_ENABLE_SHARE === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },

  // Development
  dev: {
    mode: import.meta.env.VITE_DEV_MODE === 'true',
    debug: import.meta.env.VITE_DEBUG_MODE === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
    testMode: import.meta.env.VITE_TEST_MODE === 'true',
    mockApi: import.meta.env.VITE_MOCK_API === 'true',
  },

  // Map Configuration
  map: {
    apiKey: import.meta.env.VITE_MAP_API_KEY || '',
    defaultCenter: {
      lat: parseFloat(import.meta.env.VITE_MAP_DEFAULT_LAT) || 20.5937,
      lng: parseFloat(import.meta.env.VITE_MAP_DEFAULT_LNG) || 78.9629,
    },
    defaultZoom: parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 5,
  },

  // Chart Configuration
  charts: {
    animationDuration: parseInt(import.meta.env.VITE_CHART_ANIMATION_DURATION) || 1000,
    defaultColors: (import.meta.env.VITE_CHART_DEFAULT_COLORS || 'copper,lithium,graphite').split(','),
  },

  // Security
  security: {
    enableCSP: import.meta.env.VITE_ENABLE_CSP === 'true',
    corsOrigin: import.meta.env.VITE_CORS_ORIGIN || 'http://localhost:5173',
  },

  // Performance
  performance: {
    enableLazyLoading: import.meta.env.VITE_ENABLE_LAZY_LOADING === 'true',
    chunkSizeLimit: parseInt(import.meta.env.VITE_CHUNK_SIZE_LIMIT) || 500000,
    enableCodeSplitting: import.meta.env.VITE_ENABLE_CODE_SPLITTING === 'true',
  },

  // Analytics
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  },
};

// Environment validation
export const validateConfig = () => {
  const requiredEnvVars = ['VITE_API_BASE_URL'];
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  return missingVars.length === 0;
};

// Export configuration for different environments
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const isTest = import.meta.env.TEST;
