import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { 
  Filter, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  ArrowUpDown 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";

const yearlyData = [
  { year: "2017-18", copper: 1.8, lithium: 0.4, graphite: 0.5, total: 2.7 },
  { year: "2018-19", copper: 2.0, lithium: 0.5, graphite: 0.55, total: 3.05 },
  { year: "2019-20", copper: 2.1, lithium: 0.6, graphite: 0.6, total: 3.3 },
  { year: "2020-21", copper: 1.9, lithium: 0.5, graphite: 0.53, total: 2.93 },
  { year: "2021-22", copper: 2.3, lithium: 0.9, graphite: 0.7, total: 3.9 },
  { year: "2022-23", copper: 2.8, lithium: 1.4, graphite: 0.85, total: 5.05 },
  { year: "2023-24", copper: 3.2, lithium: 1.9, graphite: 0.95, total: 6.05 },
];

const hsCodeData = [
  { code: "74031100", description: "Refined copper cathodes", import: 1450, export: 320, unit: "MT" },
  { code: "28369100", description: "Lithium carbonate", import: 45000, export: 120, unit: "MT" },
  { code: "25041010", description: "Natural graphite powder", import: 89000, export: 12500, unit: "MT" },
  { code: "26030010", description: "Copper ores & concentrates", import: 680000, export: 0, unit: "MT" },
  { code: "28252000", description: "Lithium hydroxide", import: 22000, export: 85, unit: "MT" },
  { code: "38011000", description: "Artificial graphite", import: 56000, export: 8200, unit: "MT" },
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
              ${entry.value}B
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const EximAnalysis = () => {
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
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              EXIM Data Analysis
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Comprehensive export-import analysis with HS code mapping, trade volumes, 
              and dependency metrics for India's critical minerals.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 mb-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filters:</span>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Mineral" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Minerals</SelectItem>
                  <SelectItem value="copper">Copper</SelectItem>
                  <SelectItem value="lithium">Lithium</SelectItem>
                  <SelectItem value="graphite">Graphite</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="2023-24">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                  <SelectItem value="2022-23">2022-23</SelectItem>
                  <SelectItem value="2021-22">2021-22</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="import">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trade Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="import">Imports</SelectItem>
                  <SelectItem value="export">Exports</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1" />
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </motion.div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Yearly Import Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                Import Value by Mineral (USD Billion)
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                    <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="copper" name="Copper" fill="hsl(25, 85%, 55%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lithium" name="Lithium" fill="hsl(200, 100%, 55%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="graphite" name="Graphite" fill="hsl(220, 10%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Total Trade Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                Total Import Growth Trend
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                    <XAxis dataKey="year" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Total Import" 
                      stroke="hsl(190, 95%, 50%)" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(190, 95%, 50%)", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "hsl(190, 95%, 50%)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* HS Code Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-6 border-b border-border/50">
              <h3 className="font-display text-xl font-semibold text-foreground">
                ITC-HS Code Trade Data
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Detailed trade volumes by HS classification codes
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>HS Code</th>
                    <th>Description</th>
                    <th>Import Volume</th>
                    <th>Export Volume</th>
                    <th>Trade Balance</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {hsCodeData.map((item, index) => {
                    const balance = item.export - item.import;
                    return (
                      <motion.tr
                        key={item.code}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                      >
                        <td className="font-mono text-primary">{item.code}</td>
                        <td className="text-foreground">{item.description}</td>
                        <td className="font-display font-semibold text-import">
                          {item.import.toLocaleString()}
                        </td>
                        <td className="font-display font-semibold text-export">
                          {item.export.toLocaleString()}
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {balance > 0 ? (
                              <TrendingUp className="w-4 h-4 text-success" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-destructive" />
                            )}
                            <span className={cn(
                              "font-medium",
                              balance > 0 ? "text-success" : "text-destructive"
                            )}>
                              {balance.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="text-muted-foreground">{item.unit}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default EximAnalysis;
