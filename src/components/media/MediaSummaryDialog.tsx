import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  FileImage,
  Building2
} from "lucide-react";

interface MediaSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StatusCount {
  statut_workflow: string | null;
  count: number;
}

interface DirectionCount {
  direction_id: string;
  direction_name: string;
  count: number;
}

export function MediaSummaryDialog({ open, onOpenChange }: MediaSummaryDialogProps) {
  // Récupérer les statistiques par statut
  const { data: statusStats, isLoading: loadingStatus } = useQuery({
    queryKey: ["media-status-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_content")
        .select("statut_workflow");
      
      if (error) throw error;
      
      const counts: Record<string, number> = {
        "Demande": 0,
        "En cours": 0,
        "Validé": 0,
        "Livré": 0,
        "Annulé": 0,
      };
      
      data?.forEach((item) => {
        const status = item.statut_workflow || "Demande";
        counts[status] = (counts[status] || 0) + 1;
      });
      
      return counts;
    },
    enabled: open,
  });

  // Récupérer les statistiques par direction
  const { data: directionStats, isLoading: loadingDirection } = useQuery({
    queryKey: ["media-direction-stats"],
    queryFn: async () => {
      const { data: media, error: mediaError } = await supabase
        .from("media_content")
        .select("direction_id");
      
      if (mediaError) throw mediaError;
      
      const { data: directions, error: dirError } = await supabase
        .from("directions")
        .select("id, name");
      
      if (dirError) throw dirError;
      
      const directionMap = new Map(directions?.map(d => [d.id, d.name]));
      const counts: Record<string, { name: string; count: number }> = {};
      
      media?.forEach((item) => {
        if (item.direction_id) {
          if (!counts[item.direction_id]) {
            counts[item.direction_id] = {
              name: directionMap.get(item.direction_id) || "Inconnu",
              count: 0,
            };
          }
          counts[item.direction_id].count++;
        }
      });
      
      return Object.values(counts).sort((a, b) => b.count - a.count);
    },
    enabled: open,
  });

  // Récupérer le total
  const { data: totalCount } = useQuery({
    queryKey: ["media-total-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("media_content")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
    enabled: open,
  });

  const isLoading = loadingStatus || loadingDirection;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Demande":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "En cours":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "Validé":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "Livré":
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "Annulé":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <FileImage className="w-4 h-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Livré":
        return "default";
      case "Validé":
        return "outline";
      case "En cours":
        return "secondary";
      case "Annulé":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Résumé des Médias - Service Communication
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Total */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileImage className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total des demandes</p>
                      <p className="text-3xl font-bold">{totalCount}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques par statut */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Par statut
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {statusStats && Object.entries(statusStats).map(([status, count]) => (
                  <Card key={status} className="text-center">
                    <CardContent className="py-3">
                      <div className="flex flex-col items-center gap-1">
                        {getStatusIcon(status)}
                        <Badge variant={getStatusBadgeVariant(status)} className="mt-1">
                          {status}
                        </Badge>
                        <p className="text-2xl font-bold mt-1">{count}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Statistiques par direction */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Par direction
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {directionStats && directionStats.length > 0 ? (
                  directionStats.map((dir, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm font-medium">{dir.name}</span>
                      <Badge variant="secondary">{dir.count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune donnée disponible
                  </p>
                )}
              </div>
            </div>

            {/* Taux de traitement */}
            {statusStats && (
              <Card className="bg-muted/30">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Taux de livraison</span>
                    <span className="text-lg font-bold text-primary">
                      {totalCount && totalCount > 0
                        ? Math.round((statusStats["Livré"] / totalCount) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{
                        width: `${totalCount && totalCount > 0
                          ? (statusStats["Livré"] / totalCount) * 100
                          : 0}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
