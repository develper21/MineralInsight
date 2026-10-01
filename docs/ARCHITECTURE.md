# 🏛 System Architecture

**MineralInsight – Critical Mineral Intelligence Platform**

This document describes the overall system architecture, technology stack, folder structure, data flow, and key design decisions for the **MineralInsight** application.

---

## 1. High-Level Architecture

MineralInsight follows a full-stack client–server architecture using **React + Vite** on the frontend and **Express + PostgreSQL (Neon)** on the backend.

```
┌───────────────┐  HTTPS   ┌──────────────────┐  REST /   ┌──────────────────┐  Knex   ┌──────────────────┐
│      👤       │ ───────► │   ⚛️ Frontend     │ ◄───────► │   🟢 Backend     │ ──────► │    🐘 Database    │
│     User      │ ◄─────── │  React 18 + Vite  │ Socket.io │  Express + Node  │ ◄────── │  Neon PostgreSQL │
│ (Web Browser) │          │ (Tailwind + shadcn)│          │  (TS · REST API) │         │   (9 tables)     │
└───────────────┘          └──────────────────┘           └──────────────────┘         └──────────────────┘
                                                                  │
                                     ┌────────────────────────────┼───────────────────────────┐
                                     ▼                            ▼                           ▼
                             ┌───────────────┐          ┌────────────────┐         ┌──────────────────┐
                             │  ⚡ Redis      │          │ 🔌 Socket.io   │         │ 🌐 External APIs │
                             │ (fail-soft    │          │ (live updates, │         │  DGCI&S · Ministry│
                             │  cache layer) │          │   fail-soft)   │         │  of Commerce     │
                             └───────────────┘          └────────────────┘         └──────────────────┘
```

**Request flow:** Browser → React Query hook → `lib/api.ts` client → Express route → middleware (auth, validation) → controller → service/Knex → Neon Postgres → response wrapped in `{ success, data }` envelope.

---

## 2. Technology Stack

Technologies used in the project and their purpose:

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | React 18 + Vite 7 | UI framework and build tooling |
| Language | TypeScript 5 (strict) | Type-safe code across the stack |
| Styling | Tailwind CSS 3 + shadcn/ui | Design system and reusable components |
| Routing | React Router 6 | Client-side navigation (10 pages) |
| Server State | TanStack React Query 5 | Data fetching, caching, refetching |
| Charts | Recharts | Trade, price, and risk visualisations |
| Animation | Framer Motion | Page and component transitions |
| Backend | Express 4 (Node ≥ 18) | REST API server |
| Database | PostgreSQL (Neon) | Primary managed datastore |
| Query Builder | Knex 3 | Migrations, seeds, and queries |
| Cache | Redis (fail-soft) | Dashboard response caching (`dashboard:v2:*`) |
| Authentication | JWT + bcryptjs | Login, tokens, protected routes |
| Realtime | Socket.io | Live data push (fail-soft) |
| Validation | express-validator / Zod | Request input validation |
| Logging | Morgan + Winston | Request and application logging |
| API Testing | Postman collections (96 routes) | Endpoint testing (backend + frontend folders) |
| Deployment | Render (API) + Netlify (UI) | Hosting and CI builds |

---

## 3. Folder Structure

The project follows a **client–server split** folder structure to keep the codebase organised and scalable.

```
MineralInsight/
├── backend/
│   ├── postman/                    # Postman collection (96 routes, token-capture login)
│   ├── src/
│   │   ├── config/                 # database.ts, redis.ts (Neon + Redis, fail-soft)
│   │   ├── controllers/            # Auth, Mineral, Trade, Risk, Forecast, State,
│   │   │                           # Analytics, Geospatial, ExternalAPI controllers
│   │   ├── database/
│   │   │   ├── migrations/         # 001–009 Knex schema migrations
│   │   │   └── seeds/              # 001–009 seed files (minerals → users)
│   │   ├── middleware/             # auth.ts, errorHandler, validateRequest, notFound
│   │   ├── routes/                 # auth, minerals, trade, risk, forecast, states,
│   │   │                           # analytics, geospatial, external, dashboard
│   │   ├── scripts/                # run-migrations.ts (migrate|seed|verify|rollback)
│   │   ├── services/               # DataProcessor, ExternalAPIs, Geospatial, WebSocket
│   │   └── utils/                  # Shared helpers
│   └── tsconfig.json               # paths "@/*" → "./src/*" (no baseUrl)
├── frontend/
│   ├── postman/                    # Frontend-facing Postman collection
│   ├── public/_redirects           # Netlify SPA fallback
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/          # StatCard, MineralCard, TradeChart, RiskGauge,
│   │   │   │                       # CountryTable, IndiaMapSection
│   │   │   ├── home/               # Hero section & landing components
│   │   │   ├── layout/             # Header, Footer, Layout
│   │   │   └── ui/                 # shadcn/ui primitives (button, card, dialog…)
│   │   ├── hooks/                  # useDashboard.ts (react-query), use-toast
│   │   ├── lib/                    # api.ts (fetchApiData envelope), utils.ts
│   │   ├── pages/                  # Index, EximAnalysis, Forecast, RiskIndex,
│   │   │                           # TrendAnalysis, StateMineralMap, ScenarioAnalysis,
│   │   │                           # AnovaAnalysis, DataTransparency, NotFound
│   │   └── test/                   # Test setup
│   ├── netlify.toml                # Netlify build + SPA redirects
│   └── tailwind.config.ts          # Copper / lithium / graphite & risk tokens
├── docs/                           # PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY
└── render.yaml                     # Render blueprint: web + postgres + redis
```

---

## 4. Data Flow

### 4.1 Dashboard Data Flow

```
User opens Dashboard
   → useDashboard.ts (react-query, 5-min staleTime)
      → lib/api.ts fetchApiData()
         → GET /api/dashboard/summary | focus-minerals | trade-flow |
                risk-gauges | india-map | top-partners
            → dashboard route (cache key: dashboard:v2:*)
               → Redis hit?  → return cached JSON
               → Redis miss? → Knex query → Neon Postgres → cache → return
      → { success, data } envelope → UI components render
```

### 4.2 Database Schema (9 tables)

| Table | Contents |
| --- | --- |
| `users` | Auth accounts (bcrypt-hashed, JWT-issued) |
| `minerals` | Focus minerals (Cu, Li, C + more) |
| `countries` | 15 trade partner countries |
| `states` | 28 Indian states (map + production) |
| `trade_data` | 2,912 EXIM rows (FY-wise, by country & mineral) |
| `price_data` | 192 price points per mineral/month |
| `production_data` | 32 state-wise production rows |
| `risk_assessments` | 34 AI risk scores (high/medium/low) |
| `forecasts` | 290 price forecast projections |

### 4.3 Fail-Soft Design

Redis and Socket.io are **optional enhancers** — if either is unavailable, the API still serves fresh data from Postgres and the app continues to work. This keeps local development and Render free-tier deploys resilient.

---

## 5. Deployment Architecture

| Environment | Platform | Build Command | Notes |
| --- | --- | --- | --- |
| Backend API | Render (Web Service) | `npm install --include=dev && npm run build` (`tsc && tsc-alias`) | `@/*` aliases resolved at build via `tsc-alias`; compile-time `@types/*` kept in dependencies |
| Frontend UI | Netlify | `npm run build` (Vite) | SPA fallback via `_redirects` + `netlify.toml` |
| Database | Neon Postgres | `tsx src/scripts/run-migrations.ts all` | `RUN_MIGRATIONS` / `RUN_SEEDS` flags supported at boot |
| Cache | Render Redis | — | Optional; fail-soft if unreachable |

---

> 📌 Related docs: [PRD.md](./PRD.md) · [RULES.md](./RULES.md) · [DESIGN.md](./DESIGN.md)
