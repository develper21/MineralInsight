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

const tradeData = [
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

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={tradeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="importGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="exportGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 69%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(152, 69%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
            <XAxis 
              dataKey="year" 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value}B`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="import"
              stroke="hsl(0, 72%, 55%)"
              strokeWidth={2}
              fill="url(#importGradient)"
              name="import"
            />
            <Area
              type="monotone"
              dataKey="export"
              stroke="hsl(152, 69%, 45%)"
              strokeWidth={2}
              fill="url(#exportGradient)"
              name="export"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="hsl(190, 95%, 50%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#forecastGradient)"
              name="forecast"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
