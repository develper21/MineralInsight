import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  FileWarning, 
  Database, 
  AlertTriangle, 
  CheckCircle2,
  Info,
  Download,
  BookOpen,
  Shield
} from "lucide-react";

const dataSources = [
  {
    name: "DGCI&S Trade Statistics",
    type: "Primary",
    coverage: "2017-2024",
    reliability: 95,
    limitations: "2-3 month reporting lag, HS code classification inconsistencies",
    lastUpdated: "Nov 2024"
  },
  {
    name: "IBM (Indian Bureau of Mines)",
    type: "Primary",
    coverage: "2017-2023",
    reliability: 90,
    limitations: "Annual updates only, state-level gaps for small producers",
    lastUpdated: "Mar 2024"
  },
  {
    name: "GSI (Geological Survey of India)",
    type: "Primary",
    coverage: "Exploration Data",
    reliability: 85,
    limitations: "Reserve estimates vary, exploration data not always public",
    lastUpdated: "Jun 2024"
  },
  {
    name: "World Bank Commodity Prices",
    type: "Secondary",
    coverage: "Global Prices",
    reliability: 98,
    limitations: "USD denominated, may not reflect India-specific pricing",
    lastUpdated: "Dec 2024"
  },
  {
    name: "GST-HSN Trade Data",
    type: "Derived",
    coverage: "State-level estimates",
    reliability: 70,
    limitations: "Processing vs consumption distinction unclear",
    lastUpdated: "Oct 2024"
  },
];

const assumptions = [
  {
    category: "HS Code Mapping",
    description: "Multiple HS codes mapped to single mineral category based on industry standards",
    impact: "Medium",
    mitigation: "Cross-validated with industry experts and trade associations"
  },
  {
    category: "Missing Data Interpolation",
    description: "Linear interpolation used for missing monthly values (< 5% of data)",
    impact: "Low",
    mitigation: "Flagged in outputs, sensitivity analysis conducted"
  },
  {
    category: "State-Level Allocation",
    description: "Consumption estimated from GST data, may include processing activities",
    impact: "High",
    mitigation: "Clearly labeled as estimates, not actual consumption"
  },
  {
    category: "Forecast Uncertainty",
    description: "ML models trained on historical data, may not capture future disruptions",
    impact: "Medium",
    mitigation: "Confidence intervals provided, scenario analysis available"
  },
  {
    category: "Price Correlation",
    description: "Assumes continued correlation between global and Indian prices",
    impact: "Low",
    mitigation: "Correlation coefficients updated quarterly"
  },
];

const methodologies = [
  {
    feature: "ARIMA Forecasting",
    method: "Auto ARIMA with grid search optimization",
    validation: "80-20 train-test split, walk-forward validation",
    accuracy: "MAPE: 8.2%"
  },
  {
    feature: "LSTM Forecasting",
    method: "2-layer LSTM with dropout regularization",
    validation: "Cross-validation, hyperparameter tuning",
    accuracy: "MAPE: 6.8%"
  },
  {
    feature: "Risk Index",
    method: "Weighted composite score (5 factors)",
    validation: "Expert panel review, sensitivity testing",
    accuracy: "Correlation with disruptions: 0.76"
  },
  {
    feature: "ANOVA Analysis",
    method: "One-way and Two-way ANOVA with Tukey HSD",
    validation: "Normality tests, homogeneity of variance",
    accuracy: "α = 0.05 significance level"
  },
];

export default function DataTransparency() {
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
                Data Transparency & Limitations
              </h1>
              <p className="text-muted-foreground mt-1">
                Complete disclosure of data sources, assumptions, and methodologies
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Methodology PDF
            </Button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">5</p>
                    <p className="text-xs text-muted-foreground">Data Sources</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">87%</p>
                    <p className="text-xs text-muted-foreground">Avg Reliability</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-risk-medium/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-risk-medium" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">5</p>
                    <p className="text-xs text-muted-foreground">Key Assumptions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">Audit-Ready</p>
                    <p className="text-xs text-muted-foreground">Documentation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Data Sources & Reliability Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataSources.map((source, index) => (
                    <motion.div
                      key={source.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="p-4 rounded-lg border border-border/50 bg-secondary/20"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-foreground">{source.name}</h4>
                          <Badge variant="outline" className={`text-xs ${
                            source.type === "Primary" ? "bg-green-500/10 text-green-500" :
                            source.type === "Secondary" ? "bg-primary/10 text-primary" :
                            "bg-risk-medium/10 text-risk-medium"
                          }`}>
                            {source.type}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Last Updated: {source.lastUpdated}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Reliability Score</span>
                            <span className={`font-medium ${
                              source.reliability >= 90 ? 'text-green-500' :
                              source.reliability >= 80 ? 'text-primary' :
                              'text-risk-medium'
                            }`}>{source.reliability}%</span>
                          </div>
                          <Progress value={source.reliability} className="h-2" />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Coverage: </span>
                          <span className="text-xs text-foreground">{source.coverage}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        <strong className="text-risk-medium">Limitations:</strong> {source.limitations}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Assumptions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileWarning className="w-5 h-5 text-risk-medium" />
                    Key Assumptions & Limitations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {assumptions.map((assumption, index) => (
                      <AccordionItem key={assumption.category} value={`item-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${
                              assumption.impact === "High" ? "bg-risk-high/10 text-risk-high" :
                              assumption.impact === "Medium" ? "bg-risk-medium/10 text-risk-medium" :
                              "bg-risk-low/10 text-risk-low"
                            }`}>
                              {assumption.impact}
                            </Badge>
                            <span className="text-sm font-medium">{assumption.category}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">{assumption.description}</p>
                            <p className="text-xs">
                              <strong className="text-primary">Mitigation:</strong>{" "}
                              <span className="text-muted-foreground">{assumption.mitigation}</span>
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>

            {/* Methodologies */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Methodology Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {methodologies.map((method, index) => (
                      <motion.div
                        key={method.feature}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="p-3 rounded-lg border border-border/50 bg-secondary/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-foreground text-sm">{method.feature}</h5>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">
                            {method.accuracy}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p><strong className="text-foreground">Method:</strong> {method.method}</p>
                          <p><strong className="text-foreground">Validation:</strong> {method.validation}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Confidence Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass-card border-risk-medium/30 bg-risk-medium/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-risk-medium flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Important Disclaimer</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      This platform provides decision-support information based on publicly available data and statistical models. 
                      All forecasts include uncertainty ranges and should not be used as the sole basis for policy decisions. 
                      We recommend:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Cross-validate findings with domain experts before policy implementation</li>
                      <li>Consider confidence intervals when interpreting forecasts</li>
                      <li>Review state-level estimates as directional indicators, not precise measurements</li>
                      <li>Update analyses when new official data becomes available</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Audit Trail */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="glass-card border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Audit-Ready Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Data Dictionary
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    HS Code Mapping
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Model Specifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
