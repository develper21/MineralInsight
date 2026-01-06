import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  RotateCcw,
  Download,
  Play
} from "lucide-react";
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

const baselineData = [
  { year: "2024", baseline: 450, scenario: 450 },
  { year: "2025", baseline: 520, scenario: 520 },
  { year: "2026", baseline: 600, scenario: 600 },
  { year: "2027", baseline: 690, scenario: 690 },
  { year: "2028", baseline: 795, scenario: 795 },
  { year: "2029", baseline: 915, scenario: 915 },
  { year: "2030", baseline: 1050, scenario: 1050 },
];

export default function ScenarioAnalysis() {
  const [domesticProduction, setDomesticProduction] = useState(0);
  const [importReduction, setImportReduction] = useState(0);
  const [newSuppliers, setNewSuppliers] = useState(0);
  const [recyclingRate, setRecyclingRate] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);

  const calculateScenario = () => {
    const factor = 1 - (importReduction / 100) + (domesticProduction / 100) + (newSuppliers * 0.05) + (recyclingRate / 200);
    return baselineData.map(item => ({
      ...item,
      scenario: Math.round(item.baseline * factor)
    }));
  };

  const scenarioData = calculateScenario();

  const calculateImpact = () => {
    const baselineTotal = baselineData.reduce((sum, d) => sum + d.baseline, 0);
    const scenarioTotal = scenarioData.reduce((sum, d) => sum + d.scenario, 0);
    const change = ((scenarioTotal - baselineTotal) / baselineTotal) * 100;
    
    const dependencyReduction = importReduction + (domesticProduction * 0.8) + (recyclingRate * 0.3);
    const riskReduction = (newSuppliers * 10) + (importReduction * 0.5) + (domesticProduction * 0.3);
    const costSaving = (importReduction * 2.5) - (domesticProduction * 1.2) + (recyclingRate * 0.8);

    return {
      importChange: change.toFixed(1),
      dependencyReduction: Math.min(dependencyReduction, 100).toFixed(1),
      riskReduction: Math.min(riskReduction, 100).toFixed(1),
      costSaving: costSaving.toFixed(1)
    };
  };

  const impact = calculateImpact();

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationComplete(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationComplete(true);
    }, 1500);
  };

  const resetScenario = () => {
    setDomesticProduction(0);
    setImportReduction(0);
    setNewSuppliers(0);
    setRecyclingRate(0);
    setSimulationComplete(false);
  };

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
                Scenario & What-If Analysis
              </h1>
              <p className="text-muted-foreground mt-1">
                Simulate policy changes and analyze their impact on mineral security
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetScenario}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Scenario Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 space-y-4"
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="w-5 h-5 text-primary" />
                    Scenario Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Domestic Production */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-foreground">
                        Domestic Production Increase
                      </label>
                      <Badge variant="outline" className="bg-primary/10">
                        +{domesticProduction}%
                      </Badge>
                    </div>
                    <Slider
                      value={[domesticProduction]}
                      onValueChange={(v) => setDomesticProduction(v[0])}
                      max={100}
                      step={5}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Increase in domestic mining & processing capacity
                    </p>
                  </div>

                  {/* Import Reduction */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-foreground">
                        Import Reduction Target
                      </label>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive">
                        -{importReduction}%
                      </Badge>
                    </div>
                    <Slider
                      value={[importReduction]}
                      onValueChange={(v) => setImportReduction(v[0])}
                      max={50}
                      step={5}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Targeted reduction in import dependency
                    </p>
                  </div>

                  {/* New Suppliers */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-foreground">
                        New Supplier Countries
                      </label>
                      <Badge variant="outline" className="bg-accent/20">
                        +{newSuppliers}
                      </Badge>
                    </div>
                    <Slider
                      value={[newSuppliers]}
                      onValueChange={(v) => setNewSuppliers(v[0])}
                      max={10}
                      step={1}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Diversification through new trade partnerships
                    </p>
                  </div>

                  {/* Recycling Rate */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-foreground">
                        Recycling & Recovery Rate
                      </label>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        {recyclingRate}%
                      </Badge>
                    </div>
                    <Slider
                      value={[recyclingRate]}
                      onValueChange={(v) => setRecyclingRate(v[0])}
                      max={40}
                      step={5}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Urban mining and mineral recycling capacity
                    </p>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    onClick={runSimulation}
                    disabled={isSimulating}
                  >
                    {isSimulating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                        />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-4"
            >
              {/* Impact Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className={`glass-card border-border/50 transition-all ${simulationComplete ? 'ring-2 ring-primary/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Import Change</span>
                      {parseFloat(impact.importChange) < 0 ? (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-risk-high" />
                      )}
                    </div>
                    <p className={`text-2xl font-bold ${parseFloat(impact.importChange) < 0 ? 'text-green-500' : 'text-risk-high'}`}>
                      {impact.importChange}%
                    </p>
                  </CardContent>
                </Card>

                <Card className={`glass-card border-border/50 transition-all ${simulationComplete ? 'ring-2 ring-primary/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Dependency Reduction</span>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-500">
                      {impact.dependencyReduction}%
                    </p>
                  </CardContent>
                </Card>

                <Card className={`glass-card border-border/50 transition-all ${simulationComplete ? 'ring-2 ring-primary/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Risk Reduction</span>
                      <AlertTriangle className="w-4 h-4 text-risk-medium" />
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {impact.riskReduction}%
                    </p>
                  </CardContent>
                </Card>

                <Card className={`glass-card border-border/50 transition-all ${simulationComplete ? 'ring-2 ring-primary/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Cost Impact</span>
                      {parseFloat(impact.costSaving) > 0 ? (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-risk-medium" />
                      )}
                    </div>
                    <p className={`text-2xl font-bold ${parseFloat(impact.costSaving) > 0 ? 'text-green-500' : 'text-risk-medium'}`}>
                      ${Math.abs(parseFloat(impact.costSaving))}B
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison Chart */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Baseline vs Scenario Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={scenarioData}>
                        <defs>
                          <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="scenarioGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <ReferenceLine y={600} stroke="hsl(var(--risk-medium))" strokeDasharray="5 5" label="Target" />
                        <Area
                          type="monotone"
                          dataKey="baseline"
                          stroke="hsl(var(--muted-foreground))"
                          fill="url(#baselineGradient)"
                          strokeWidth={2}
                          name="Baseline"
                        />
                        <Area
                          type="monotone"
                          dataKey="scenario"
                          stroke="hsl(var(--primary))"
                          fill="url(#scenarioGradient)"
                          strokeWidth={2}
                          name="Scenario"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {simulationComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-card border-primary/30 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        Simulation Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {domesticProduction > 30 && (
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            High domestic production increase will significantly reduce import dependency
                          </li>
                        )}
                        {importReduction > 20 && (
                          <li className="flex items-start gap-2">
                            <span className="text-risk-medium">•</span>
                            Aggressive import reduction may face supply challenges in short-term
                          </li>
                        )}
                        {newSuppliers >= 5 && (
                          <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            Supplier diversification strategy will effectively reduce concentration risk
                          </li>
                        )}
                        {recyclingRate > 20 && (
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            Enhanced recycling provides sustainable long-term supply security
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          Combined scenario achieves {impact.dependencyReduction}% dependency reduction by 2030
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
