import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { logger } from '@/utils/logger';
import '@/config/env'; // load .env.production / .env.local before anything reads process.env
import { connectDatabase } from '@/config/database';
import { connectRedis } from '@/config/redis';
import { db } from '@/config/database';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';

// Routes
import authRoutes from '@/routes/auth';
import mineralRoutes from '@/routes/minerals';
import tradeRoutes from '@/routes/trade';
import analyticsRoutes from '@/routes/analytics';
import riskRoutes from '@/routes/risk';
import forecastRoutes from '@/routes/forecast';
import stateRoutes from '@/routes/states';
import externalRoutes from '@/routes/external';
import geospatialRoutes from '@/routes/geospatial';
import dashboardRoutes from '@/routes/dashboard';

// Load environment variables — centralized loader (env.ts already ran via import)
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' });
dotenv.config();

// Allowed CORS origins: CORS_ORIGIN can be a comma-separated list
// (e.g. "http://localhost:5173,http://localhost:3000,https://myapp.netlify.app")
const getAllowedOrigins = (): string[] => {
  const defaults = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'];
  const configured = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return Array.from(new Set([...defaults, ...configured]));
};

const allowedOrigins = getAllowedOrigins();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: process.env.CORS_CREDENTIALS !== 'false'
  }
});

// Trust reverse proxy (Render / Netlify / Nginx) so rate limiting works behind it
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: process.env.CORS_CREDENTIALS !== 'false',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check endpoint — reports DB status (503 when DB is down)
let dbHealthy = false;
app.get('/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'OK' : 'DEGRADED',
    database: dbHealthy ? 'up' : 'down',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/minerals', mineralRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/geospatial', geospatialRoutes);

// Swagger documentation (development only)
if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SWAGGER === 'true') {
  import('swagger-ui-express').then((swaggerUi) => {
    import('swagger-jsdoc').then((swaggerJsdoc) => {
      const swaggerOptions = {
        definition: {
          openapi: '3.0.0',
          info: {
            title: 'MineralInsight API',
            version: '1.0.0',
            description: 'Critical Mineral Intelligence Platform API',
          },
          servers: [
            {
              url: `http://localhost:${process.env.PORT || 3001}`,
              description: 'Development server',
            },
          ],
        },
        apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
      };

      const specs = swaggerJsdoc.default(swaggerOptions);
      app.use('/api-docs', swaggerUi.default.serve, swaggerUi.default.setup(specs));
    });
  });
}

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-room', (room) => {
    socket.join(room);
    logger.info(`Client ${socket.id} joined room: ${room}`);
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    logger.info(`Client ${socket.id} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
// On platforms like Render, PORT is injected and the app must bind 0.0.0.0
// Guard against PORT=0 / empty values (they'd bind a random OS port)
const PORT = parseInt(process.env.PORT || '') > 0 ? parseInt(process.env.PORT!) : 3001;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  // Bind the port FIRST so the platform (Render) always detects an open port
  // and logs stay observable. Health endpoint reports real DB status.
  server.listen(PORT, () => {
    logger.info(`🚀 Server running on ${HOST === '0.0.0.0' ? 'http://localhost' : `http://${HOST}`}:${PORT}`);
    logger.info(`🔌 WebSocket server ready`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
  });

  // Database — if it fails, run in degraded mode (recovers automatically
  // when the DB becomes reachable; /health then flips back to OK)
  try {
    await connectDatabase();
    logger.info('Database connected successfully');
  } catch (dbError) {
    logger.error('Database unavailable — running in DEGRADED mode:', (dbError as Error).message);
    logger.error('Set DATABASE_URL correctly; the app will recover automatically once the DB is reachable');
  }

  // Redis — fully optional, never blocks or spams
  await connectRedis();
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

export { app, io };
