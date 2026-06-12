import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
} from "recharts";

const timeSeriesData = [
  { year: "2017", copper: 320, lithium: 45, graphite: 180, copperPrice: 6200, lithiumPrice: 12000 },
  { year: "2018", copper: 380, lithium: 62, graphite: 210, copperPrice: 6800, lithiumPrice: 15000 },
  { year: "2019", copper: 410, lithium: 78, graphite: 245, copperPrice: 6100, lithiumPrice: 11000 },
  { year: "2020", copper: 365, lithium: 95, graphite: 220, copperPrice: 6400, lithiumPrice: 8500 },
  { year: "2021", copper: 480, lithium: 145, graphite: 290, copperPrice: 9500, lithiumPrice: 17000 },
  { year: "2022", copper: 550, lithium: 210, graphite: 340, copperPrice: 8800, lithiumPrice: 78000 },
  { year: "2023", copper: 620, lithium: 280, graphite: 380, copperPrice: 8400, lithiumPrice: 45000 },
  { year: "2024", copper: 685, lithium: 320, graphite: 420, copperPrice: 9200, lithiumPrice: 32000 },
];

const seasonalData = [
  { month: "Jan", copper: 52, lithium: 28, graphite: 35 },
  { month: "Feb", copper: 48, lithium: 25, graphite: 32 },
  { month: "Mar", copper: 58, lithium: 32, graphite: 38 },
  { month: "Apr", copper: 62, lithium: 35, graphite: 42 },
  { month: "May", copper: 55, lithium: 30, graphite: 36 },
  { month: "Jun", copper: 50, lithium: 27, graphite: 33 },
  { month: "Jul", copper: 45, lithium: 24, graphite: 30 },
  { month: "Aug", copper: 48, lithium: 26, graphite: 32 },
  { month: "Sep", copper: 58, lithium: 33, graphite: 40 },
  { month: "Oct", copper: 65, lithium: 38, graphite: 45 },
  { month: "Nov", copper: 70, lithium: 42, graphite: 48 },
  { month: "Dec", copper: 68, lithium: 40, graphite: 46 },
];

const structuralBreaks = [
  { year: "2020", event: "COVID-19 Pandemic", impact: "Supply chain disruption, -12% import decline", type: "negative" },
  { year: "2021", event: "EV Boom Begins", impact: "Lithium demand surge +52%, price spike", type: "positive" },
  { year: "2022", event: "Lithium Price Peak", impact: "All-time high $78,000/ton, strategic stockpiling", type: "warning" },
  { year: "2023", event: "China Export Controls", impact: "Graphite restrictions, diversification push", type: "negative" },
];

export default function TrendAnalysis() {
  const [selectedMineral, setSelectedMineral] = useState<"copper" | "lithium" | "graphite">("copper");
  const [timeRange, setTimeRange] = useState("all");

  const getMineralColor = (mineral: string) => {
    switch(mineral) {
      case "copper": return "hsl(var(--copper))";
      case "lithium": return "hsl(var(--lithium))";
      case "graphite": return "hsl(var(--graphite))";
      default: return "hsl(var(--primary))";
    }
  };

  const calculateCAGR = (startValue: number, endValue: number, years: number) => {
    return ((Math.pow(endValue / startValue, 1 / years) - 1) * 100).toFixed(1);
  };

  const stats = {
    copper: {
      cagr: calculateCAGR(320, 685, 7),
      volatility: "Medium",
      correlation: 0.78,
      trend: "Upward"
    },
    lithium: {
      cagr: calculateCAGR(45, 320, 7),
      volatility: "High",
      correlation: 0.45,
      trend: "Exponential"
    },
    graphite: {
      cagr: calculateCAGR(180, 420, 7),
      volatility: "Low",
      correlation: 0.82,
      trend: "Steady"
    }
  };

  const currentStats = stats[selectedMineral];

  return (
    <Layout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Time-Series Trend Analysis
              </h1>
              <p className="text-muted-foreground mt-1">
                Historical patterns, seasonality & structural break detection (2017-2024)
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Custom Range
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </motion.div>

          {/* Mineral Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs value={selectedMineral} onValueChange={(v) => setSelectedMineral(v as typeof selectedMineral)}>
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="copper" className="data-[state=active]:bg-copper/20 data-[state=active]:text-copper">
                  Copper
                </TabsTrigger>
                <TabsTrigger value="lithium" className="data-[state=active]:bg-lithium/20 data-[state=active]:text-lithium">
                  Lithium
                </TabsTrigger>
                <TabsTrigger value="graphite" className="data-[state=active]:bg-graphite/20 data-[state=active]:text-graphite">
                  Graphite
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">CAGR (2017-24)</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-500">+{currentStats.cagr}%</p>
                <p className="text-xs text-muted-foreground mt-1">Compound Annual Growth</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Volatility</span>
                  <AlertCircle className={`w-4 h-4 ${
                    currentStats.volatility === "High" ? "text-risk-high" :
                    currentStats.volatility === "Medium" ? "text-risk-medium" :
                    "text-risk-low"
                  }`} />
                </div>
                <p className={`text-2xl font-bold ${
                  currentStats.volatility === "High" ? "text-risk-high" :
                  currentStats.volatility === "Medium" ? "text-risk-medium" :
                  "text-risk-low"
                }`}>{currentStats.volatility}</p>
                <p className="text-xs text-muted-foreground mt-1">Price Fluctuation Level</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Global Correlation</span>
                  <ArrowUpRight className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">{currentStats.correlation}</p>
                <p className="text-xs text-muted-foreground mt-1">vs Global Market Price</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Overall Trend</span>
                  {currentStats.trend === "Upward" || currentStats.trend === "Exponential" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-risk-medium" />
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">{currentStats.trend}</p>
                <p className="text-xs text-muted-foreground mt-1">Long-term Direction</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Import Volume Trend (2017-2024)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={timeSeriesData}>
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={getMineralColor(selectedMineral)} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={getMineralColor(selectedMineral)} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <ReferenceLine yAxisId="left" y={400} stroke="hsl(var(--risk-medium))" strokeDasharray="5 5" label="Threshold" />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey={selectedMineral}
                        stroke={getMineralColor(selectedMineral)}
                        fill="url(#trendGradient)"
                        strokeWidth={3}
                        name="Import Volume (KT)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey={selectedMineral === "copper" ? "copperPrice" : "lithiumPrice"}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Global Price ($/ton)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Seasonality Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Seasonality Pattern (Monthly Avg)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={seasonalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey={selectedMineral}
                          stroke={getMineralColor(selectedMineral)}
                          fill={getMineralColor(selectedMineral)}
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Peak imports in Oct-Dec (Q4), lowest in Jul-Aug (Monsoon)
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Structural Breaks */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-risk-medium" />
                    Structural Breaks Detected
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {structuralBreaks.map((breakEvent, index) => (
                    <motion.div
                      key={breakEvent.year}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={`p-3 rounded-lg border ${
                        breakEvent.type === "negative" ? "border-risk-high/30 bg-risk-high/5" :
                        breakEvent.type === "positive" ? "border-green-500/30 bg-green-500/5" :
                        "border-risk-medium/30 bg-risk-medium/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{breakEvent.event}</span>
                        <Badge variant="outline" className="text-xs">
                          {breakEvent.year}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{breakEvent.impact}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Auto Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass-card border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Auto-Generated Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">{selectedMineral.charAt(0).toUpperCase() + selectedMineral.slice(1)} Analysis Summary:</strong>{" "}
                    {selectedMineral === "copper" && "India's copper imports have shown a steady upward trend with a CAGR of 11.5%. The import volume increased from 320 KT in 2017 to 685 KT in 2024, representing a 114% growth. Strong correlation (0.78) with global copper prices indicates price-sensitive demand. Seasonal peaks observed in Q4 align with industrial production cycles."}
                    {selectedMineral === "lithium" && "Lithium imports have experienced exponential growth with an exceptional CAGR of 32.4%, driven by EV battery demand. From 45 KT in 2017 to 320 KT in 2024, representing 611% growth. High volatility reflects price fluctuations from $12,000 to $78,000 per ton. The 2022 price spike triggered strategic stockpiling initiatives."}
                    {selectedMineral === "graphite" && "Graphite imports show steady linear growth with a CAGR of 12.8%. Strong correlation (0.82) with battery production capacity expansion. 2023 China export restrictions created supply concerns, accelerating domestic exploration in Karnataka and Odisha. Lowest volatility among the three minerals."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
