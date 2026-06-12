import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Factory, 
  Truck, 
  TrendingUp,
  Download,
  Filter
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const stateData = [
  { 
    state: "Rajasthan", 
    copper: 85, 
    lithium: 15, 
    graphite: 45,
    production: 2450,
    processing: 1800,
    rank: 1,
    status: "Major Producer"
  },
  { 
    state: "Jharkhand", 
    copper: 65, 
    lithium: 25, 
    graphite: 70,
    production: 1980,
    processing: 2200,
    rank: 2,
    status: "Processing Hub"
  },
  { 
    state: "Madhya Pradesh", 
    copper: 55, 
    lithium: 10, 
    graphite: 40,
    production: 1650,
    processing: 890,
    rank: 3,
    status: "Major Producer"
  },
  { 
    state: "Karnataka", 
    copper: 30, 
    lithium: 5, 
    graphite: 55,
    production: 1200,
    processing: 1500,
    rank: 4,
    status: "Growing"
  },
  { 
    state: "Odisha", 
    copper: 45, 
    lithium: 8, 
    graphite: 35,
    production: 1450,
    processing: 1100,
    rank: 5,
    status: "Major Producer"
  },
  { 
    state: "Tamil Nadu", 
    copper: 20, 
    lithium: 3, 
    graphite: 25,
    production: 680,
    processing: 950,
    rank: 6,
    status: "Processing Hub"
  },
  { 
    state: "Andhra Pradesh", 
    copper: 25, 
    lithium: 12, 
    graphite: 30,
    production: 780,
    processing: 620,
    rank: 7,
    status: "Emerging"
  },
  { 
    state: "Gujarat", 
    copper: 35, 
    lithium: 2, 
    graphite: 15,
    production: 520,
    processing: 1800,
    rank: 8,
    status: "Processing Hub"
  },
];

const mineralDeposits = [
  { state: "Rajasthan", mineral: "Copper", location: "Khetri Belt", reserve: "800 MT", status: "Active" },
  { state: "Jharkhand", mineral: "Graphite", location: "Palamau", reserve: "45 MT", status: "Active" },
  { state: "Karnataka", mineral: "Lithium", location: "Mandya", reserve: "5.9 MT", status: "Exploration" },
  { state: "J&K", mineral: "Lithium", location: "Reasi", reserve: "5.9 MT", status: "Exploration" },
  { state: "Rajasthan", mineral: "Lithium", location: "Degana", reserve: "2.1 MT", status: "Exploration" },
  { state: "MP", mineral: "Copper", location: "Malanjkhand", reserve: "450 MT", status: "Active" },
  { state: "Odisha", mineral: "Graphite", location: "Koraput", reserve: "35 MT", status: "Active" },
  { state: "Tamil Nadu", mineral: "Graphite", location: "Sivaganga", reserve: "28 MT", status: "Active" },
];

export default function StateMineralMap() {
  const [selectedMineral, setSelectedMineral] = useState<"copper" | "lithium" | "graphite">("copper");
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const getColorForValue = (value: number) => {
    if (value >= 70) return "hsl(var(--risk-high))";
    if (value >= 40) return "hsl(var(--risk-medium))";
    return "hsl(var(--risk-low))";
  };

  const getMineralColor = (mineral: string) => {
    switch(mineral) {
      case "copper": return "hsl(var(--copper))";
      case "lithium": return "hsl(var(--lithium))";
      case "graphite": return "hsl(var(--graphite))";
      default: return "hsl(var(--primary))";
    }
  };

  const chartData = stateData.map(s => ({
    name: s.state.slice(0, 3).toUpperCase(),
    value: s[selectedMineral],
    fullName: s.state
  }));

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
                State-Level Mineral Mapping
              </h1>
              <p className="text-muted-foreground mt-1">
                GST-HSN based mineral production & processing analysis by state
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
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

          <div className="grid lg:grid-cols-3 gap-6">
            {/* State Ranking Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    State-wise {selectedMineral.charAt(0).toUpperCase() + selectedMineral.slice(1)} Capability Index
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={50} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [
                            `${value}%`,
                            props.payload.fullName
                          ]}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getMineralColor(selectedMineral)} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* State Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Top Producing States
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stateData.slice(0, 5).map((state, index) => (
                    <motion.div
                      key={state.state}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`p-3 rounded-lg border border-border/50 cursor-pointer transition-all hover:border-primary/50 ${
                        selectedState === state.state ? 'bg-primary/10 border-primary/50' : 'bg-secondary/30'
                      }`}
                      onClick={() => setSelectedState(state.state)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {state.rank}
                          </span>
                          <span className="font-medium text-foreground">{state.state}</span>
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          state.status === "Major Producer" ? "bg-green-500/10 text-green-500" :
                          state.status === "Processing Hub" ? "bg-primary/10 text-primary" :
                          "bg-risk-medium/10 text-risk-medium"
                        }`}>
                          {state.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Factory className="w-3 h-3" />
                          <span>Production: {state.production} KT</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Truck className="w-3 h-3" />
                          <span>Processing: {state.processing} KT</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Deposit Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Known Mineral Deposits (GSI/IBM Data)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>State</th>
                        <th>Mineral</th>
                        <th>Location</th>
                        <th>Estimated Reserve</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mineralDeposits.map((deposit, index) => (
                        <motion.tr
                          key={`${deposit.state}-${deposit.mineral}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.05 }}
                        >
                          <td className="font-medium">{deposit.state}</td>
                          <td>
                            <Badge className={`${
                              deposit.mineral === "Copper" ? "mineral-badge-copper" :
                              deposit.mineral === "Lithium" ? "mineral-badge-lithium" :
                              "mineral-badge-graphite"
                            }`}>
                              {deposit.mineral}
                            </Badge>
                          </td>
                          <td className="text-muted-foreground">{deposit.location}</td>
                          <td className="font-mono text-sm">{deposit.reserve}</td>
                          <td>
                            <Badge variant="outline" className={`${
                              deposit.status === "Active" ? "bg-green-500/10 text-green-500" :
                              "bg-risk-medium/10 text-risk-medium"
                            }`}>
                              {deposit.status}
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Limitation Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass-card border-risk-medium/30 bg-risk-medium/5">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-risk-medium">Data Limitation:</strong> State-level consumption estimates are derived from GST-HSN data and may not reflect actual end-use. Processing activities in different states (e.g., Gujarat, Tamil Nadu) may skew consumption figures. Actual mineral origin tracking requires HS code-level analysis.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
