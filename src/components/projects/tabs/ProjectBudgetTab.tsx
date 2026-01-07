import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, DollarSign, PiggyBank } from "lucide-react";

interface ProjectBudgetTabProps {
  projectId: string;
  budget: number | null;
}

export function ProjectBudgetTab({ projectId, budget }: ProjectBudgetTabProps) {
  const { data: expenses } = useQuery({
    queryKey: ["project-expenses-summary", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_expenses")
        .select("amount, category")
        .eq("project_id", projectId);
      if (error) throw error;
      return data;
    },
  });

  const { data: alerts } = useQuery({
    queryKey: ["project-budget-alerts", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_budget_alerts")
        .select("*")
        .eq("project_id", projectId)
        .eq("acknowledged", false)
        .order("threshold_percentage", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const remaining = (budget || 0) - totalExpenses;
  const usagePercent = budget && budget > 0 ? (totalExpenses / budget) * 100 : 0;

  // Group expenses by category
  const expensesByCategory = expenses?.reduce((acc, expense) => {
    const cat = expense.category || "Non catégorisé";
    acc[cat] = (acc[cat] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>) || {};

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-destructive";
    if (percent >= 90) return "bg-orange-500";
    if (percent >= 80) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <div className="space-y-6">
      {/* Alertes budgétaires */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Alerte budgétaire</AlertTitle>
              <AlertDescription>
                Le budget a atteint {alert.threshold_percentage}% d'utilisation.
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Cartes de synthèse */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget alloué</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budget ? new Intl.NumberFormat('fr-FR').format(budget) : "0"} FCFA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépensé</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {new Intl.NumberFormat('fr-FR').format(totalExpenses)} FCFA
            </div>
            <p className="text-xs text-muted-foreground">
              {usagePercent.toFixed(1)}% du budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponible</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : 'text-green-600'}`}>
              {new Intl.NumberFormat('fr-FR').format(remaining)} FCFA
            </div>
            {remaining < 0 && (
              <Badge variant="destructive" className="mt-1">Dépassement</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Barre de progression */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Consommation budgétaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Utilisé</span>
              <span className="font-medium">{usagePercent.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(usagePercent, 100)} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <div className="flex gap-4">
                <span className="text-yellow-600">80%</span>
                <span className="text-orange-600">90%</span>
                <span className="text-destructive">100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Répartition par catégorie */}
      {Object.keys(expensesByCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(expensesByCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => {
                  const percent = budget && budget > 0 ? (amount / budget) * 100 : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('fr-FR').format(amount)} FCFA
                        </span>
                      </div>
                      <Progress value={percent} className="h-2" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}