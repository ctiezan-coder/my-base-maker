import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Companies from "./pages/Companies";
import Trainings from "./pages/Trainings";
import Events from "./pages/Events";
import Agenda from "./pages/Agenda";
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
import Budgets from "./pages/Budgets";
import DatabaseExport from "./pages/DatabaseExport";
import NotFound from "./pages/NotFound";
import Trainers from "./pages/Trainers";
import PmeRegistration from "./pages/PmeRegistration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<PmeRegistration />} />
            <Route path="/pme-registration" element={<PmeRegistration />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/database-export" element={<DatabaseExport />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Index />} />
              <Route path="chat" element={<Chat />} />
              <Route path="companies" element={<Companies />} />
              <Route path="trainings" element={<Trainings />} />
              <Route path="events" element={<Events />} />
              <Route path="agenda" element={<Agenda />} />
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
              <Route path="budgets" element={<Budgets />} />
              <Route path="comptabilite" element={<Comptabilite />} />
              <Route path="trainers" element={<Trainers />} />
            </Route>
            {/* Redirects for old routes */}
            <Route path="/trainings" element={<Navigate to="/dashboard/trainings" replace />} />
            <Route path="/companies" element={<Navigate to="/dashboard/companies" replace />} />
            <Route path="/events" element={<Navigate to="/dashboard/events" replace />} />
            <Route path="/projects" element={<Navigate to="/dashboard/projects" replace />} />
            <Route path="/chat" element={<Navigate to="/dashboard/chat" replace />} />
            <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/missions" element={<Navigate to="/dashboard/missions" replace />} />
            <Route path="/trainers" element={<Navigate to="/dashboard/trainers" replace />} />
            <Route path="/partnerships" element={<Navigate to="/dashboard/partnerships" replace />} />
            <Route path="/documents" element={<Navigate to="/dashboard/documents" replace />} />
            <Route path="/media" element={<Navigate to="/dashboard/media" replace />} />
            <Route path="/kpis" element={<Navigate to="/dashboard/kpis" replace />} />
            <Route path="/rh" element={<Navigate to="/dashboard/rh" replace />} />
            <Route path="/budgets" element={<Navigate to="/dashboard/budgets" replace />} />
            <Route path="/comptabilite" element={<Navigate to="/dashboard/comptabilite" replace />} />
            <Route path="/support" element={<Navigate to="/dashboard/support" replace />} />
            <Route path="/achats" element={<Navigate to="/dashboard/achats" replace />} />
            <Route path="/imputations" element={<Navigate to="/dashboard/imputations" replace />} />
            <Route path="/suivi-evaluation" element={<Navigate to="/dashboard/suivi-evaluation" replace />} />
            <Route path="/collaborateurs" element={<Navigate to="/dashboard/collaborateurs" replace />} />
            <Route path="/agenda" element={<Navigate to="/dashboard/agenda" replace />} />
            <Route path="/market-development" element={<Navigate to="/dashboard/market-development" replace />} />
            <Route path="/permissions" element={<Navigate to="/dashboard/permissions" replace />} />
            <Route path="/activities-archive" element={<Navigate to="/dashboard/activities-archive" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
