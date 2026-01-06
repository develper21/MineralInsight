import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  mineral?: "copper" | "lithium" | "graphite";
  delay?: number;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon,
  mineral,
  delay = 0 
}: StatCardProps) {
  const isPositive = change && change > 0;
  
  const mineralStyles = {
    copper: "border-copper/30 hover:border-copper/50 hover:shadow-copper",
    lithium: "border-lithium/30 hover:border-lithium/50 hover:shadow-lithium",
    graphite: "border-graphite/30 hover:border-graphite/50 hover:shadow-graphite",
  };

  const iconStyles = {
    copper: "text-copper bg-copper/10",
    lithium: "text-lithium bg-lithium/10",
    graphite: "text-graphite bg-graphite/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "stat-card group",
        mineral && mineralStyles[mineral]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="metric-label">{title}</p>
          <p className={cn(
            "metric-value",
            mineral === "copper" && "text-gradient-copper",
            mineral === "lithium" && "text-gradient-lithium",
            !mineral && "text-foreground"
          )}>
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={cn(
                "text-sm font-medium",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? "+" : ""}{change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-muted-foreground">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-lg transition-colors",
          mineral ? iconStyles[mineral] : "text-primary bg-primary/10"
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}
