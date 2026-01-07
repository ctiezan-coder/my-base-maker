import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Target, ClipboardList, Star, TrendingDown, DollarSign, LayoutDashboard, FileText, Bell, Scale, FileCheck } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";

// Import tab components
import { ConsolidatedDashboardTab } from "@/components/suivi/ConsolidatedDashboardTab";
import { ImputationsTrackingTab } from "@/components/suivi/ImputationsTrackingTab";
import { ObjectivesTab } from "@/components/suivi/ObjectivesTab";
import { ActionPlansTab } from "@/components/suivi/ActionPlansTab";
import { SatisfactionSurveysTab } from "@/components/suivi/SatisfactionSurveysTab";
import { GapAnalysisTab } from "@/components/suivi/GapAnalysisTab";
import { ROIAnalysisTab } from "@/components/suivi/ROIAnalysisTab";
import { EvaluationReportsTab } from "@/components/suivi/EvaluationReportsTab";
import { MonitoringAlertsTab } from "@/components/suivi/MonitoringAlertsTab";
import { BenchmarkingTab } from "@/components/suivi/BenchmarkingTab";

export default function SuiviEvaluation() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: userRole } = useUserRole();
  const { canAccess: canManage } = useCanAccessModule("suivi_evaluation", "manager");
  const isAdmin = userRole === "admin";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          Suivi et Évaluation
        </h1>
        <p className="text-muted-foreground">
          Tableau de bord consolidé, objectifs stratégiques et analyse de performance
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap gap-2 h-auto p-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Tableau de bord</span>
          </TabsTrigger>
          <TabsTrigger value="imputations" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Imputations</span>
          </TabsTrigger>
          <TabsTrigger value="objectives" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Objectifs</span>
          </TabsTrigger>
          <TabsTrigger value="action-plans" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Plans d'action</span>
          </TabsTrigger>
          <TabsTrigger value="surveys" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Satisfaction</span>
          </TabsTrigger>
          <TabsTrigger value="gap-analysis" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Écarts</span>
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">ROI</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Rapports</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alertes</span>
          </TabsTrigger>
          <TabsTrigger value="benchmarking" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Benchmarking</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ConsolidatedDashboardTab />
        </TabsContent>

        <TabsContent value="imputations">
          <ImputationsTrackingTab />
        </TabsContent>

        <TabsContent value="objectives">
          <ObjectivesTab canManage={canManage || isAdmin} />
        </TabsContent>

        <TabsContent value="action-plans">
          <ActionPlansTab canManage={canManage || isAdmin} />
        </TabsContent>

        <TabsContent value="surveys">
          <SatisfactionSurveysTab canManage={canManage || isAdmin} />
        </TabsContent>

        <TabsContent value="gap-analysis">
          <GapAnalysisTab canManage={canManage || isAdmin} />
        </TabsContent>

        <TabsContent value="roi">
          <ROIAnalysisTab canManage={canManage || isAdmin} />
        </TabsContent>

        <TabsContent value="reports">
          <EvaluationReportsTab canManage={canManage || isAdmin} />
        </TabsContent>

        <TabsContent value="alerts">
          <MonitoringAlertsTab canManage={canManage || isAdmin} />
        </TabsContent>

        <TabsContent value="benchmarking">
          <BenchmarkingTab canManage={canManage || isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
