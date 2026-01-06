import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Shield, AlertTriangle, TrendingUp, TrendingDown, Info } from "lucide-react";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const riskData = [
  { 
    mineral: "Lithium", 
    overall: 89, 
    dependency: 99, 
    concentration: 85, 
    volatility: 78, 
    reserves: 15,
    trend: 12.5,
    status: "Critical" as const 
  },
  { 
    mineral: "Cobalt", 
    overall: 92, 
    dependency: 100, 
    concentration: 90, 
    volatility: 82, 
    reserves: 8,
    trend: 8.2,
    status: "Critical" as const 
  },
  { 
    mineral: "Nickel", 
    overall: 85, 
    dependency: 95, 
    concentration: 75, 
    volatility: 70, 
    reserves: 20,
    trend: 5.4,
    status: "Critical" as const 
  },
  { 
    mineral: "Graphite", 
    overall: 72, 
    dependency: 85, 
    concentration: 65, 
    volatility: 55, 
    reserves: 45,
    trend: -2.1,
    status: "Elevated" as const 
  },
  { 
    mineral: "Copper", 
    overall: 58, 
    dependency: 68, 
    concentration: 45, 
    volatility: 62, 
    reserves: 35,
    trend: 3.8,
    status: "Elevated" as const 
  },
  { 
    mineral: "REE", 
    overall: 88, 
    dependency: 98, 
    concentration: 92, 
    volatility: 60, 
    reserves: 12,
    trend: 15.2,
    status: "Critical" as const 
  },
];

const radarData = [
  { factor: "Import Dependency", Lithium: 99, Copper: 68, Graphite: 85 },
  { factor: "Supply Concentration", Lithium: 85, Copper: 45, Graphite: 65 },
  { factor: "Price Volatility", Lithium: 78, Copper: 62, Graphite: 55 },
  { factor: "Demand Growth", Lithium: 95, Copper: 55, Graphite: 70 },
  { factor: "Reserve Gap", Lithium: 85, Copper: 35, Graphite: 55 },
  { factor: "Geopolitical Risk", Lithium: 80, Copper: 40, Graphite: 72 },
];

const statusStyles = {
  Critical: { bg: "bg-risk-high/10", text: "text-risk-high", border: "border-risk-high/30" },
  Elevated: { bg: "bg-risk-medium/10", text: "text-risk-medium", border: "border-risk-medium/30" },
  Stable: { bg: "bg-risk-low/10", text: "text-risk-low", border: "border-risk-low/30" },
};

const RiskIndex = () => {
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
              <div className="p-3 rounded-xl bg-risk-high/10">
                <Shield className="w-6 h-6 text-risk-high" />
              </div>
              <h1 className="font-display text-4xl font-bold text-foreground">
                Critical Mineral Risk Index
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Comprehensive risk assessment combining import dependency, supply concentration, 
              price volatility, and domestic reserve gaps for strategic planning.
            </p>
          </motion.div>

          {/* Risk Overview Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card overflow-hidden mb-8"
          >
            <div className="p-6 border-b border-border/50">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Risk Assessment Overview
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Composite risk scores for India's critical minerals
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mineral</th>
                    <th>Overall Risk</th>
                    <th>Import Dependency</th>
                    <th>Supply Concentration</th>
                    <th>Price Volatility</th>
                    <th>Domestic Reserves</th>
                    <th>YoY Trend</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {riskData.map((item, index) => {
                    const styles = statusStyles[item.status];
                    return (
                      <motion.tr
                        key={item.mineral}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                      >
                        <td className="font-display font-semibold text-foreground">
                          {item.mineral}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  item.overall >= 80 ? "bg-risk-high" :
                                  item.overall >= 60 ? "bg-risk-medium" : "bg-risk-low"
                                )}
                                style={{ width: `${item.overall}%` }}
                              />
                            </div>
                            <span className="font-medium">{item.overall}</span>
                          </div>
                        </td>
                        <td className={cn(
                          "font-medium",
                          item.dependency >= 90 ? "text-risk-high" :
                          item.dependency >= 70 ? "text-risk-medium" : "text-risk-low"
                        )}>
                          {item.dependency}%
                        </td>
                        <td className={cn(
                          "font-medium",
                          item.concentration >= 80 ? "text-risk-high" :
                          item.concentration >= 60 ? "text-risk-medium" : "text-risk-low"
                        )}>
                          {item.concentration}%
                        </td>
                        <td className={cn(
                          "font-medium",
                          item.volatility >= 70 ? "text-risk-high" :
                          item.volatility >= 50 ? "text-risk-medium" : "text-risk-low"
                        )}>
                          {item.volatility}%
                        </td>
                        <td className={cn(
                          "font-medium",
                          item.reserves <= 20 ? "text-risk-high" :
                          item.reserves <= 40 ? "text-risk-medium" : "text-risk-low"
                        )}>
                          {item.reserves}%
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {item.trend > 0 ? (
                              <TrendingUp className="w-4 h-4 text-risk-high" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-risk-low" />
                            )}
                            <span className={cn(
                              "font-medium",
                              item.trend > 0 ? "text-risk-high" : "text-risk-low"
                            )}>
                              {item.trend > 0 ? "+" : ""}{item.trend}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                            styles.bg, styles.text, styles.border
                          )}>
                            <AlertTriangle className="w-3 h-3" />
                            {item.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Radar Chart and Gauges */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                Multi-Factor Risk Comparison
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(217, 33%, 25%)" />
                    <PolarAngleAxis 
                      dataKey="factor" 
                      tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
                    />
                    <Radar
                      name="Lithium"
                      dataKey="Lithium"
                      stroke="hsl(200, 100%, 55%)"
                      fill="hsl(200, 100%, 55%)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Copper"
                      dataKey="Copper"
                      stroke="hsl(25, 85%, 55%)"
                      fill="hsl(25, 85%, 55%)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Graphite"
                      dataKey="Graphite"
                      stroke="hsl(220, 10%, 55%)"
                      fill="hsl(220, 10%, 55%)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Risk Gauges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Focus Minerals Risk Score
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                <RiskGauge
                  mineral="Lithium"
                  score={89}
                  color="lithium"
                  factors={[
                    { name: "Import Dependency", value: 99 },
                    { name: "Supply Concentration", value: 85 },
                    { name: "Price Volatility", value: 78 },
                  ]}
                />
                <RiskGauge
                  mineral="Copper"
                  score={58}
                  color="copper"
                  factors={[
                    { name: "Import Dependency", value: 68 },
                    { name: "Supply Concentration", value: 45 },
                    { name: "Price Volatility", value: 62 },
                  ]}
                />
                <RiskGauge
                  mineral="Graphite"
                  score={72}
                  color="graphite"
                  factors={[
                    { name: "Import Dependency", value: 85 },
                    { name: "Supply Concentration", value: 65 },
                    { name: "Price Volatility", value: 55 },
                  ]}
                />
              </div>
            </motion.div>
          </div>

          {/* Policy Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Info className="w-5 h-5 text-primary" />
              <h3 className="font-display text-xl font-semibold text-foreground">
                Strategic Recommendations
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-risk-high/5 border border-risk-high/20">
                <h4 className="font-display font-semibold text-risk-high mb-2">
                  Critical Priority
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Accelerate J&K Lithium extraction</li>
                  <li>• Diversify cobalt supply from DRC</li>
                  <li>• Strategic overseas acquisitions</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-risk-medium/5 border border-risk-medium/20">
                <h4 className="font-display font-semibold text-risk-medium mb-2">
                  Medium Priority
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Expand graphite processing capacity</li>
                  <li>• Develop recycling infrastructure</li>
                  <li>• Build strategic reserves</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-risk-low/5 border border-risk-low/20">
                <h4 className="font-display font-semibold text-risk-low mb-2">
                  Long-term Actions
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• R&D in alternative materials</li>
                  <li>• Trade agreement diversification</li>
                  <li>• Domestic exploration expansion</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default RiskIndex;
