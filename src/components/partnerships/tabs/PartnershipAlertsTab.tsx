import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, AlertTriangle, Calendar, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PartnershipAlertsTabProps {
  partnershipId: string;
  canManage: boolean;
}

const alertTypeLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  "expiry_6_months": { label: "Échéance 6 mois", variant: "secondary" },
  "expiry_3_months": { label: "Échéance 3 mois", variant: "default" },
  "expiry_1_month": { label: "Échéance 1 mois", variant: "destructive" },
  "status_change": { label: "Changement de statut", variant: "outline" },
  "inactivity": { label: "Inactivité", variant: "secondary" },
  "meeting_reminder": { label: "Rappel réunion", variant: "default" }
};

export function PartnershipAlertsTab({ partnershipId, canManage }: PartnershipAlertsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["partnership-alerts", partnershipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_alerts")
        .select("*")
        .eq("partnership_id", partnershipId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("partnership_alerts")
        .update({ 
          is_acknowledged: true,
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString()
        })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnership-alerts", partnershipId] });
      toast({ title: "Alerte acquittée" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  });

  const unacknowledgedAlerts = alerts.filter(a => !a.is_acknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.is_acknowledged);

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Active Alerts */}
      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Alertes actives ({unacknowledgedAlerts.length})
        </h4>

        {unacknowledgedAlerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md">
            <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Aucune alerte active
          </div>
        ) : (
          <div className="space-y-3">
            {unacknowledgedAlerts.map((alert) => {
              const alertInfo = alertTypeLabels[alert.alert_type] || { label: alert.alert_type, variant: "outline" as const };
              
              return (
                <Card key={alert.id} className="border-l-4 border-l-destructive">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={alertInfo.variant}>{alertInfo.label}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(alert.alert_date), "dd MMM yyyy", { locale: fr })}
                            </span>
                          </div>
                          <p className="text-sm">{alert.message}</p>
                        </div>
                      </div>
                      {canManage && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => acknowledgeMutation.mutate(alert.id)}
                          disabled={acknowledgeMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Acquitter
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2 text-muted-foreground">
            <BellOff className="w-4 h-4" />
            Alertes acquittées ({acknowledgedAlerts.length})
          </h4>

          <div className="space-y-2">
            {acknowledgedAlerts.map((alert) => {
              const alertInfo = alertTypeLabels[alert.alert_type] || { label: alert.alert_type, variant: "outline" as const };
              
              return (
                <Card key={alert.id} className="opacity-60">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{alertInfo.label}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(alert.alert_date), "dd/MM/yyyy", { locale: fr })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                      {alert.acknowledged_at && (
                        <span className="text-xs text-muted-foreground">
                          Acquitté le {format(new Date(alert.acknowledged_at), "dd/MM/yyyy", { locale: fr })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
