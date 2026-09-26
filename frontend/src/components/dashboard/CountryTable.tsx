import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTopPartners, type TopPartner } from "@/hooks/useDashboard";

const fallbackData: TopPartner[] = [
  { 
    country: "China", 
    flag: "🇨🇳", 
    sharePercent: 42.5, 
    valueUSD: 3400000000, 
    riskLevel: "high",
    minerals: ["Lithium", "Graphite", "REE"]
  },
  { 
    country: "Australia", 
    flag: "🇦🇺", 
    sharePercent: 18.3, 
    valueUSD: 1470000000, 
    riskLevel: "low",
    minerals: ["Lithium", "Copper"]
  },
  { 
    country: "Chile", 
    flag: "🇨🇱", 
    sharePercent: 12.7, 
    valueUSD: 1020000000, 
    riskLevel: "low",
    minerals: ["Copper", "Lithium"]
  },
  { 
    country: "Indonesia", 
    flag: "🇮🇩", 
    sharePercent: 9.8, 
    valueUSD: 790000000, 
    riskLevel: "medium",
    minerals: ["Nickel", "Copper"]
  },
  { 
    country: "South Africa", 
    flag: "🇿🇦", 
    sharePercent: 6.2, 
    valueUSD: 500000000, 
    riskLevel: "medium",
    minerals: ["PGE", "Manganese"]
  },
];

const flagEmoji = (code: string): string =>
  code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

const riskColors = {
  high: "text-risk-high bg-risk-high/10 border-risk-high/30",
  medium: "text-risk-medium bg-risk-medium/10 border-risk-medium/30",
  low: "text-risk-low bg-risk-low/10 border-risk-low/30",
};

export function CountryTable() {
  const { data } = useTopPartners(5);
  const partnerData: TopPartner[] =
    data && data.length > 0 ? data : fallbackData;

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
              <th>Import Share</th>
              <th>Value (USD)</th>
              <th>Key Minerals</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {partnerData.map((partner, index) => {
              const risk = (partner.riskLevel || "medium") as keyof typeof riskColors;
              return (
                <motion.tr
                  key={`${partner.country}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {partner.flag && partner.flag.length <= 2
                          ? partner.flag
                          : flagEmoji(partner.flag || "")}
                      </span>
                      <span className="font-medium text-foreground">
                        {partner.country}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${partner.sharePercent}%` }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {partner.sharePercent.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="font-medium text-foreground">
                    ${(partner.valueUSD / 1_000_000_000).toFixed(2)}B
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(partner.minerals || []).map((mineral) => (
                        <span
                          key={mineral}
                          className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground"
                        >
                          {mineral}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border",
                        riskColors[risk]
                      )}
                    >
                      {risk.toUpperCase()}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
