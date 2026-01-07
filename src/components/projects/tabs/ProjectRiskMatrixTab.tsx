import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectRiskMatrixTabProps {
  projectId: string;
}

const probabilityOrder = ["Faible", "Moyenne", "Haute"];
const impactOrder = ["Faible", "Moyen", "Élevé"];

const getRiskColor = (probability: string, impact: string): string => {
  const pIndex = probabilityOrder.indexOf(probability);
  const iIndex = impactOrder.indexOf(impact);
  
  if (pIndex === -1 || iIndex === -1) return "bg-muted";
  
  const score = pIndex + iIndex;
  if (score >= 4) return "bg-red-500";
  if (score >= 3) return "bg-orange-500";
  if (score >= 2) return "bg-yellow-500";
  return "bg-green-500";
};

export function ProjectRiskMatrixTab({ projectId }: ProjectRiskMatrixTabProps) {
  const { data: risks } = useQuery({
    queryKey: ["project-risks-matrix", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_risks")
        .select("*")
        .eq("project_id", projectId)
        .neq("status", "résolu");
      if (error) throw error;
      return data;
    },
  });

  // Group risks by probability and impact
  const riskMatrix: Record<string, Record<string, any[]>> = {};
  
  probabilityOrder.forEach(prob => {
    riskMatrix[prob] = {};
    impactOrder.forEach(imp => {
      riskMatrix[prob][imp] = [];
    });
  });

  risks?.forEach(risk => {
    const prob = risk.probability?.charAt(0).toUpperCase() + risk.probability?.slice(1).toLowerCase();
    const imp = risk.impact?.charAt(0).toUpperCase() + risk.impact?.slice(1).toLowerCase();
    
    // Normalize values
    const probNorm = prob === "Élevé" || prob === "Haute" ? "Haute" : 
                     prob === "Moyen" || prob === "Moyenne" ? "Moyenne" : "Faible";
    const impNorm = imp === "Élevé" ? "Élevé" : 
                    imp === "Moyen" || imp === "Moyenne" ? "Moyen" : "Faible";
    
    if (riskMatrix[probNorm] && riskMatrix[probNorm][impNorm]) {
      riskMatrix[probNorm][impNorm].push(risk);
    }
  });

  const totalRisks = risks?.length || 0;
  const criticalRisks = risks?.filter(r => r.risk_level === "Critique" || r.risk_level === "Élevé").length || 0;

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalRisks}</div>
            <p className="text-sm text-muted-foreground">Risques identifiés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{criticalRisks}</div>
            <p className="text-sm text-muted-foreground">Risques critiques</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{totalRisks - criticalRisks}</div>
            <p className="text-sm text-muted-foreground">Risques acceptables</p>
          </CardContent>
        </Card>
      </div>

      {/* Matrice des risques */}
      <Card>
        <CardHeader>
          <CardTitle>Matrice des risques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border bg-muted"></th>
                  {impactOrder.map(impact => (
                    <th key={impact} className="p-2 border bg-muted text-center font-medium">
                      Impact {impact}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...probabilityOrder].reverse().map(probability => (
                  <tr key={probability}>
                    <td className="p-2 border bg-muted font-medium whitespace-nowrap">
                      Prob. {probability}
                    </td>
                    {impactOrder.map(impact => {
                      const cellRisks = riskMatrix[probability][impact];
                      const bgColor = getRiskColor(probability, impact);
                      
                      return (
                        <td 
                          key={`${probability}-${impact}`} 
                          className={`p-2 border min-w-[120px] min-h-[80px] align-top ${bgColor} bg-opacity-20`}
                        >
                          {cellRisks.length > 0 ? (
                            <div className="space-y-1">
                              {cellRisks.map(risk => (
                                <Badge 
                                  key={risk.id} 
                                  variant="outline" 
                                  className="text-xs block truncate max-w-full"
                                  title={risk.name}
                                >
                                  {risk.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Légende */}
          <div className="flex gap-4 mt-4 justify-center text-sm">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-500 bg-opacity-50"></div>
              <span>Faible</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-yellow-500 bg-opacity-50"></div>
              <span>Moyen</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-orange-500 bg-opacity-50"></div>
              <span>Élevé</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-500 bg-opacity-50"></div>
              <span>Critique</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}