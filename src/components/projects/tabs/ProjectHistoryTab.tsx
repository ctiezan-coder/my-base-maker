import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Plus, Edit, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProjectHistoryTabProps {
  projectId: string;
}

const actionIcons: Record<string, any> = {
  création: Plus,
  modification: Edit,
  statut_changé: RefreshCw,
};

const actionColors: Record<string, string> = {
  création: "default",
  modification: "secondary",
  statut_changé: "outline",
};

export function ProjectHistoryTab({ projectId }: ProjectHistoryTabProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ["project-history", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_history")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>;
  }

  const getActionDescription = (entry: any) => {
    const details = entry.details as Record<string, any>;
    switch (entry.action) {
      case "création":
        return `Projet créé: "${details?.name || 'Sans nom'}"`;
      case "modification":
        return `Projet modifié`;
      case "statut_changé":
        return `Statut changé de "${details?.ancien}" à "${details?.nouveau}"`;
      default:
        return entry.action;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Historique du projet</h3>

      {history?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun historique disponible
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {history?.map((entry, index) => {
              const ActionIcon = actionIcons[entry.action] || History;
              return (
                <div key={entry.id} className="relative flex items-start gap-4 pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  
                  <Card className="flex-1">
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <ActionIcon className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">{getActionDescription(entry)}</p>
                            <p className="text-sm text-muted-foreground">
                              par Système
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={actionColors[entry.action] as any}>{entry.action}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(entry.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
