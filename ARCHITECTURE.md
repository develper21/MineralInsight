# Architecture Documentation

This document provides a comprehensive overview of the Critical Mineral Intelligence Platform's technical architecture, design patterns, and system components.

## 🏗️ System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   Pages     │ │ Components  │ │   Hooks     │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  React Query + API Services + State Management              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   Cache     │ │   API       │ │   Store     │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                   External APIs                             │
├─────────────────────────────────────────────────────────────┤
│  DGCI&S API • Ministry of Commerce • TEXMiN Foundation      │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Design Principles

### 1. Component-First Architecture
- **Atomic Design**: Components built from smallest to largest
- **Reusable Components**: Highly modular and composable
- **Single Responsibility**: Each component has one clear purpose

### 2. Type Safety
- **TypeScript Everywhere**: Strong typing for all code
- **Interface Contracts**: Clear API contracts between components
- **Runtime Validation**: Zod schemas for data validation

### 3. Performance Optimization
- **Lazy Loading**: Code splitting for better performance
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: For large data sets

### 4. Accessibility
- **WCAG 2.1 AA**: Compliance with accessibility standards
- **Semantic HTML**: Proper HTML structure
- **Keyboard Navigation**: Full keyboard support

## 📁 Project Structure

### Frontend Architecture

```
critical-mineral/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── ui/                 # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── StatCard.tsx
│   │   │   ├── MineralCard.tsx
│   │   │   ├── TradeChart.tsx
│   │   │   └── ...
│   │   ├── home/               # Homepage components
│   │   │   ├── HeroSection.tsx
│   │   │   └── ...
│   │   ├── layout/             # Layout components
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── common/             # Shared components
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   ├── pages/                  # Page components
│   │   ├── Index.tsx           # Homepage
│   │   ├── EximAnalysis.tsx    # EXIM Analysis
│   │   ├── Forecast.tsx        # Forecasting
│   │   ├── RiskIndex.tsx       # Risk Assessment
│   │   ├── TrendAnalysis.tsx   # Trend Analysis
│   │   ├── StateMineralMap.tsx # State-wise Mapping
│   │   ├── ScenarioAnalysis.tsx # Scenario Analysis
│   │   ├── AnovaAnalysis.tsx   # ANOVA Analysis
│   │   ├── DataTransparency.tsx # Data Transparency
│   │   └── NotFound.tsx        # 404 Page
│   ├── hooks/                  # Custom React hooks
│   │   ├── useApiData.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── lib/                    # Utility libraries
│   │   ├── api.ts              # API client
│   │   ├── utils.ts            # Helper functions
│   │   └── constants.ts        # Application constants
│   ├── types/                  # TypeScript type definitions
│   │   ├── api.ts              # API response types
│   │   ├── mineral.ts          # Mineral data types
│   │   └── common.ts           # Common types
│   ├── services/               # Business logic services
│   │   ├── mineralService.ts   # Mineral data service
│   │   ├── analyticsService.ts # Analytics service
│   │   └── exportService.ts    # Data export service
│   ├── utils/                  # Utility functions
│   │   ├── formatters.ts       # Data formatting
│   │   ├── validators.ts       # Data validation
│   │   └── calculations.ts     # Business calculations
│   ├── styles/                 # Global styles
│   │   ├── globals.css
│   │   └── components.css
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # Application entry point
│   └── vite-env.d.ts          # Vite type definitions
├── docs/                      # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
├── tests/                     # Test files
│   ├── __mocks__/
│   ├── components/
│   ├── pages/
│   └── utils/
├── .env.example               # Environment variables example
├── .gitignore                 # Git ignore file
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── README.md                  # Project documentation
```

## 🔄 Data Flow Architecture

### Data Flow Patterns

```
User Interaction → Component → Hook/Service → API → Cache → Component Update
```

### 1. Client-Side State Management

```typescript
// React Query for server state
const { data, isLoading, error } = useQuery({
  queryKey: ['minerals', filters],
  queryFn: () => mineralService.getMinerals(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Local state with useState
const [selectedMineral, setSelectedMineral] = useState<string>('');
```

### 2. API Layer Architecture

```typescript
// API Service Layer
class MineralService {
  async getMinerals(filters: MineralFilters): Promise<MineralData[]> {
    const response = await api.get('/minerals', { params: filters });
    return mineralSchema.array().parse(response.data);
  }
  
  async getRiskAssessment(mineralId: string): Promise<RiskAssessment> {
    const response = await api.get(`/minerals/${mineralId}/risk`);
    return riskAssessmentSchema.parse(response.data);
  }
}
```

### 3. Component Communication

```typescript
// Props drilling for simple cases
interface ParentComponentProps {
  mineralData: MineralData[];
  onMineralSelect: (mineral: MineralData) => void;
}

// Context for complex state
const MineralContext = createContext<MineralContextType>();

// Custom hooks for complex logic
const useMineralData = () => {
  const context = useContext(MineralContext);
  if (!context) {
    throw new Error('useMineralData must be used within MineralProvider');
  }
  return context;
};
```

## 🎨 UI Component Architecture

### Component Hierarchy

```
Layout
├── Header
│   ├── Navigation
│   └── UserMenu
├── Main
│   ├── Dashboard
│   │   ├── StatCards
│   │   ├── Charts
│   │   └── Tables
│   ├── Analysis Pages
│   │   ├── EximAnalysis
│   │   ├── Forecast
│   │   └── RiskIndex
│   └── Data Visualization
│       ├── Maps
│       ├── Charts
│       └── Gauges
└── Footer
```

### Design System

```typescript
// Theme Configuration
const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
    mineral: {
      copper: '#b87333',
      lithium: '#f0f0f0',
      graphite: '#2f2f2f',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      display: ['Playfair Display', 'serif'],
    },
  },
};
```

## 🔧 Technology Stack Details

### Frontend Framework

**React 18.3.1**
- Concurrent Features
- Automatic Batching
- Suspense for Data Fetching
- Server Components (future)

**TypeScript 5.8.3**
- Strict Mode Enabled
- Path Mapping
- Declaration Merging
- Decorators Support

**Vite 7.3.0**
- HMR (Hot Module Replacement)
- Tree Shaking
- Code Splitting
- Asset Optimization

### State Management

**React Query 5.83.0**
- Server State Management
- Caching & Synchronization
- Background Refetching
- Optimistic Updates

**React Hook Form 7.61.1**
- Form State Management
- Validation Integration
- Performance Optimized
- TypeScript Support

### Styling & UI

**Tailwind CSS 3.4.17**
- Utility-First CSS
- Responsive Design
- Dark Mode Support
- Custom Components

**shadcn/ui**
- Component Library
- Accessibility First
- Customizable
- TypeScript Support

**Framer Motion 12.24.0**
- Animation Library
- Gesture Support
- Physics-Based Animations
- Performance Optimized

### Data Visualization

**Recharts 2.15.4**
- Chart Library
- Composable Components
- Responsive Design
- Custom Themes

## 🔐 Security Architecture

### Client-Side Security

```typescript
// Environment Variables
const config = {
  apiUrl: import.meta.env.VITE_API_BASE_URL,
  apiKey: import.meta.env.VITE_API_KEY,
};

// Input Validation
const mineralSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  value: z.number().positive(),
});

// XSS Prevention
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input);
};
```

### API Security

- **CORS Configuration**: Proper cross-origin settings
- **Rate Limiting**: API request throttling
- **Input Validation**: Zod schema validation
- **Error Handling**: Secure error responses

## 📊 Performance Architecture

### Optimization Strategies

```typescript
// Code Splitting
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Memoization
const MemoizedChart = memo(TradeChart, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});

// Virtual Scrolling
const VirtualizedTable = ({ items }) => {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  );
};
```

### Bundle Optimization

- **Tree Shaking**: Remove unused code
- **Code Splitting**: Lazy load components
- **Asset Optimization**: Image and font optimization
- **Caching**: Browser caching strategies

## 🧪 Testing Architecture

### Testing Pyramid

```
                    E2E Tests
                 (Critical Paths)
                /               \
        Integration Tests    Manual Tests
      (Component Integration)  (UX Testing)
            /                       \
        Unit Tests                  Visual Tests
    (Component Logic)           (Screenshot Tests)
```

### Test Structure

```typescript
// Unit Test Example
describe('MineralCard', () => {
  it('renders mineral information correctly', () => {
    const mineral = createMockMineral();
    render(<MineralCard mineral={mineral} />);
    
    expect(screen.getByText(mineral.name)).toBeInTheDocument();
    expect(screen.getByText(`$${mineral.value}B`)).toBeInTheDocument();
  });
});

// Integration Test Example
describe('Dashboard Integration', () => {
  it('loads and displays mineral data', async () => {
    const mockData = createMockMineralData();
    jest.spyOn(mineralService, 'getMinerals').mockResolvedValue(mockData);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Import Value')).toBeInTheDocument();
    });
  });
});
```

## 🚀 Deployment Architecture

### Build Process

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
        },
      },
    },
  },
});
```

### Environment Configuration

```typescript
// Environment-specific configs
const configs = {
  development: {
    apiUrl: 'http://localhost:3001/api',
    enableLogging: true,
  },
  production: {
    apiUrl: 'https://api.mineralinsight.com',
    enableLogging: false,
  },
};
```

## 🔄 Future Architecture Considerations

### Scalability

- **Micro-Frontends**: Module federation for team scaling
- **Service Workers**: Offline capabilities
- **Web Workers**: Heavy computation offloading
- **CDN Integration**: Global content delivery

### Technology Evolution

- **React Server Components**: Server-side rendering
- **WebAssembly**: Performance-critical computations
- **PWA Features**: Mobile app-like experience
- **AI Integration**: Enhanced analytics capabilities

---

This architecture document serves as the foundation for understanding the technical decisions and patterns used in the Critical Mineral Intelligence Platform. It should be updated as the system evolves and new requirements emerge.
