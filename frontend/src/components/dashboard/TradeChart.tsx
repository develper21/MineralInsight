import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTradeFlow, type TradeFlowPoint } from "@/hooks/useDashboard";

const fallbackData = [
  { year: "2017-18", import: 3.2, export: 4.8, forecast: null },
  { year: "2018-19", import: 3.5, export: 4.6, forecast: null },
  { year: "2019-20", import: 3.8, export: 4.5, forecast: null },
  { year: "2020-21", import: 3.03, export: 5.0, forecast: null },
  { year: "2021-22", import: 4.2, export: 4.8, forecast: null },
  { year: "2022-23", import: 5.8, export: 4.2, forecast: null },
  { year: "2023-24", import: 8.01, export: 3.99, forecast: null },
  { year: "2024-25", import: null, export: null, forecast: 9.2 },
  { year: "2025-26", import: null, export: null, forecast: 10.5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 border border-border/50">
        <p className="font-display font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-medium text-foreground">
              ${entry.value?.toFixed(2)}B
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TradeChart() {
  const { data } = useTradeFlow();
  const tradeData: TradeFlowPoint[] =
    data && data.length > 0 ? data : fallbackData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">
            Trade Flow Analysis
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Critical minerals import vs export trends (in USD Billion)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-import" />
            <span className="text-sm text-muted-foreground">Import</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-export" />
            <span className="text-sm text-muted-foreground">Export</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary opacity-50" />
            <span className="text-sm text-muted-foreground">Forecast</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="h-80"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={tradeData}>
            <defs>
              <linearGradient id="importGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--import))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--import))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="exportGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--export))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--export))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="year"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}B`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="import"
              stroke="hsl(var(--import))"
              fill="url(#importGradient)"
              strokeWidth={2}
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="export"
              stroke="hsl(var(--export))"
              fill="url(#exportGradient)"
              strokeWidth={2}
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="hsl(var(--primary))"
              fill="url(#forecastGradient)"
              strokeWidth={2}
              strokeDasharray="5 5"
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
