import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EximAnalysis from "./pages/EximAnalysis";
import Forecast from "./pages/Forecast";
import RiskIndex from "./pages/RiskIndex";
import TrendAnalysis from "./pages/TrendAnalysis";
import StateMineralMap from "./pages/StateMineralMap";
import ScenarioAnalysis from "./pages/ScenarioAnalysis";
import AnovaAnalysis from "./pages/AnovaAnalysis";
import DataTransparency from "./pages/DataTransparency";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/exim" element={<EximAnalysis />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/risk" element={<RiskIndex />} />
          <Route path="/trends" element={<TrendAnalysis />} />
          <Route path="/states" element={<StateMineralMap />} />
          <Route path="/scenario" element={<ScenarioAnalysis />} />
          <Route path="/anova" element={<AnovaAnalysis />} />
          <Route path="/transparency" element={<DataTransparency />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
