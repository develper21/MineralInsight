import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const partnerData = [
  { 
    country: "China", 
    flag: "🇨🇳", 
    share: 42.5, 
    value: 3.4, 
    trend: 15.2, 
    risk: "high" as const,
    minerals: ["Lithium", "Graphite", "REE"]
  },
  { 
    country: "Australia", 
    flag: "🇦🇺", 
    share: 18.3, 
    value: 1.47, 
    trend: 8.5, 
    risk: "low" as const,
    minerals: ["Lithium", "Copper"]
  },
  { 
    country: "Chile", 
    flag: "🇨🇱", 
    share: 12.7, 
    value: 1.02, 
    trend: -2.3, 
    risk: "low" as const,
    minerals: ["Copper", "Lithium"]
  },
  { 
    country: "Indonesia", 
    flag: "🇮🇩", 
    share: 9.8, 
    value: 0.79, 
    trend: 22.1, 
    risk: "medium" as const,
    minerals: ["Nickel", "Copper"]
  },
  { 
    country: "South Africa", 
    flag: "🇿🇦", 
    share: 6.2, 
    value: 0.5, 
    trend: -5.4, 
    risk: "medium" as const,
    minerals: ["PGE", "Manganese"]
  },
];

const riskColors = {
  high: "text-risk-high bg-risk-high/10 border-risk-high/30",
  medium: "text-risk-medium bg-risk-medium/10 border-risk-medium/30",
  low: "text-risk-low bg-risk-low/10 border-risk-low/30",
};

export function CountryTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-6 border-b border-border/50">
        <h3 className="font-display text-xl font-semibold text-foreground">
          Top Trading Partners
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Import share by country with geopolitical risk assessment
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>Share</th>
              <th>Value (USD B)</th>
              <th>YoY Change</th>
              <th>Risk Level</th>
              <th>Key Minerals</th>
            </tr>
          </thead>
          <tbody>
            {partnerData.map((partner, index) => (
              <motion.tr
                key={partner.country}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <td>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{partner.flag}</span>
                    <span className="font-medium text-foreground">
                      {partner.country}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${partner.share}%` }}
                      />
                    </div>
                    <span className="font-medium">{partner.share}%</span>
                  </div>
                </td>
                <td className="font-display font-semibold">
                  ${partner.value}B
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    {partner.trend > 0 ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <span className={cn(
                      "font-medium",
                      partner.trend > 0 ? "text-success" : "text-destructive"
                    )}>
                      {partner.trend > 0 ? "+" : ""}{partner.trend}%
                    </span>
                  </div>
                </td>
                <td>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                    riskColors[partner.risk]
                  )}>
                    <AlertTriangle className="w-3 h-3" />
                    {partner.risk.charAt(0).toUpperCase() + partner.risk.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1.5 flex-wrap">
                    {partner.minerals.map((mineral) => (
                      <span 
                        key={mineral}
                        className="px-2 py-0.5 rounded text-xs bg-secondary text-muted-foreground"
                      >
                        {mineral}
                      </span>
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
