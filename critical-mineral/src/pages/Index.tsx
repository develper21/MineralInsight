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

const Index = () => {
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="Total Import Value"
              value="$8.01B"
              change={37.8}
              changeLabel="vs last year"
              icon={DollarSign}
              delay={0}
            />
            <StatCard
              title="Critical Minerals"
              value="30"
              icon={Package}
              delay={0.1}
            />
            <StatCard
              title="Trade Deficit"
              value="$4.02B"
              change={-65.2}
              changeLabel="widening"
              icon={ArrowUpDown}
              delay={0.2}
            />
            <StatCard
              title="High Risk Minerals"
              value="12"
              icon={AlertTriangle}
              delay={0.3}
            />
          </div>

          {/* Mineral Cards */}
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
              <MineralCard
                name="Copper"
                symbol="Cu"
                importValue="$2.4B"
                exportValue="$0.8B"
                dependency={68}
                riskLevel="medium"
                trend={12.5}
                color="copper"
                delay={0}
              />
              <MineralCard
                name="Lithium"
                symbol="Li"
                importValue="$1.8B"
                exportValue="$0.02B"
                dependency={99}
                riskLevel="high"
                trend={45.2}
                color="lithium"
                delay={0.1}
              />
              <MineralCard
                name="Graphite"
                symbol="C"
                importValue="$0.9B"
                exportValue="$0.15B"
                dependency={85}
                riskLevel="medium"
                trend={8.3}
                color="graphite"
                delay={0.2}
              />
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
              <span>Last Updated: Jan 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
