# 🧠 Project Memory

**MineralInsight – Context, Progress & Important Notes**

This document keeps track of the current state of the project, important decisions, and things to remember. It helps maintain continuity across development sessions or for new contributors.

---

| 📅 Last Updated | 👤 Current Phase | 🚀 MVP Progress |
| :---: | :---: | :---: |
| **Oct 1, 2026** | **Phase 6** | **93%** |
| 12:45 PM | Deployment & Production Verification | `████████████████████░` |

---

## 🎯 Current Status

- ✅ Project setup completed (React 18, Vite 7, TypeScript, Tailwind, Express)
- ✅ Git repository initialized and pushed to GitHub
- ✅ Neon PostgreSQL project created, migrated and seeded (9 tables)
- ✅ Backend REST API complete: auth, trade, risk, forecast, states, analytics, dashboard
- ✅ Frontend connected to live API (react-query + `{ success, data }` envelope)
- ✅ Postman collections ready (96 routes, token-capture login)
- ✅ Redis cache & Socket.io integrated (fail-soft — app works without them)
- ✅ Render build errors fixed (TS paths, tsc-alias, devDependencies)
- 🔄 Working on **production verification** (Render redeploy + smoke test)

---

## ✅ Completed Tasks

| # | Task | Completed On |
| --- | --- | --- |
| 1.1–1.6 | Project setup: Vite, Tailwind tokens, ESLint/Prettier, Express scaffold, env config | Jan 2026 |
| 2.1 | Knex + Neon PostgreSQL connection | Jan 2026 |
| 2.2–2.7 | All 9 schema migrations (users → forecasts) | Feb 2026 |
| 2.8 | Seed files 001–009 written & loaded into Neon | Sep 2026 |
| 3.1–3.7 | All core API routes (auth → external) | Feb 2026 |
| 3.8 | Dashboard aggregation endpoints (6) | Sep 2026 |
| 3.9 | Redis fail-soft cache (`dashboard:v2:*`) | Sep 2026 |
| 4.1–4.9 | Dashboard layout + 8 pages live-data wired | Sep 2026 |
| 5.1–5.2 | API client + react-query hooks | Sep 2026 |
| 5.3 | Postman collections (backend 96 routes + frontend) | Sep 2026 |
| 5.4 | Seeds aligned with frontend values | Sep 2026 |
| 5.5 | Typecheck verified — 0 TS errors | Sep 2026 |
| 6.1–6.2 | Render blueprint + Netlify config | Sep 2026 |
| 6.3–6.4 | Render build fixes (tsc-alias, `--include=dev`, `@types/*` in deps) | Oct 2026 |
| 6.5 | Deployment guide written | Sep 2026 |

---

## 🔄 In Progress

| # | Task | Started | Notes |
| --- | --- | --- | --- |
| 4.10 | Scenario Analysis page → live API | Oct 2026 | UI built; wiring to backend route pending |
| 4.11 | ANOVA Analysis page → live API | Oct 2026 | UI built; wiring to backend route pending |
| 6.6 | Production deployment verification | Oct 2026 | Awaiting Render redeploy result; then smoke-test `/health` + dashboard |

---

## ⏭️ Next Steps

1. Push current fixes (`backend/package.json`, `render.yaml`) → let Render redeploy.
2. Smoke-test production: `GET /health`, login, dashboard endpoints, CORS origins.
3. Wire Scenario Analysis & ANOVA pages to live API routes.
4. Add `docs/DEPLOYMENT.md` (or re-link root guide) and update README doc links.

---

## 📌 Important Notes & Gotchas

| Topic | Note |
| --- | --- |
| 🚪 Port | Local `.env.local` has `PORT=0` — `index.ts` guards with `parseInt(process.env.PORT \|\| '') > 0`, defaults to 3001. |
| 🔧 Path aliases | TS5+ removed `baseUrl`; use `"@/*": ["./src/*"]` only. Compiled output needs `tsc-alias` (`build = tsc && tsc-alias`) because Node can't resolve `@/`. |
| 📦 Render builds | `NODE_ENV=production` makes `npm install` skip devDependencies — build command must be `npm install --include=dev && npm run build`, and compile-time `@types/*` live in `dependencies`. |
| 🧯 Fail-soft | Redis and Socket.io must never crash the API — every integration degrades gracefully to Postgres/no-op. |
| 🗄 Cache keys | Dashboard responses cached under `dashboard:v2:*` — bump the prefix when response shapes change. |
| 🌱 Data volumes | Neon DB verified: users 2 · minerals 8 · countries 15 · states 28 · trade_data 2,912 · price_data 192 · production_data 32 · risk_assessments 34 · forecasts 290. |
| 🔑 Demo login | `admin@mineralinsight.in` / `Demo@1234` (seed user — local/demo only). |
| 🔁 Migration runner | `cd backend && npx tsx src/scripts/run-migrations.ts [migrate\|seed\|all\|verify\|rollback]` (loads `.env.local` itself). |
| 🌍 Local URLs | Backend `http://localhost:3001` (`/health`), frontend Vite `http://localhost:5173`. |
| 📊 Key figures | FY2023-24 imports **$8.01B** / exports **$3.99B**; risk scores: Cu 58 · Li 89 · C 72. |

---

> 📌 Related docs: [TASKS.md](./TASKS.md) · [PRD.md](./PRD.md) · [RULES.md](./RULES.md)
