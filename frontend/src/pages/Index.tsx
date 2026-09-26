import { motion } from "framer-motion";
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Boxes,
  ArrowUpDown
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { StatCard } from "@/components/dashboard/StatCard";
import { MineralCard } from "@/components/dashboard/MineralCard";
import { TradeChart } from "@/components/dashboard/TradeChart";
import { CountryTable } from "@/components/dashboard/CountryTable";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { IndiaMapSection } from "@/components/dashboard/IndiaMapSection";
import {
  useDashboardSummary,
  useFocusMinerals,
  useRiskGauges,
  formatBillions,
} from "@/hooks/useDashboard";

const RISK_LEVELS = ["low", "medium", "high"] as const;
type RiskLevel = (typeof RISK_LEVELS)[number];
const CARD_COLORS = ["copper", "lithium", "graphite"] as const;
type CardColor = (typeof CARD_COLORS)[number];

const asRisk = (level: string | undefined): RiskLevel =>
  RISK_LEVELS.includes((level || "") as RiskLevel) ? (level as RiskLevel) : "medium";

const asColor = (i: number): CardColor => CARD_COLORS[i % CARD_COLORS.length];

const Index = () => {
  const { data: summary } = useDashboardSummary();
  const { data: focusMinerals } = useFocusMinerals(3);
  const { data: riskGauges } = useRiskGauges(3);

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection />

      {/* Dashboard Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Real-Time Market Intelligence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Live EXIM data analysis for India's critical minerals with AI-powered insights
            </p>
          </motion.div>

          {/* Stats Grid — live from /api/dashboard/summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="Total Import Value"
              value={summary ? formatBillions(summary.totalImportValueUSD) : "…"}
              change={summary?.importChangePercent ?? undefined}
              changeLabel="vs last year"
              icon={DollarSign}
              delay={0}
            />
            <StatCard
              title="Critical Minerals"
              value={summary ? String(summary.activeMinerals) : "…"}
              icon={Package}
              delay={0.1}
            />
            <StatCard
              title="Trade Deficit"
              value={summary ? formatBillions(Math.abs(summary.tradeDeficitUSD)) : "…"}
              icon={ArrowUpDown}
              delay={0.2}
            />
            <StatCard
              title="High Risk Minerals"
              value={summary ? String(summary.highRiskMinerals) : "…"}
              icon={AlertTriangle}
              delay={0.3}
            />
          </div>

          {/* Mineral Cards — live from /api/dashboard/focus-minerals */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
              Focus Minerals Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(focusMinerals || []).map((mineral, index) => (
                <MineralCard
                  key={mineral.id}
                  name={mineral.name}
                  symbol={mineral.symbol}
                  importValue={formatBillions(mineral.importValueUSD)}
                  exportValue={formatBillions(mineral.exportValueUSD)}
                  dependency={mineral.importDependencyPercent}
                  riskLevel={asRisk(mineral.riskLevel)}
                  trend={mineral.trendPercent}
                  color={asColor(index)}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </motion.div>

          {/* Trade Chart */}
          <div className="mb-12">
            <TradeChart />
          </div>

          {/* Risk Gauges and Map */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            <div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
                Risk Assessment Index
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                {(riskGauges || []).map((gauge) => (
                  <RiskGauge
                    key={gauge.mineral}
                    mineral={gauge.mineral}
                    score={gauge.score}
                    color={asColor(0)}
                    factors={gauge.factors}
                  />
                ))}
              </div>
            </div>
            <IndiaMapSection />
          </div>

          {/* Country Table */}
          <CountryTable />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-display text-lg font-semibold text-foreground">
                Critical Mineral Intelligence Platform
              </p>
              <p className="text-sm text-muted-foreground">
                Powered by TEXMiN Foundation • IIT (ISM) Dhanbad
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Data Source: DGCI&S, Ministry of Commerce</span>
              <span className="hidden md:inline">•</span>
              <span>Last Updated: {new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
