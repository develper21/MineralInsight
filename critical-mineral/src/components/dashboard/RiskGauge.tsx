import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  mineral: string;
  score: number;
  factors: { name: string; value: number }[];
  color: "copper" | "lithium" | "graphite";
}

export function RiskGauge({ mineral, score, factors, color }: RiskGaugeProps) {
  const colorStyles = {
    copper: "text-copper",
    lithium: "text-lithium",
    graphite: "text-graphite",
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: "Critical", color: "text-risk-high" };
    if (score >= 40) return { label: "Elevated", color: "text-risk-medium" };
    return { label: "Stable", color: "text-risk-low" };
  };

  const risk = getRiskLevel(score);
  
  // Calculate the arc for the gauge
  const radius = 60;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className={cn("font-display text-lg font-semibold", colorStyles[color])}>
          {mineral}
        </h4>
        <span className={cn("text-sm font-medium", risk.color)}>
          {risk.label}
        </span>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative w-36 h-20">
          <svg className="w-full h-full" viewBox="0 0 140 80">
            {/* Background arc */}
            <path
              d="M 10 70 A 60 60 0 0 1 130 70"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <motion.path
              d="M 10 70 A 60 60 0 0 1 130 70"
              fill="none"
              stroke={
                color === "copper" ? "hsl(var(--copper))" :
                color === "lithium" ? "hsl(var(--lithium))" :
                "hsl(var(--graphite))"
              }
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <motion.span
              className="font-display text-3xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {factors.map((factor, index) => (
          <motion.div
            key={factor.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{factor.name}</span>
              <span className="font-medium text-foreground">{factor.value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${factor.value}%` }}
                transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                className={cn(
                  "h-full rounded-full",
                  factor.value >= 70 ? "bg-risk-high" :
                  factor.value >= 40 ? "bg-risk-medium" :
                  "bg-risk-low"
                )}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
