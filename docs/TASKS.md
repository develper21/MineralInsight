# ✅ Project Tasks

**MineralInsight – Task Breakdown & Development Plan**

This document contains the complete list of tasks for building the MineralInsight application. Tasks are divided into phases with clear deliverables, priorities and status tracking.

---

| 📋 Total Tasks | ✅ Completed | 🔄 In Progress |
| :---: | :---: | :---: |
| **46** | **43** | **3** |
| `██████████████████████` 100% tracked | `████████████████████░` 93% | `██░░░░░░░░░░░░░░░░░░░` 7% |

---

## ✅ Phase 1: Project Setup

Set up the development environment, repository and core configuration.

| # | Task | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | Initialize Vite + React + TypeScript project | 🔴 High | ✅ Completed | React 18 + Vite 7 scaffold |
| 1.2 | Configure Tailwind CSS & design tokens | 🔴 High | ✅ Completed | Copper / lithium / graphite tokens |
| 1.3 | Set up Git repository | 🔴 High | ✅ Completed | GitHub repo + commit history |
| 1.4 | Configure ESLint & Prettier | 🟡 Medium | ✅ Completed | Backend + frontend configs |
| 1.5 | Scaffold Express + TypeScript backend | 🔴 High | ✅ Completed | Express 4, `tsx` dev runner |
| 1.6 | Environment configuration (`.env.example`) | 🔴 High | ✅ Completed | DB, Redis, JWT, CORS keys |

---

## 🗄 Phase 2: Database & Schema

Design the schema and load real, frontend-matching data into Neon Postgres.

| # | Task | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| 2.1 | Configure Knex + Neon PostgreSQL connection | 🔴 High | ✅ Completed | `DATABASE_URL` support in `config/database.ts` |
| 2.2 | Create users migration (001) | 🔴 High | ✅ Completed | bcrypt-hashed accounts, JWT-ready |
| 2.3 | Create minerals, countries, states migrations (002–004) | 🔴 High | ✅ Completed | 8 minerals · 15 countries · 28 states |
| 2.4 | Create trade_data migration (005) | 🔴 High | ✅ Completed | FY-wise EXIM rows |
| 2.5 | Create price & production migrations (006–007) | 🟡 Medium | ✅ Completed | Monthly prices + state production |
| 2.6 | Create risk_assessments migration (008) | 🔴 High | ✅ Completed | Risk scores + factor JSON |
| 2.7 | Create forecasts migration (009) | 🟡 Medium | ✅ Completed | Forecast projections |
| 2.8 | Write & run seed files 001–009 | 🔴 High | ✅ Completed | Verified in Neon: 2,912 trade rows, 290 forecasts |

---

## 🟢 Phase 3: Backend APIs

Implement the REST API layer with auth, caching and realtime support.

| # | Task | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| 3.1 | Auth API (signup, login, `/me`, JWT middleware) | 🔴 High | ✅ Completed | 4 endpoints + protected routes |
| 3.2 | Minerals API | 🔴 High | ✅ Completed | List/detail with filters |
| 3.3 | Trade API (imports/exports, FY, partners) | 🔴 High | ✅ Completed | Trade aggregates |
| 3.4 | Risk API | 🔴 High | ✅ Completed | Risk index & factors |
| 3.5 | Forecast API | 🟡 Medium | ✅ Completed | Historical + projected series |
| 3.6 | States / Geospatial API | 🟡 Medium | ✅ Completed | 28-state map data |
| 3.7 | Analytics & External API routes | 🟡 Medium | ✅ Completed | Trends, ANOVA, DGCI&S |
| 3.8 | Dashboard aggregation endpoints (6) | 🔴 High | ✅ Completed | summary · focus-minerals · trade-flow · risk-gauges · india-map · top-partners |
| 3.9 | Redis cache layer (fail-soft) | 🟡 Medium | ✅ Completed | `dashboard:v2:*` keys, falls back to Postgres |
| 3.10 | Socket.io realtime service | 🟢 Low | ✅ Completed | Fail-soft live updates |

---

## ⚛️ Phase 4: Frontend Dashboard

Build the intelligence dashboard pages and wire them to the live API.

| # | Task | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| 4.1 | Layout, header & navigation | 🔴 High | ✅ Completed | Sidebar nav + routing |
| 4.2 | Design system components (`glass-card`, `stat-card`) | 🔴 High | ✅ Completed | Tailwind + shadcn/ui |
| 4.3 | Home dashboard page (Index) | 🔴 High | ✅ Completed | Stat cards + trade chart + risk gauges |
| 4.4 | EXIM Analysis page | 🔴 High | ✅ Completed | Mineral / country / FY views |
| 4.5 | Forecast page | 🔴 High | ✅ Completed | Forecast charts |
| 4.6 | Risk Index page | 🔴 High | ✅ Completed | Risk gauges + rankings |
| 4.7 | State Mineral Map page | 🟡 Medium | ✅ Completed | Interactive India map |
| 4.8 | Trend Analysis page | 🟡 Medium | ✅ Completed | Multi-mineral trends |
| 4.9 | Data Transparency page | 🟡 Medium | ✅ Completed | Sources & methodology |
| 4.10 | Scenario Analysis page → live API | 🟡 Medium | 🔄 In Progress | UI built; live-data wiring pending |
| 4.11 | ANOVA Analysis page → live API | 🟡 Medium | 🔄 In Progress | UI built; live-data wiring pending |

---

## 🔗 Phase 5: Integration & QA

Connect frontend ↔ backend and lock in the API contract.

| # | Task | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| 5.1 | API client (`fetchApiData`, `{ success, data }` envelope) | 🔴 High | ✅ Completed | `frontend/src/lib/api.ts` |
| 5.2 | React Query hooks for dashboard | 🔴 High | ✅ Completed | `useDashboard.ts`, 5-min staleTime |
| 5.3 | Postman collections (backend 96 routes + frontend) | 🟡 Medium | ✅ Completed | Token-capture login test script |
| 5.4 | Align seeds with frontend display values | 🔴 High | ✅ Completed | FY2023-24: $8.01B imports · $3.99B exports |
| 5.5 | Typecheck + build verification | 🔴 High | ✅ Completed | 0 TS errors; Vite build passes |

---

## 🚀 Phase 6: Deployment

Ship the backend to Render and the frontend to Netlify.

| # | Task | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| 6.1 | Render blueprint (web + postgres + redis) | 🔴 High | ✅ Completed | `render.yaml` |
| 6.2 | Netlify config + SPA redirects | 🔴 High | ✅ Completed | `netlify.toml` + `_redirects` |
| 6.3 | Fix Render TS build (TS5102, `@/` aliases) | 🔴 High | ✅ Completed | Paths `"@/*": ["./src/*"]`; `tsc && tsc-alias` |
| 6.4 | Fix Render devDependencies skip | 🔴 High | ✅ Completed | `--include=dev` + `@types/*` moved to dependencies |
| 6.5 | Write deployment guide | 🟡 Medium | ✅ Completed | Step-by-step Render / Netlify instructions |
| 6.6 | Verify production deployment end-to-end | 🔴 High | 🔄 In Progress | Awaiting Render redeploy + smoke test |

---

**Legend:** 🔴 High · 🟡 Medium · 🟢 Low  |  ✅ Completed · 🔄 In Progress · ⬜ Pending

> 📌 Related docs: [PRD.md](./PRD.md) · [MEMORY.md](./MEMORY.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
