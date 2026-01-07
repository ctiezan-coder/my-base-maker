import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Download, FileSpreadsheet, FileText, 
  TrendingUp, Calendar, DollarSign, Target 
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProjectReportsTabProps {
  project: any;
}

export function ProjectReportsTab({ project }: ProjectReportsTabProps) {
  const [generating, setGenerating] = useState<string | null>(null);

  const { data: milestones } = useQuery({
    queryKey: ["project-milestones-report", project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_milestones")
        .select("*")
        .eq("project_id", project.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: expenses } = useQuery({
    queryKey: ["project-expenses-report", project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_expenses")
        .select("*")
        .eq("project_id", project.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: risks } = useQuery({
    queryKey: ["project-risks-report", project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_risks")
        .select("*")
        .eq("project_id", project.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: members } = useQuery({
    queryKey: ["project-members-report", project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select(`*, employee:employees(first_name, last_name)`)
        .eq("project_id", project.id);
      if (error) throw error;
      return data;
    },
  });

  // Calculs
  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const completedMilestones = milestones?.filter(m => m.status === "terminé").length || 0;
  const totalMilestones = milestones?.length || 0;
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const budgetUsage = project.budget && project.budget > 0 ? (totalExpenses / project.budget) * 100 : 0;
  const activeRisks = risks?.filter(r => r.status !== "résolu").length || 0;

  const generateReport = async (type: string) => {
    setGenerating(type);
    
    // Simuler la génération (en production, utiliser une edge function)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Créer le contenu du rapport
    let content = "";
    const today = format(new Date(), "dd MMMM yyyy", { locale: fr });
    
    if (type === "status") {
      content = `RAPPORT D'ÉTAT DU PROJET
========================
Projet: ${project.name}
Code: ${project.project_code || "N/A"}
Date: ${today}

RÉSUMÉ
------
Statut: ${project.status}
Avancement: ${project.progress_percentage || 0}%
Chef de projet: ${project.manager?.first_name || "Non assigné"} ${project.manager?.last_name || ""}

JALONS
------
Terminés: ${completedMilestones}/${totalMilestones} (${milestoneProgress.toFixed(0)}%)

BUDGET
------
Alloué: ${project.budget ? new Intl.NumberFormat('fr-FR').format(project.budget) : "0"} FCFA
Dépensé: ${new Intl.NumberFormat('fr-FR').format(totalExpenses)} FCFA
Utilisation: ${budgetUsage.toFixed(1)}%

RISQUES
-------
Risques actifs: ${activeRisks}

ÉQUIPE
------
Membres: ${members?.length || 0}
`;
    } else if (type === "financial") {
      content = `RAPPORT FINANCIER
=================
Projet: ${project.name}
Date: ${today}

SYNTHÈSE BUDGÉTAIRE
-------------------
Budget alloué: ${project.budget ? new Intl.NumberFormat('fr-FR').format(project.budget) : "0"} FCFA
Total dépensé: ${new Intl.NumberFormat('fr-FR').format(totalExpenses)} FCFA
Solde disponible: ${new Intl.NumberFormat('fr-FR').format((project.budget || 0) - totalExpenses)} FCFA

DÉTAIL DES DÉPENSES
-------------------
${expenses?.map(e => `- ${e.description}: ${new Intl.NumberFormat('fr-FR').format(e.amount)} FCFA (${format(new Date(e.expense_date), "dd/MM/yyyy")})`).join("\n") || "Aucune dépense"}
`;
    } else if (type === "variance") {
      const plannedStart = project.start_date ? new Date(project.start_date) : null;
      const actualStart = project.actual_start_date ? new Date(project.actual_start_date) : null;
      const plannedEnd = project.end_date ? new Date(project.end_date) : null;
      const actualEnd = project.actual_end_date ? new Date(project.actual_end_date) : null;
      
      content = `RAPPORT D'ÉCART
===============
Projet: ${project.name}
Date: ${today}

ÉCART PLANNING
--------------
Date début prévue: ${plannedStart ? format(plannedStart, "dd/MM/yyyy") : "N/A"}
Date début réelle: ${actualStart ? format(actualStart, "dd/MM/yyyy") : "N/A"}

Date fin prévue: ${plannedEnd ? format(plannedEnd, "dd/MM/yyyy") : "N/A"}
Date fin réelle: ${actualEnd ? format(actualEnd, "dd/MM/yyyy") : "N/A"}

ÉCART BUDGET
------------
Budget prévu: ${project.budget ? new Intl.NumberFormat('fr-FR').format(project.budget) : "0"} FCFA
Dépenses réelles: ${new Intl.NumberFormat('fr-FR').format(totalExpenses)} FCFA
Écart: ${new Intl.NumberFormat('fr-FR').format((project.budget || 0) - totalExpenses)} FCFA

ÉCART JALONS
------------
Jalons prévus: ${totalMilestones}
Jalons terminés: ${completedMilestones}
`;
    }
    
    // Télécharger le fichier
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-${type}-${project.project_code || project.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setGenerating(null);
  };

  return (
    <div className="space-y-6">
      {/* Indicateurs clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Avancement</span>
            </div>
            <div className="text-2xl font-bold mt-1">{project.progress_percentage || 0}%</div>
            <Progress value={project.progress_percentage || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Jalons</span>
            </div>
            <div className="text-2xl font-bold mt-1">{completedMilestones}/{totalMilestones}</div>
            <Progress value={milestoneProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Budget</span>
            </div>
            <div className="text-2xl font-bold mt-1">{budgetUsage.toFixed(0)}%</div>
            <Progress 
              value={Math.min(budgetUsage, 100)} 
              className={`h-2 mt-2 ${budgetUsage > 100 ? '[&>div]:bg-destructive' : ''}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Statut</span>
            </div>
            <Badge className="mt-2" variant={project.status === "terminé" ? "outline" : "default"}>
              {project.status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Types de rapports */}
      <Card>
        <CardHeader>
          <CardTitle>Générer un rapport</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 justify-start"
              onClick={() => generateReport("status")}
              disabled={!!generating}
            >
              <FileText className="h-8 w-8 mr-4 text-primary" />
              <div className="text-left">
                <div className="font-medium">Rapport d'état</div>
                <div className="text-sm text-muted-foreground">
                  Vue d'ensemble du projet
                </div>
              </div>
              {generating === "status" && <span className="ml-auto animate-spin">⏳</span>}
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 justify-start"
              onClick={() => generateReport("financial")}
              disabled={!!generating}
            >
              <FileSpreadsheet className="h-8 w-8 mr-4 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Rapport financier</div>
                <div className="text-sm text-muted-foreground">
                  Détail des dépenses
                </div>
              </div>
              {generating === "financial" && <span className="ml-auto animate-spin">⏳</span>}
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 justify-start"
              onClick={() => generateReport("variance")}
              disabled={!!generating}
            >
              <TrendingUp className="h-8 w-8 mr-4 text-orange-600" />
              <div className="text-left">
                <div className="font-medium">Rapport d'écart</div>
                <div className="text-sm text-muted-foreground">
                  Planning vs Réalisé
                </div>
              </div>
              {generating === "variance" && <span className="ml-auto animate-spin">⏳</span>}
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 justify-start opacity-50 cursor-not-allowed"
              disabled
            >
              <Download className="h-8 w-8 mr-4 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">Export complet (PDF)</div>
                <div className="text-sm text-muted-foreground">
                  Bientôt disponible
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}