# Deployment Guide — MineralInsight

Backend → **Render** · Frontend → **Netlify**

---

## 1. Backend on Render

### Option A — Blueprint (recommended, one click)

`render.yaml` at the repo root provisions everything:

1. Push this repo to GitHub.
2. Render Dashboard → **New → Blueprint** → select the repo → Apply.
   - Creates: `mineralinsight-api` (web service) + `mineralinsight-db` (PostgreSQL).
3. **Set `DATABASE_URL`** in the web service → Environment:
   - Paste the connection string from your `.env.production` file
     (Neon/Render/any Postgres — `.env.production` itself is gitignored,
     so the value must be entered in the Render dashboard).
4. Also set `CORS_ORIGIN` = `https://<your-site>.netlify.app` (comma-separated for multiple).
5. Verify: `https://mineralinsight-api.onrender.com/health` → `{"status":"OK","database":"up"}`

### What happens automatically on boot (production)

- **Migrations** run on every deploy (`RUN_MIGRATIONS=true`) — schema always up to date.
- **Seeds** auto-load on **first boot only** (when the DB is empty). Once data exists,
  later deploys never reseed. To force a reseed: set `RUN_SEEDS=true`, redeploy, then set it back to `false`.
- **Redis is optional** — without `REDIS_URL` the API runs normally with no cache
  (no retry spam; add a Render Redis later and set `REDIS_URL` to enable).
- **Port binds immediately** — even if the DB is unreachable at boot, the service
  starts in `DEGRADED` mode and recovers automatically once the DB responds
  (`/health` shows `database: down` → `up`).

### Option B — Manual web service

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm run start` |
| Health Check Path | `/health` |

Environment variables:

```
NODE_ENV=production
DATABASE_URL=<paste from your .env.production — Neon/Render Postgres URL>
JWT_SECRET=<generate a strong secret>
CORS_ORIGIN=https://<your-site>.netlify.app
RUN_MIGRATIONS=true
RUN_SEEDS=false       # auto-seeds only when DB is empty; true forces reseed
RATE_LIMIT_MAX_REQUESTS=300
```

### Using your existing database

If your Postgres is already created elsewhere (local/Aiven/Railway), just set its
`DATABASE_URL` in Render env vars — `src/config/database.ts` picks it up
automatically (SSL is enabled by default; set `DB_SSL=false` to disable).

### Seed data

Seeds run in this order (Knex sorts by filename):

1. `001_minerals_seed.ts` — 8 minerals (Copper, Lithium, Graphite, Cobalt, REE, Nickel, Manganese, Aluminum)
2. `002_countries_seed.ts` — 10 trading partner countries
3. `003_states_seed.ts` — 20 Indian mineral states + 8 foreign provinces
4. `004_trade_data_seed.ts` — FY2017-18 → FY2023-24 India import/export data (matches the frontend chart)
5. `005_price_data_seed.ts` — 24 months of monthly prices
6. `006_production_data_seed.ts` — state-wise quarterly production
7. `007_risk_assessments_seed.ts` — risk scores matching the frontend gauges (Cu 58, Li 89, C 72)
8. `008_forecasts_seed.ts` — 12-month price/demand/supply forecasts + trade forecasts
9. `009_users_seed.ts` — demo users (`admin@mineralinsight.in` / `Demo@1234`)

Run manually anytime:

```bash
cd backend
npm run db:seed          # uses knexfile (needs DB_* vars)
# or via env: RUN_SEEDS=true npm start
```

---

## 2. Frontend on Netlify

1. Netlify → **Add new site → Import an existing project** → pick the repo.
2. Configure (or rely on `frontend/netlify.toml`):
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. Site configuration → **Environment variables**:

```
VITE_API_BASE_URL=https://mineralinsight-api.onrender.com/api
```

> ⚠️ Any `VITE_*` change requires a **redeploy** — they are baked in at build time.

4. Deploy. SPA routing for `/exim`, `/forecast` etc. works via the
   `netlify.toml` redirect (also duplicated in `public/_redirects`).

### Local development

```bash
# Terminal 1 — backend on :3001
cd backend && cp .env.example .env && npm run dev

# Terminal 2 — frontend on :5173
cd frontend && cp .env.example .env.local && npm run dev
```

The frontend defaults to `http://localhost:3001/api`; the backend already
allows `http://localhost:5173` in CORS.

---

## 3. Postman testing

Both folders have a ready-to-import collection:

- `backend/postman/postman.json` — every backend route (96 requests in 11 folders)
- `frontend/postman/postman.json` — the exact endpoints the UI consumes, grouped by page

Import steps:
1. Postman → **Import** → select the `postman.json` file.
2. Set the `base_url` collection variable (defaults to `http://localhost:3001`).
3. Run **Auth → Login** first — the test script auto-saves `{{token}}`
   (demo user: `admin@mineralinsight.in` / `Demo@1234`).

---

## 4. Deploy checklist

- [ ] Render blueprint applied, `/health` returns `"status":"OK","database":"up"`
- [ ] `DATABASE_URL` set in Render dashboard (from `.env.production`)
- [ ] `CORS_ORIGIN` on Render includes the Netlify URL
- [ ] `VITE_API_BASE_URL` on Netlify points to the Render `/api` URL
- [ ] Seed data visible: `GET /api/dashboard/summary` returns real numbers
- [ ] Postman: run Login + Dashboard/Summary against the **deployed** URL
- [ ] Frontend dashboard shows live numbers (not "…")
