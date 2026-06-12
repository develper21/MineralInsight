import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MineralCardProps {
  name: string;
  symbol: string;
  importValue: string;
  exportValue: string;
  dependency: number;
  riskLevel: "high" | "medium" | "low";
  trend: number;
  color: "copper" | "lithium" | "graphite";
  delay?: number;
}

export function MineralCard({
  name,
  symbol,
  importValue,
  exportValue,
  dependency,
  riskLevel,
  trend,
  color,
  delay = 0,
}: MineralCardProps) {
  const colorStyles = {
    copper: {
      border: "border-copper/40 hover:border-copper",
      shadow: "hover:shadow-copper",
      bg: "bg-copper/10",
      text: "text-copper",
      gradient: "from-copper to-copper-glow",
    },
    lithium: {
      border: "border-lithium/40 hover:border-lithium",
      shadow: "hover:shadow-lithium",
      bg: "bg-lithium/10",
      text: "text-lithium",
      gradient: "from-lithium to-lithium-glow",
    },
    graphite: {
      border: "border-graphite/40 hover:border-graphite",
      shadow: "hover:shadow-graphite",
      bg: "bg-graphite/10",
      text: "text-graphite",
      gradient: "from-graphite to-graphite-glow",
    },
  };

  const riskStyles = {
    high: { color: "risk-high", label: "High Risk" },
    medium: { color: "risk-medium", label: "Medium Risk" },
    low: { color: "risk-low", label: "Low Risk" },
  };

  const styles = colorStyles[color];
  const risk = riskStyles[riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className={cn(
        "glass-card p-6 cursor-pointer transition-all duration-300",
        styles.border,
        styles.shadow
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            styles.bg
          )}>
            <span className={cn("font-display text-xl font-bold", styles.text)}>
              {symbol}
            </span>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {name}
            </h3>
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              `text-${risk.color}`
            )}>
              <AlertTriangle className="w-3 h-3" />
              {risk.label}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-destructive" />
          )}
          <span className={cn(
            "text-sm font-medium",
            trend > 0 ? "text-success" : "text-destructive"
          )}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Import Value
          </p>
          <p className="font-display text-lg font-semibold text-import">
            {importValue}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Export Value
          </p>
          <p className="font-display text-lg font-semibold text-export">
            {exportValue}
          </p>
        </div>
      </div>

      {/* Dependency Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Import Dependency</span>
          <span className={cn("font-medium", styles.text)}>{dependency}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${dependency}%` }}
            transition={{ duration: 1, delay: delay + 0.3 }}
            className={cn("h-full rounded-full bg-gradient-to-r", styles.gradient)}
          />
        </div>
      </div>
    </motion.div>
  );
}
