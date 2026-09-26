import { Router, Request, Response } from 'express';
import { query } from 'express-validator';
import { db } from '@/config/database';
import { cacheGet, cacheSet } from '@/config/redis';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validateRequest';
import { optionalAuth } from '@/middleware/auth';

const router = Router();

// Build an Indian financial-year range (Apr 1 -> Mar 31) from "2023-24" style labels
function financialYearRange(label: string): { start: Date; end: Date } {
  const startYear = parseInt(label.split('-')[0] || '2023', 10);
  return {
    start: new Date(startYear, 3, 1),
    end: new Date(startYear + 1, 2, 31, 23, 59, 59),
  };
}

// pg auto-parses json columns; handle both parsed arrays and raw strings
function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * GET /api/dashboard/summary
 * Headline stats for the dashboard stat cards:
 * total import value, active critical minerals, trade deficit, high-risk minerals count.
 */
router.get(
  '/summary',
  [query('fy').optional().isString()],
  validateRequest,
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const fy = (req.query.fy as string) || '2023-24';
    const { start, end } = financialYearRange(fy);
    const cacheKey = `dashboard:v2:summary:${fy}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const [importRow] = await db('trade_data')
      .whereBetween('trade_date', [start, end])
      .where('trade_type', 'import')
      .sum('value_usd as total');

    const [exportRow] = await db('trade_data')
      .whereBetween('trade_date', [start, end])
      .where('trade_type', 'export')
      .sum('value_usd as total');

    const [mineralsRow] = await db('minerals')
      .where('is_active', true)
      .count('* as count');

    const highRiskRow = await db('risk_assessments')
      .whereIn('mineral_id', function () {
        this.select('mineral_id')
          .from('risk_assessments')
          .groupBy('mineral_id')
          .havingRaw('MAX(risk_score) >= 65');
      })
      .whereIn('risk_level', ['high', 'critical'])
      .countDistinct('mineral_id as count')
      .first();

    const importValue = Number(importRow?.total || 0);
    const exportValue = Number(exportRow?.total || 0);

    // Year-over-year change (previous FY)
    const prevStart = new Date(start);
    prevStart.setFullYear(prevStart.getFullYear() - 1);
    const prevEnd = new Date(end);
    prevEnd.setFullYear(prevEnd.getFullYear() - 1);
    const [prevImportRow] = await db('trade_data')
      .whereBetween('trade_date', [prevStart, prevEnd])
      .where('trade_type', 'import')
      .sum('value_usd as total');
    const prevImport = Number(prevImportRow?.total || 0);

    const data = {
      financialYear: fy,
      totalImportValueUSD: importValue,
      totalExportValueUSD: exportValue,
      tradeDeficitUSD: importValue - exportValue,
      importChangePercent: prevImport > 0 ? ((importValue - prevImport) / prevImport) * 100 : null,
      activeMinerals: Number(mineralsRow?.count || 0),
      highRiskMinerals: Number(highRiskRow?.count || 0),
    };

    await cacheSet(cacheKey, data, 300);
    res.json({ success: true, data });
  })
);

/**
 * GET /api/dashboard/focus-minerals
 * Focus mineral cards: import/export values, import dependency %, risk level and trend.
 */
router.get(
  '/focus-minerals',
  [query('limit').optional().isInt({ min: 1, max: 10 })],
  validateRequest,
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt((req.query.limit as string) || '3', 10);
    const cacheKey = `dashboard:v2:focus-minerals:${limit}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    // Rank minerals by FY2023-24 import value (the seed's final full year)
    const lastFY = '2023-24';
    const { start: fyStart, end: fyEnd } = financialYearRange(lastFY);
    const ranked = await db('trade_data')
      .join('minerals', 'trade_data.mineral_id', 'minerals.id')
      .where('trade_data.trade_type', 'import')
      .whereBetween('trade_data.trade_date', [fyStart, fyEnd])
      .groupBy('minerals.id')
      .select('minerals.id')
      .sum('trade_data.value_usd as import_value')
      .orderBy('import_value', 'desc')
      .limit(limit);
    const rankedIds = ranked.map((r) => r.id);

    if (rankedIds.length === 0) {
      res.json({ success: true, data: [] });
      return;
    }

    const minerals = await db('minerals')
      .whereIn('id', rankedIds)
      .where('is_active', true);
    const orderedMinerals = rankedIds
      .map((id) => minerals.find((m) => m.id === id))
      .filter((m): m is (typeof minerals)[number] => Boolean(m));

    const now = new Date();
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    const results = await Promise.all(
      orderedMinerals.map(async (mineral) => {
        const [importRow] = await db('trade_data')
          .where('mineral_id', mineral.id)
          .where('trade_type', 'import')
          .whereBetween('trade_date', [fyStart, fyEnd])
          .sum('value_usd as total');
        const [exportRow] = await db('trade_data')
          .where('mineral_id', mineral.id)
          .where('trade_type', 'export')
          .whereBetween('trade_date', [fyStart, fyEnd])
          .sum('value_usd as total');
        const latestRisk = await db('risk_assessments')
          .where('mineral_id', mineral.id)
          .orderBy('assessment_date', 'desc')
          .first();

        const importValue = Number(importRow?.total || 0);
        const exportValue = Number(exportRow?.total || 0);
        // Import dependency = imports as a share of total trade in that mineral
        const dependency =
          importValue + exportValue > 0
            ? Math.min(100, Math.round((importValue / (importValue + exportValue)) * 100))
            : 0;

        // Trend: average monthly price change over the last 12 price records
        const recentPrices = db('price_data')
          .where('mineral_id', mineral.id)
          .orderBy('price_date', 'desc')
          .limit(12)
          .as('recent');
        const trendRow = (await db
          .from(recentPrices)
          .avg('change_percent as avg_change')
          .first()) as any;

        return {
          id: mineral.id,
          name: mineral.name,
          symbol: mineral.symbol,
          color: (mineral.color_code || '#6C5CE7') as string,
          importValueUSD: importValue,
          exportValueUSD: exportValue,
          importDependencyPercent: dependency,
          riskLevel: latestRisk?.risk_level || 'low',
          trendPercent: Number(trendRow?.avg_change || 0),
        };
      })
    );

    await cacheSet(cacheKey, results, 300);
    res.json({ success: true, data: results });
  })
);

/**
 * GET /api/dashboard/trade-flow
 * Yearly (financial-year) import vs export totals plus forward forecast,
 * shaped for the frontend TradeChart (values in USD billions).
 */
router.get(
  '/trade-flow',
  validateRequest,
  optionalAuth,
  asyncHandler(async (_req: Request, res: Response) => {
    const cacheKey = 'dashboard:v2:trade-flow';
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const years = ['2017-18', '2018-19', '2019-20', '2020-21', '2021-22', '2022-23', '2023-24'];
    const series: Array<Record<string, unknown>> = [];

    for (const fy of years) {
      const { start, end } = financialYearRange(fy);
      const [importRow] = await db('trade_data')
        .whereBetween('trade_date', [start, end])
        .where('trade_type', 'import')
        .sum('value_usd as total');
      const [exportRow] = await db('trade_data')
        .whereBetween('trade_date', [start, end])
        .where('trade_type', 'export')
        .sum('value_usd as total');
      series.push({
        year: fy,
        import: Number(importRow?.total || 0) / 1_000_000_000,
        export: Number(exportRow?.total || 0) / 1_000_000_000,
        forecast: null,
      });
    }

    // Forward forecast rows
    const forecastRows = await db('forecasts')
      .join('minerals', 'forecasts.mineral_id', 'minerals.id')
      .where('forecasts.forecast_type', 'trade')
      .where('forecasts.forecast_date', '>', new Date())
      .sum('forecasts.forecast_value as total');

    const forecastTotal = Number(forecastRows[0]?.total || 0) / 1_000_000_000;
    if (forecastTotal > 0) {
      series.push({ year: '2024-25', import: null, export: null, forecast: forecastTotal });
    }

    await cacheSet(cacheKey, series, 600);
    res.json({ success: true, data: series });
  })
);

/**
 * GET /api/dashboard/risk-gauges
 * Composite risk score + factor breakdown for gauge widgets.
 */
router.get(
  '/risk-gauges',
  [query('limit').optional().isInt({ min: 1, max: 10 })],
  validateRequest,
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt((req.query.limit as string) || '3', 10);
    const cacheKey = `dashboard:v2:risk-gauges:${limit}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    // Same ranking as focus minerals so the widgets tell one story
    const lastFY = '2023-24';
    const { start: fyStart, end: fyEnd } = financialYearRange(lastFY);
    const ranked = await db('trade_data')
      .join('minerals', 'trade_data.mineral_id', 'minerals.id')
      .where('trade_data.trade_type', 'import')
      .whereBetween('trade_data.trade_date', [fyStart, fyEnd])
      .groupBy('minerals.id')
      .select('minerals.id')
      .sum('trade_data.value_usd as import_value')
      .orderBy('import_value', 'desc')
      .limit(limit);
    const rankedIds = ranked.map((r) => r.id);

    const minerals = rankedIds.length
      ? await db('minerals').whereIn('id', rankedIds).where('is_active', true)
      : await db('minerals').where('is_active', true).limit(limit);
    const orderedMinerals = rankedIds.length
      ? rankedIds
          .map((id) => minerals.find((m) => m.id === id))
          .filter((m): m is (typeof minerals)[number] => Boolean(m))
      : minerals.slice(0, limit);

    const gauges = await Promise.all(
      orderedMinerals.map(async (mineral) => {
        // Only mineral-level rows (country_id IS NULL) so partner rows don't skew scores
        const assessments = await db('risk_assessments')
          .where('mineral_id', mineral.id)
          .whereNull('country_id')
          .orderBy('assessment_date', 'desc')
          .limit(3);
        const score = assessments.length
          ? Math.round(assessments.reduce((sum, a) => sum + Number(a.risk_score), 0) / assessments.length)
          : 0;
        return {
          mineral: mineral.name,
          color: (mineral.color_code || '#6C5CE7') as string,
          score,
          factors: assessments.map((a) => ({ name: a.risk_type, value: Number(a.risk_score) })),
        };
      })
    );

    await cacheSet(cacheKey, gauges, 300);
    res.json({ success: true, data: gauges });
  })
);

/**
 * GET /api/dashboard/india-map
 * State-wise production + mineral resources for the India map section.
 */
router.get(
  '/india-map',
  validateRequest,
  optionalAuth,
  asyncHandler(async (_req: Request, res: Response) => {
    const cacheKey = 'dashboard:v2:india-map';
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const india = await db('countries').where('name', 'India').first();
    if (!india) {
      res.json({ success: true, data: [] });
      return;
    }

    const states = await db('states')
      .where('country_id', india.id)
      .where('is_active', true);

    const data = await Promise.all(
      states.map(async (state) => {
        const [productionRow] = await db('production_data')
          .where('state_id', state.id)
          .sum('quantity as total');
        const topMinerals = await db('production_data')
          .join('minerals', 'production_data.mineral_id', 'minerals.id')
          .where('production_data.state_id', state.id)
          .groupBy('minerals.id', 'minerals.name')
          .sum('production_data.quantity as total_quantity')
          .orderBy('total_quantity', 'desc')
          .limit(3)
          .select('minerals.name');

        return {
          id: state.id,
          name: state.name,
          code: state.code,
          latitude: Number(state.latitude || 0),
          longitude: Number(state.longitude || 0),
          mineralResources: parseJsonArray(state.mineral_resources),
          topMinerals: topMinerals.map((m: any) => m.name),
          totalProductionQuantity: Number(productionRow?.total || 0),
        };
      })
    );

    await cacheSet(cacheKey, data, 600);
    res.json({ success: true, data });
  })
);

/**
 * GET /api/dashboard/top-partners
 * Top trading partner countries with import share, value and risk level.
 */
router.get(
  '/top-partners',
  [query('limit').optional().isInt({ min: 1, max: 20 })],
  validateRequest,
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt((req.query.limit as string) || '5', 10);
    const cacheKey = `dashboard:v2:top-partners:${limit}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const fy = (req.query.fy as string) || '2023-24';
    const { start, end } = financialYearRange(fy);

    const rows = await db('trade_data')
      .join('countries', 'trade_data.country_id', 'countries.id')
      .where('trade_data.trade_type', 'import')
      .whereBetween('trade_data.trade_date', [start, end])
      .groupBy('countries.id', 'countries.name', 'countries.code_2')
      .select('countries.id', 'countries.name', 'countries.code_2')
      .sum('trade_data.value_usd as total_value')
      .orderBy('total_value', 'desc')
      .limit(limit);

    const grandTotal = rows.reduce((sum, r) => sum + Number(r.total_value), 0) || 1;

    const data = await Promise.all(
      rows.map(async (row) => {
        const latestRisk = await db('risk_assessments')
          .where('country_id', row.id)
          .orderBy('assessment_date', 'desc')
          .first();
        const topMinerals = await db('trade_data')
          .join('minerals', 'trade_data.mineral_id', 'minerals.id')
          .where('trade_data.country_id', row.id)
          .where('trade_data.trade_type', 'import')
          .groupBy('minerals.id', 'minerals.name')
          .sum('trade_data.value_usd as v')
          .orderBy('v', 'desc')
          .limit(3)
          .select('minerals.name');

        return {
          country: row.name,
          flag: row.code_2,
          sharePercent: (Number(row.total_value) / grandTotal) * 100,
          valueUSD: Number(row.total_value),
          riskLevel: latestRisk?.risk_level || 'low',
          minerals: topMinerals.map((m: any) => m.name),
        };
      })
    );

    await cacheSet(cacheKey, data, 300);
    res.json({ success: true, data });
  })
);

export default router;
