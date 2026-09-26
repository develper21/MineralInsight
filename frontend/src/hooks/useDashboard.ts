import { useQuery } from '@tanstack/react-query';
import { fetchApiData } from '@/lib/api';

/**
 * React Query hooks connecting the dashboard to the backend
 * /api/dashboard/* endpoints.
 */

export interface DashboardSummary {
  financialYear: string;
  totalImportValueUSD: number;
  totalExportValueUSD: number;
  tradeDeficitUSD: number;
  importChangePercent: number | null;
  activeMinerals: number;
  highRiskMinerals: number;
}

export interface FocusMineral {
  id: number;
  name: string;
  symbol: string;
  color: string;
  importValueUSD: number;
  exportValueUSD: number;
  importDependencyPercent: number;
  riskLevel: string;
  trendPercent: number;
}

export interface TradeFlowPoint {
  year: string;
  import: number | null;
  export: number | null;
  forecast: number | null;
}

export interface RiskGaugeData {
  mineral: string;
  color: string;
  score: number;
  factors: { name: string; value: number }[];
}

export interface IndiaMapState {
  id: number;
  name: string;
  code: string | null;
  latitude: number;
  longitude: number;
  mineralResources: string[];
  topMinerals: string[];
  totalProductionQuantity: number;
}

export interface TopPartner {
  country: string;
  flag: string;
  sharePercent: number;
  valueUSD: number;
  riskLevel: string;
  minerals: string[];
}

export const useDashboardSummary = (fy?: string) =>
  useQuery({
    queryKey: ['dashboard', 'summary', fy],
    queryFn: () => fetchApiData<DashboardSummary>('/dashboard/summary', { fy }),
    staleTime: 5 * 60 * 1000,
  });

export const useFocusMinerals = (limit = 3) =>
  useQuery({
    queryKey: ['dashboard', 'focus-minerals', limit],
    queryFn: () => fetchApiData<FocusMineral[]>('/dashboard/focus-minerals', { limit }),
    staleTime: 5 * 60 * 1000,
  });

export const useTradeFlow = () =>
  useQuery({
    queryKey: ['dashboard', 'trade-flow'],
    queryFn: () => fetchApiData<TradeFlowPoint[]>('/dashboard/trade-flow'),
    staleTime: 10 * 60 * 1000,
  });

export const useRiskGauges = (limit = 3) =>
  useQuery({
    queryKey: ['dashboard', 'risk-gauges', limit],
    queryFn: () => fetchApiData<RiskGaugeData[]>('/dashboard/risk-gauges', { limit }),
    staleTime: 5 * 60 * 1000,
  });

export const useIndiaMap = () =>
  useQuery({
    queryKey: ['dashboard', 'india-map'],
    queryFn: () => fetchApiData<IndiaMapState[]>('/dashboard/india-map'),
    staleTime: 10 * 60 * 1000,
  });

export const useTopPartners = (limit = 5) =>
  useQuery({
    queryKey: ['dashboard', 'top-partners', limit],
    queryFn: () => fetchApiData<TopPartner[]>('/dashboard/top-partners', { limit }),
    staleTime: 5 * 60 * 1000,
  });

/** Format USD value in billions for display ($8.01B) */
export const formatBillions = (usd: number): string =>
  `$${(usd / 1_000_000_000).toFixed(2)}B`;

/** Format USD value already in billions ($3.40B) */
export const formatBillionsShort = (usdBillions: number): string =>
  `$${usdBillions.toFixed(2)}B`;
