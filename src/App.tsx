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
import Events from "./pages/Events";
import Partnerships from "./pages/Partnerships";
import Projects from "./pages/Projects";
import Documents from "./pages/Documents";
import Media from "./pages/Media";
import Kpis from "./pages/Kpis";
import MarketDevelopment from "./pages/MarketDevelopment";
import Admin from "./pages/Admin";
import Collaborateurs from "./pages/Collaborateurs";
import Imputations from "./pages/Imputations";
import SuiviEvaluation from "./pages/SuiviEvaluation";
import Chat from "./pages/Chat";
import UserPermissions from "./pages/UserPermissions";
import PendingApproval from "./pages/PendingApproval";
import ActivitiesArchive from "./pages/ActivitiesArchive";
import Achats from "./pages/Achats";
import Support from "./pages/Support";
import RH from "./pages/RH";
import Missions from "./pages/Missions";
import Comptabilite from "./pages/Comptabilite";
import DatabaseExport from "./pages/DatabaseExport";
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
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/database-export" element={<DatabaseExport />} />
            <Route path="/" element={<Dashboard />}>
              <Route index element={<Index />} />
              <Route path="chat" element={<Chat />} />
              <Route path="companies" element={<Companies />} />
              <Route path="trainings" element={<Trainings />} />
              <Route path="events" element={<Events />} />
              <Route path="partnerships" element={<Partnerships />} />
              <Route path="projects" element={<Projects />} />
              <Route path="documents" element={<Documents />} />
              <Route path="media" element={<Media />} />
              <Route path="kpis" element={<Kpis />} />
              <Route path="market-development" element={<MarketDevelopment />} />
              <Route path="imputations" element={<Imputations />} />
              <Route path="suivi-evaluation" element={<SuiviEvaluation />} />
              <Route path="admin" element={<Admin />} />
              <Route path="permissions" element={<UserPermissions />} />
              <Route path="collaborateurs" element={<Collaborateurs />} />
              <Route path="activities-archive" element={<ActivitiesArchive />} />
              <Route path="achats" element={<Achats />} />
              <Route path="support" element={<Support />} />
              <Route path="rh" element={<RH />} />
              <Route path="missions" element={<Missions />} />
              <Route path="comptabilite" element={<Comptabilite />} />
              <Route path="chat" element={<Chat />} />
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
