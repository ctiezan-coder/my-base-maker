import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, Flag, FileText, MessageSquare, History, 
  AlertTriangle, BarChart3, FileCheck, DollarSign, Pencil
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProjectDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
  onEdit: () => void;
  canManage: boolean;
}

const statusColors: Record<string, string> = {
  "planifié": "secondary",
  "en cours": "default",
  "terminé": "outline",
  "suspendu": "destructive",
};

export function ProjectDetailsDialog({ 
  open, 
  onOpenChange, 
  project, 
  onEdit,
  canManage 
}: ProjectDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("team");

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold">{project.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={statusColors[project.status] as any || "default"}>
                  {project.status}
                </Badge>
                {project.start_date && (
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(project.start_date), "dd MMM yyyy", { locale: fr })}
                    {project.end_date && ` - ${format(new Date(project.end_date), "dd MMM yyyy", { locale: fr })}`}
                  </span>
                )}
                {project.budget && (
                  <span className="text-sm font-mono">
                    {new Intl.NumberFormat('fr-FR').format(project.budget)} FCFA
                  </span>
                )}
              </div>
            </div>
            {canManage && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="flex-shrink-0 grid grid-cols-9 w-full">
            <TabsTrigger value="team" className="flex items-center gap-1 text-xs">
              <Users className="w-3 h-3" />
              <span className="hidden sm:inline">Équipe</span>
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center gap-1 text-xs">
              <Flag className="w-3 h-3" />
              <span className="hidden sm:inline">Jalons</span>
            </TabsTrigger>
            <TabsTrigger value="deliverables" className="flex items-center gap-1 text-xs">
              <FileCheck className="w-3 h-3" />
              <span className="hidden sm:inline">Livrables</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-1 text-xs">
              <DollarSign className="w-3 h-3" />
              <span className="hidden sm:inline">Dépenses</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1 text-xs">
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-1 text-xs">
              <MessageSquare className="w-3 h-3" />
              <span className="hidden sm:inline">Commentaires</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 text-xs">
              <History className="w-3 h-3" />
              <span className="hidden sm:inline">Historique</span>
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-1 text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span className="hidden sm:inline">Risques</span>
            </TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center gap-1 text-xs">
              <BarChart3 className="w-3 h-3" />
              <span className="hidden sm:inline">KPIs</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="team" className="mt-0">
              <ProjectTeamTab projectId={project.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="milestones" className="mt-0">
              <ProjectMilestonesTab projectId={project.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="deliverables" className="mt-0">
              <ProjectDeliverablesTab projectId={project.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="expenses" className="mt-0">
              <ProjectExpensesTab projectId={project.id} budget={project.budget} canManage={canManage} />
            </TabsContent>
            <TabsContent value="documents" className="mt-0">
              <ProjectDocumentsTab projectId={project.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="comments" className="mt-0">
              <ProjectCommentsTab projectId={project.id} />
            </TabsContent>
            <TabsContent value="history" className="mt-0">
              <ProjectHistoryTab projectId={project.id} />
            </TabsContent>
            <TabsContent value="risks" className="mt-0">
              <ProjectRisksTab projectId={project.id} canManage={canManage} />
            </TabsContent>
            <TabsContent value="kpis" className="mt-0">
              <ProjectKpisTab projectId={project.id} canManage={canManage} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
