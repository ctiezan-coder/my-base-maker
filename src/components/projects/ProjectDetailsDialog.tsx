import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Flag, FileText, MessageSquare, History, 
  AlertTriangle, BarChart3, FileCheck, DollarSign, Pencil,
  Grid3X3, FileBarChart, Calendar
} from "lucide-react";
import { ProjectTeamTab } from "./tabs/ProjectTeamTab";
import { ProjectMilestonesTab } from "./tabs/ProjectMilestonesTab";
import { ProjectDeliverablesTab } from "./tabs/ProjectDeliverablesTab";
import { ProjectExpensesTab } from "./tabs/ProjectExpensesTab";
import { ProjectDocumentsTab } from "./tabs/ProjectDocumentsTab";
import { ProjectCommentsTab } from "./tabs/ProjectCommentsTab";
import { ProjectHistoryTab } from "./tabs/ProjectHistoryTab";
import { ProjectRisksTab } from "./tabs/ProjectRisksTab";
import { ProjectKpisTab } from "./tabs/ProjectKpisTab";
import { ProjectBudgetTab } from "./tabs/ProjectBudgetTab";
import { ProjectRiskMatrixTab } from "./tabs/ProjectRiskMatrixTab";
import { ProjectReportsTab } from "./tabs/ProjectReportsTab";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProjectDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
  onEdit?: () => void;
  canManage?: boolean;
}

const statusColors: Record<string, string> = {
  "planifié": "secondary",
  "en cours": "default",
  "terminé": "outline",
  "suspendu": "destructive",
  "annulé": "destructive",
};

const priorityLabels: Record<string, { label: string; variant: string }> = {
  "1": { label: "Haute", variant: "destructive" },
  "2": { label: "Moyenne", variant: "default" },
  "3": { label: "Basse", variant: "secondary" },
};

export function ProjectDetailsDialog({ 
  open, 
  onOpenChange, 
  project, 
  onEdit,
  canManage = true 
}: ProjectDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!project) return null;

  const priority = priorityLabels[project.priority_level] || { label: "Moyenne", variant: "default" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl flex items-center gap-2">
                {project.name}
                {project.project_code && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {project.project_code}
                  </Badge>
                )}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {project.start_date && format(new Date(project.start_date), "dd MMM yyyy", { locale: fr })}
                {project.end_date && ` - ${format(new Date(project.end_date), "dd MMM yyyy", { locale: fr })}`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusColors[project.status] as any}>
                {project.status}
              </Badge>
              <Badge variant={priority.variant as any}>
                Priorité {priority.label}
              </Badge>
              {canManage && onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              )}
            </div>
          </div>
          
          {/* Barre d'avancement */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Avancement global</span>
              <span className="font-medium">{project.progress_percentage || 0}%</span>
            </div>
            <Progress value={project.progress_percentage || 0} className="h-2" />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid grid-cols-6 lg:grid-cols-12 h-auto gap-1 p-1">
              <TabsTrigger value="overview" className="text-xs px-2">
                <BarChart3 className="w-3 h-3 mr-1" />
                Vue
              </TabsTrigger>
              <TabsTrigger value="team" className="text-xs px-2">
                <Users className="w-3 h-3 mr-1" />
                Équipe
              </TabsTrigger>
              <TabsTrigger value="milestones" className="text-xs px-2">
                <Flag className="w-3 h-3 mr-1" />
                Jalons
              </TabsTrigger>
              <TabsTrigger value="deliverables" className="text-xs px-2">
                <FileCheck className="w-3 h-3 mr-1" />
                Livrables
              </TabsTrigger>
              <TabsTrigger value="budget" className="text-xs px-2">
                <DollarSign className="w-3 h-3 mr-1" />
                Budget
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs px-2">
                <DollarSign className="w-3 h-3 mr-1" />
                Dépenses
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs px-2">
                <FileText className="w-3 h-3 mr-1" />
                Docs
              </TabsTrigger>
              <TabsTrigger value="risks" className="text-xs px-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Risques
              </TabsTrigger>
              <TabsTrigger value="riskmatrix" className="text-xs px-2">
                <Grid3X3 className="w-3 h-3 mr-1" />
                Matrice
              </TabsTrigger>
              <TabsTrigger value="comments" className="text-xs px-2">
                <MessageSquare className="w-3 h-3 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs px-2">
                <History className="w-3 h-3 mr-1" />
                Historique
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-xs px-2">
                <FileBarChart className="w-3 h-3 mr-1" />
                Rapports
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4 pr-2">
              <TabsContent value="overview" className="mt-0 h-full">
                <ProjectKpisTab projectId={project.id} canManage={canManage} />
              </TabsContent>
              
              <TabsContent value="team" className="mt-0 h-full">
                <ProjectTeamTab projectId={project.id} canManage={canManage} />
              </TabsContent>

              <TabsContent value="milestones" className="mt-0 h-full">
                <ProjectMilestonesTab projectId={project.id} canManage={canManage} />
              </TabsContent>

              <TabsContent value="deliverables" className="mt-0 h-full">
                <ProjectDeliverablesTab projectId={project.id} canManage={canManage} />
              </TabsContent>

              <TabsContent value="budget" className="mt-0 h-full">
                <ProjectBudgetTab projectId={project.id} budget={project.budget} />
              </TabsContent>

              <TabsContent value="expenses" className="mt-0 h-full">
                <ProjectExpensesTab projectId={project.id} budget={project.budget} canManage={canManage} />
              </TabsContent>

              <TabsContent value="documents" className="mt-0 h-full">
                <ProjectDocumentsTab projectId={project.id} canManage={canManage} />
              </TabsContent>

              <TabsContent value="risks" className="mt-0 h-full">
                <ProjectRisksTab projectId={project.id} canManage={canManage} />
              </TabsContent>

              <TabsContent value="riskmatrix" className="mt-0 h-full">
                <ProjectRiskMatrixTab projectId={project.id} />
              </TabsContent>

              <TabsContent value="comments" className="mt-0 h-full">
                <ProjectCommentsTab projectId={project.id} />
              </TabsContent>

              <TabsContent value="history" className="mt-0 h-full">
                <ProjectHistoryTab projectId={project.id} />
              </TabsContent>

              <TabsContent value="reports" className="mt-0 h-full">
                <ProjectReportsTab project={project} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}