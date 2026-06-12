import { motion } from "framer-motion";
import indiaMap from "@/assets/india-minerals-map.jpg";

const depositData = [
  { mineral: "Copper", states: ["Rajasthan", "Madhya Pradesh", "Jharkhand"], reserves: "1.4 Bn T" },
  { mineral: "Lithium", states: ["J&K (Reasi)", "Karnataka", "Rajasthan"], reserves: "5.9 M T" },
  { mineral: "Graphite", states: ["Arunachal Pradesh", "Jharkhand", "Odisha"], reserves: "35.1 M T" },
];

export function IndiaMapSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card p-6 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">
            Mineral Deposit Distribution
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Key mining regions and exploration sites across India
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Map */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary/30">
          <img 
            src={indiaMap} 
            alt="India Mineral Deposits Map"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-copper" />
              <span className="text-foreground">Copper</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-lithium" />
              <span className="text-foreground">Lithium</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-graphite" />
              <span className="text-foreground">Graphite</span>
            </div>
          </div>
        </div>

        {/* Deposit Details */}
        <div className="space-y-4">
          {depositData.map((deposit, index) => (
            <motion.div
              key={deposit.mineral}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="p-4 rounded-lg bg-secondary/30 border border-border/30"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-display font-semibold text-foreground">
                  {deposit.mineral}
                </h4>
                <span className="text-sm font-medium text-primary">
                  {deposit.reserves}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {deposit.states.map((state) => (
                  <span 
                    key={state}
                    className="px-2 py-1 rounded text-xs bg-secondary text-muted-foreground"
                  >
                    {state}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
