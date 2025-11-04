import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Companies from "./pages/Companies";
import Trainings from "./pages/Trainings";
import Trainers from "./pages/Trainers";
import Events from "./pages/Events";
import Partnerships from "./pages/Partnerships";
import Projects from "./pages/Projects";
import Documents from "./pages/Documents";
import Media from "./pages/Media";
import Kpis from "./pages/Kpis";
import MarketDevelopment from "./pages/MarketDevelopment";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Dashboard />}>
              <Route index element={<Index />} />
              <Route path="companies" element={<Companies />} />
              <Route path="trainings" element={<Trainings />} />
              <Route path="trainers" element={<Trainers />} />
              <Route path="events" element={<Events />} />
              <Route path="partnerships" element={<Partnerships />} />
              <Route path="projects" element={<Projects />} />
              <Route path="documents" element={<Documents />} />
              <Route path="media" element={<Media />} />
              <Route path="kpis" element={<Kpis />} />
              <Route path="market-development" element={<MarketDevelopment />} />
              <Route path="admin" element={<Admin />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
