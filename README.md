# Critical Mineral Intelligence Platform

A comprehensive analytics dashboard for monitoring and analyzing India's critical minerals trade data, providing real-time market intelligence and risk assessment powered by AI.

## 🚀 Project Overview

The Critical Mineral Intelligence Platform is an advanced web application designed to provide comprehensive insights into India's critical minerals import/export dynamics. This platform serves as a strategic tool for policymakers, industry stakeholders, and researchers to make data-driven decisions regarding critical mineral supply chain management.

### 🎯 Key Features

- **Real-Time Market Intelligence**: Live EXIM data analysis for India's critical minerals
- **Risk Assessment Index**: AI-powered risk evaluation for mineral dependency
- **Trade Analytics**: Comprehensive import/export trend analysis
- **Geospatial Mapping**: State-wise mineral distribution visualization
- **Scenario Analysis**: Predictive modeling for supply chain disruptions
- **Data Transparency**: Open and verifiable data sources

### 📊 Focus Minerals

- **Copper (Cu)**: Electrical and electronics manufacturing
- **Lithium (Li)**: Battery technology and renewable energy storage
- **Graphite (C)**: Lubricants, batteries, and nuclear applications
- **30+ Critical Minerals**: Comprehensive coverage of strategic minerals

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI framework with hooks
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 7.3.0** - Fast development build tool
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Framer Motion 12.24.0** - Animation library
- **Recharts 2.15.4** - Data visualization charts
- **React Router 6.30.1** - Client-side routing

### State Management & Data
- **React Query 5.83.0** - Server state management
- **React Hook Form 7.61.1** - Form state management
- **Zod 3.25.76** - Schema validation

### Development Tools
- **ESLint 9.32.0** - Code linting
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixes

## 📁 Project Structure

```
critical-mineral/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── home/           # Homepage components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # Base UI components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utility functions
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd MineralInsight/critical-mineral
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📖 Documentation

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🌐 Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=MineralInsight
VITE_APP_VERSION=1.0.0
VITE_DATA_SOURCE=DGCI&S
VITE_LAST_UPDATED=2026-01-31
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

## 📊 Data Sources

- **DGCI&S**: Directorate General of Commercial Intelligence and Statistics
- **Ministry of Commerce**: Government of India
- **TEXMiN Foundation**: Technology Innovation Hub at IIT (ISM) Dhanbad

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🏆 Acknowledgments

- **TEXMiN Foundation**: Technology Innovation Hub at IIT (ISM) Dhanbad
- **Ministry of Commerce**: Government of India
- **DGCI&S**: For providing comprehensive trade data

## 📞 Support

For support and queries:
- Email: support@mineralinsight.com
- Documentation: [Project Docs](./docs/)
- Issues: [GitHub Issues](./issues)

## 🔄 Version History

- **v1.0.0** - Initial release with core analytics features
- **v0.9.0** - Beta testing phase
- **v0.8.0** - Alpha development phase

---

**Note**: This platform is designed for strategic analysis and decision-making in critical mineral supply chain management. Data accuracy and timeliness are crucial for reliable insights.
