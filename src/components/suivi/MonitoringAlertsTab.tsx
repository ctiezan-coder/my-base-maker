import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Bell, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MonitoringAlertsTabProps {
  canManage: boolean;
}

export function MonitoringAlertsTab({ canManage }: MonitoringAlertsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterResolved, setFilterResolved] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["monitoring-alerts", filterType, filterResolved],
    queryFn: async () => {
      let query = supabase
        .from("monitoring_alerts")
        .select("*, directions(name)")
        .order("created_at", { ascending: false });

      if (filterType !== "all") {
        query = query.eq("alert_type", filterType);
      }
      if (filterResolved === "active") {
        query = query.eq("is_resolved", false);
      } else if (filterResolved === "resolved") {
        query = query.eq("is_resolved", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: directions } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("directions").select("*");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (alert: any) => {
      const { error } = await supabase.from("monitoring_alerts").insert(alert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring-alerts"] });
      toast.success("Alerte créée avec succès");
      setIsDialogOpen(false);
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("monitoring_alerts").update({ is_resolved: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring-alerts"] });
      toast.success("Alerte résolue");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const alert = {
      alert_type: formData.get("alert_type"),
      reference_type: formData.get("reference_type") || "manual",
      direction_id: formData.get("direction_id") || null,
      message: formData.get("message"),
      threshold_value: formData.get("threshold_value") ? Number(formData.get("threshold_value")) : null,
      current_value: formData.get("current_value") ? Number(formData.get("current_value")) : null,
      is_resolved: false,
      is_read: false,
    };
    createMutation.mutate(alert);
  };

  const activeAlerts = alerts?.filter((a) => !a.is_resolved).length || 0;
  const resolvedAlerts = alerts?.filter((a) => a.is_resolved).length || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <Bell className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAlerts}</p>
                <p className="text-sm text-muted-foreground">Alertes actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedAlerts}</p>
                <p className="text-sm text-muted-foreground">Résolues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alerts?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="kpi_threshold">KPI</SelectItem>
              <SelectItem value="budget_overrun">Budget</SelectItem>
              <SelectItem value="project_delay">Projet</SelectItem>
              <SelectItem value="deadline">Échéance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterResolved} onValueChange={setFilterResolved}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actives</SelectItem>
              <SelectItem value="resolved">Résolues</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {canManage && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle alerte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Créer une alerte</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="alert_type">Type</Label>
                  <Select name="alert_type" defaultValue="kpi_threshold">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kpi_threshold">KPI</SelectItem>
                      <SelectItem value="budget_overrun">Budget</SelectItem>
                      <SelectItem value="project_delay">Projet</SelectItem>
                      <SelectItem value="deadline">Échéance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="direction_id">Direction</Label>
                  <Select name="direction_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {directions?.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="threshold_value">Seuil</Label>
                    <Input type="number" id="threshold_value" name="threshold_value" />
                  </div>
                  <div>
                    <Label htmlFor="current_value">Valeur actuelle</Label>
                    <Input type="number" id="current_value" name="current_value" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" rows={3} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                  <Button type="submit">Créer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : (
        <div className="space-y-3">
          {alerts?.map((alert) => (
            <Card key={alert.id} className={alert.is_resolved ? "opacity-60" : ""}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {alert.is_resolved ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{alert.alert_type}</Badge>
                        {alert.is_resolved && <Badge className="bg-green-100 text-green-800">Résolue</Badge>}
                      </div>
                      <p className="text-sm">{alert.message}</p>
                      <div className="text-xs text-muted-foreground">
                        {alert.directions?.name && <span>{alert.directions.name} • </span>}
                        {format(new Date(alert.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                        {alert.threshold_value && alert.current_value && (
                          <span> • Seuil: {alert.threshold_value}, Actuel: {alert.current_value}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {canManage && !alert.is_resolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resolveMutation.mutate(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Résoudre
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {alerts?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Aucune alerte</div>
          )}
        </div>
      )}
    </div>
  );
}
