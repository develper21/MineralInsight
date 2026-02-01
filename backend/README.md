# MineralInsight Backend API

A comprehensive backend API for the MineralInsight Critical Mineral Intelligence Platform, providing real-time data analytics, geospatial mapping, and external API integrations for critical minerals.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Database Management**: PostgreSQL with Knex migrations and seeds
- **Caching Layer**: Redis for performance optimization
- **Real-time Updates**: WebSocket support for live data streaming
- **API Documentation**: Swagger/OpenAPI documentation

### Data Sources
- **DGCI API**: Directorate General of Commercial Intelligence integration
- **Commerce API**: Ministry of Commerce trade data integration
- **TEXMiN API**: Mining production and reserves data integration

### Analytics & Intelligence
- **Market Analytics**: Price trends, volatility analysis, market sentiment
- **Risk Assessment**: Supply chain risk, geopolitical risk, price risk
- **Forecasting**: Predictive analytics for prices, demand, and supply
- **Geospatial Analysis**: Mine locations, heatmaps, trade flow routes

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MineralInsight/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create database
   createdb mineralinsight_dev
   
   # Run migrations
   npm run db:migrate
   
   # Seed data
   npm run db:seed
   ```

5. **Start Redis server**
   ```bash
   redis-server
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Database and Redis configuration
│   ├── controllers/      # API route controllers
│   ├── database/         # Migrations and seeds
│   ├── middleware/       # Express middleware
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic and external APIs
│   └── utils/           # Utility functions
├── knexfile.ts          # Knex configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🔧 Environment Variables

Key environment variables (see `.env` for complete list):

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mineralinsight_dev
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# External APIs
DGCI_API_URL=https://dgci.gov.in/api
DGCI_API_KEY=your-dgci-api-key
COMMERCE_API_URL=https://commerce.gov.in/api
COMMERCE_API_KEY=your-commerce-api-key
TEXMIN_API_URL=https://texmin.in/api
TEXMIN_API_KEY=your-texmin-api-key
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3001`
- Production: `https://api.mineralinsight.com`

### Authentication
Most endpoints require authentication. Include JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

#### Minerals
- `GET /api/minerals` - Get all minerals
- `GET /api/minerals/:id` - Get mineral details
- `GET /api/minerals/:id/prices` - Get mineral prices
- `GET /api/minerals/:id/trade` - Get mineral trade data

#### Trade
- `GET /api/trade` - Get trade data
- `GET /api/trade/summary` - Trade summary
- `GET /api/trade/trends` - Trade trends
- `GET /api/trade/countries/:country` - Country-specific trade

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/market-overview` - Market overview
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/correlation` - Correlation analysis

#### Risk
- `GET /api/risk/overview` - Risk overview
- `GET /api/risk/mineral/:id` - Mineral-specific risk
- `GET /api/risk/country/:id` - Country-specific risk
- `GET /api/risk/scenarios` - Risk scenarios

#### Forecast
- `GET /api/forecast/prices` - Price forecasts
- `GET /api/forecast/demand` - Demand forecasts
- `GET /api/forecast/supply` - Supply forecasts
- `GET /api/forecast/accuracy` - Forecast accuracy

#### Geospatial
- `GET /api/geospatial/mines` - Mine locations
- `GET /api/geospatial/heatmap/:mineral` - Production heatmap
- `GET /api/geospatial/trade-flows/:commodity` - Trade flow routes
- `GET /api/geospatial/risk-zones` - Risk zones

#### External APIs
- `GET /api/external/dgci/prices` - DGCI price data
- `GET /api/external/commerce/trade` - Commerce trade data
- `GET /api/external/texmin/mining` - TEXMiN mining data

### WebSocket Events
Connect to `ws://localhost:3001` for real-time updates:

- `market-updates` - Live market data
- `price-alerts` - Price change alerts
- `risk-updates` - Risk assessment updates
- `trade-notifications` - Trade notifications

## 🗄️ Database Schema

### Main Tables
- `users` - User accounts and authentication
- `minerals` - Critical minerals information
- `countries` - Countries with mining/trade data
- `states` - States/provinces with mining data
- `trade_data` - International trade statistics
- `price_data` - Historical price data
- `production_data` - Production statistics
- `risk_assessments` - Risk assessment data
- `forecasts` - Predictive analytics data

## 🔍 External API Integrations

### DGCI (Directorate General of Commercial Intelligence)
- Commodity prices
- Trade statistics
- Market intelligence
- Policy updates

### Ministry of Commerce
- International trade data
- Country-specific statistics
- Tariff information
- Trade balance data

### TEXMiN (Technology Innovation in Exploration and Mining)
- Mining production data
- Mineral reserves
- Mine locations
- Environmental data

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build
npm run build

# Start production server
npm start
```

### Docker
```bash
# Build image
docker build -t mineralinsight-backend .

# Run container
docker run -p 3001:3001 mineralinsight-backend
```

## 📊 Monitoring & Logging

- **Winston Logger**: Structured logging with console and file outputs
- **Health Check**: `/health` endpoint for monitoring
- **Error Handling**: Comprehensive error handling middleware
- **Rate Limiting**: API rate limiting for protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 📝 Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:reset         # Reset database

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Linting
npm run lint             # ESLint
npm run lint:fix         # Fix linting issues
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Email: support@mineralinsight.com
- Documentation: https://docs.mineralinsight.com

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added external API integrations
- **v1.2.0** - Enhanced geospatial features
- **v1.3.0** - Real-time WebSocket updates

---

**MineralInsight Backend API** - Empowering critical mineral intelligence with data-driven insights.
