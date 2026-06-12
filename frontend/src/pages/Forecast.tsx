import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Brain, Play, Settings, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useState } from "react";
import { cn } from "@/lib/utils";

const forecastData = [
  { period: "2020-21", actual: 3.03, forecast: null, lower: null, upper: null },
  { period: "2021-22", actual: 4.2, forecast: null, lower: null, upper: null },
  { period: "2022-23", actual: 5.8, forecast: null, lower: null, upper: null },
  { period: "2023-24", actual: 8.01, forecast: null, lower: null, upper: null },
  { period: "2024-25", actual: null, forecast: 9.5, lower: 8.8, upper: 10.2 },
  { period: "2025-26", actual: null, forecast: 11.2, lower: 10.1, upper: 12.3 },
  { period: "2026-27", actual: null, forecast: 13.1, lower: 11.5, upper: 14.7 },
];

const modelMetrics = [
  { model: "ARIMA", mae: 0.42, rmse: 0.58, mape: "5.2%", r2: 0.92 },
  { model: "LSTM", mae: 0.38, rmse: 0.51, mape: "4.8%", r2: 0.94 },
  { model: "Hybrid", mae: 0.32, rmse: 0.44, mape: "4.1%", r2: 0.96 },
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
            <span className="text-muted-foreground capitalize">
              {entry.name === "actual" ? "Actual" : 
               entry.name === "forecast" ? "Forecast" :
               entry.name === "upper" ? "Upper Bound" : "Lower Bound"}:
            </span>
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

const Forecast = () => {
  const [selectedModel, setSelectedModel] = useState("hybrid");
  const [horizon, setHorizon] = useState([12]);

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h1 className="font-display text-4xl font-bold text-foreground">
                ML-Based Forecasting
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Advanced time series forecasting using ARIMA, LSTM, and hybrid models 
              to predict future import/export trends with confidence intervals.
            </p>
          </motion.div>

          {/* Model Configuration */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 glass-card p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Model Configuration
                </h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground">
                    Select Model
                  </label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arima">ARIMA</SelectItem>
                      <SelectItem value="lstm">LSTM Neural Network</SelectItem>
                      <SelectItem value="hybrid">Hybrid ARIMA-LSTM</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Hybrid model combines statistical and deep learning approaches
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground">
                    Mineral Selection
                  </label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Critical Minerals</SelectItem>
                      <SelectItem value="copper">Copper</SelectItem>
                      <SelectItem value="lithium">Lithium</SelectItem>
                      <SelectItem value="graphite">Graphite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Forecast Horizon: {horizon[0]} months
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {horizon[0] <= 12 ? "Short-term" : "Medium-term"}
                    </span>
                  </div>
                  <Slider
                    value={horizon}
                    onValueChange={setHorizon}
                    min={6}
                    max={36}
                    step={6}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>6 months</span>
                    <span>36 months</span>
                  </div>
                </div>
              </div>

              <Button className="mt-6 gap-2">
                <Play className="w-4 h-4" />
                Run Forecast
              </Button>
            </motion.div>

            {/* Model Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Model Performance
                </h3>
              </div>

              <div className="space-y-4">
                {modelMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.model}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      selectedModel === metric.model.toLowerCase() 
                        ? "bg-primary/10 border-primary/50" 
                        : "bg-secondary/30 border-border/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-semibold text-foreground">
                        {metric.model}
                      </span>
                      <span className="text-sm font-medium text-primary">
                        R² = {metric.r2}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">MAE:</span>
                        <span className="ml-1 text-foreground">{metric.mae}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">RMSE:</span>
                        <span className="ml-1 text-foreground">{metric.rmse}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">MAPE:</span>
                        <span className="ml-1 text-foreground">{metric.mape}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Forecast Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Import Value Forecast
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Predicted trade values with 95% confidence interval
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-warning rounded" />
                  <span className="text-sm text-muted-foreground">Forecast</span>
                </div>
              </div>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                  <XAxis dataKey="period" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickFormatter={(v) => `$${v}B`} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine 
                    x="2023-24" 
                    stroke="hsl(215, 20%, 55%)" 
                    strokeDasharray="5 5"
                    label={{ value: "Forecast Start", position: "top", fill: "hsl(215, 20%, 55%)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="transparent"
                    fill="url(#confidenceGradient)"
                    name="upper"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="transparent"
                    fill="hsl(var(--background))"
                    name="lower"
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(190, 95%, 50%)"
                    strokeWidth={3}
                    fill="url(#actualGradient)"
                    name="actual"
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke="hsl(38, 92%, 50%)"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    fill="transparent"
                    name="forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Insight Box */}
            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Forecast Insight
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on current trends, critical mineral imports are projected to reach 
                  $13.1B by 2026-27, representing a 63% increase from 2023-24 levels. 
                  Lithium demand is the primary driver of this growth.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Forecast;
