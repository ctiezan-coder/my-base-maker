import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  TrendingUp, 
  Target, 
  Users, 
  Wallet, 
  Activity,
  FileText,
  Download
} from "lucide-react";

interface PartnershipEvaluationTabProps {
  partnership: any;
  canManage: boolean;
}

export function PartnershipEvaluationTab({ partnership, canManage }: PartnershipEvaluationTabProps) {
  const [satisfactionLevel, setSatisfactionLevel] = useState(partnership.satisfaction_level || 0);
  const [efficiencyScore, setEfficiencyScore] = useState(partnership.efficiency_score || 0);
  const [midTermEvaluation, setMidTermEvaluation] = useState(partnership.mid_term_evaluation || "");
  const [finalEvaluation, setFinalEvaluation] = useState(partnership.final_evaluation || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch activities count
  const { data: activitiesData } = useQuery({
    queryKey: ["partnership-activities-stats", partnership.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_activities")
        .select("status")
        .eq("partnership_id", partnership.id);
      if (error) throw error;
      return {
        total: data.length,
        completed: data.filter(a => a.status === "terminée").length,
        planned: data.filter(a => a.status === "planifiée").length
      };
    },
  });

  // Fetch finances summary
  const { data: financesData } = useQuery({
    queryKey: ["partnership-finances-stats", partnership.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_finances")
        .select("transaction_type, amount")
        .eq("partnership_id", partnership.id);
      if (error) throw error;
      const spent = data
        .filter(t => t.transaction_type === "decaissement")
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return { spent };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("partnerships")
        .update(data)
        .eq("id", partnership.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
      toast({ title: "Évaluation mise à jour" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      satisfaction_level: satisfactionLevel,
      efficiency_score: efficiencyScore,
      mid_term_evaluation: midTermEvaluation,
      final_evaluation: finalEvaluation
    });
  };

  const totalBudget = (partnership.budget || 0) + (partnership.partner_contribution || 0);
  const budgetUsage = totalBudget > 0 ? ((financesData?.spent || 0) / totalBudget) * 100 : 0;
  const activityCompletion = activitiesData?.total 
    ? (activitiesData.completed / activitiesData.total) * 100 
    : 0;

  const generateReport = () => {
    const report = `
RAPPORT D'ÉVALUATION DU PARTENARIAT
====================================

Partenaire: ${partnership.partner_name}
Référence: ${partnership.reference_code || "N/A"}
Statut: ${partnership.status}
Direction: ${partnership.direction_id}

PÉRIODE
-------
Début: ${partnership.start_date || "Non défini"}
Fin: ${partnership.end_date || "Non défini"}

INDICATEURS DE PERFORMANCE
--------------------------
Niveau de satisfaction: ${satisfactionLevel}/100
Score d'efficacité: ${efficiencyScore}/100
Taux d'achèvement des activités: ${activityCompletion.toFixed(1)}%
Utilisation du budget: ${budgetUsage.toFixed(1)}%

ACTIVITÉS
---------
Total planifiées: ${activitiesData?.total || 0}
Terminées: ${activitiesData?.completed || 0}
En attente: ${activitiesData?.planned || 0}

ASPECTS FINANCIERS
------------------
Budget total: ${new Intl.NumberFormat("fr-FR").format(totalBudget)} FCFA
Dépensé: ${new Intl.NumberFormat("fr-FR").format(financesData?.spent || 0)} FCFA

ÉVALUATIONS
-----------
Évaluation mi-parcours:
${midTermEvaluation || "Non renseignée"}

Évaluation finale:
${finalEvaluation || "Non renseignée"}

Généré le: ${new Date().toLocaleDateString("fr-FR")}
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation_${partnership.partner_name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 mt-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{satisfactionLevel}%</div>
            <Progress value={satisfactionLevel} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Efficacité
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{efficiencyScore}%</div>
            <Progress value={efficiencyScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Activités
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">
              {activitiesData?.completed || 0}/{activitiesData?.total || 0}
            </div>
            <Progress value={activityCompletion} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4 text-purple-500" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{budgetUsage.toFixed(0)}%</div>
            <Progress value={budgetUsage} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Evaluation Scores */}
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scores d'évaluation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Niveau de satisfaction
                </Label>
                <span className="font-medium">{satisfactionLevel}%</span>
              </div>
              <Slider
                value={[satisfactionLevel]}
                onValueChange={(v) => setSatisfactionLevel(v[0])}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Score d'efficacité
                </Label>
                <span className="font-medium">{efficiencyScore}%</span>
              </div>
              <Slider
                value={[efficiencyScore]}
                onValueChange={(v) => setEfficiencyScore(v[0])}
                max={100}
                step={5}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluations Text */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Évaluation mi-parcours</CardTitle>
          </CardHeader>
          <CardContent>
            {canManage ? (
              <Textarea
                value={midTermEvaluation}
                onChange={(e) => setMidTermEvaluation(e.target.value)}
                rows={6}
                placeholder="Observations et recommandations à mi-parcours..."
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {midTermEvaluation || "Non renseignée"}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Évaluation finale</CardTitle>
          </CardHeader>
          <CardContent>
            {canManage ? (
              <Textarea
                value={finalEvaluation}
                onChange={(e) => setFinalEvaluation(e.target.value)}
                rows={6}
                placeholder="Bilan final du partenariat..."
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {finalEvaluation || "Non renseignée"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={generateReport}>
          <Download className="w-4 h-4 mr-2" />
          Exporter le rapport
        </Button>
        
        {canManage && (
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            Enregistrer l'évaluation
          </Button>
        )}
      </div>
    </div>
  );
}
