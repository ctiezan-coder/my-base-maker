import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Pencil, Trash2, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectKpisTabProps {
  projectId: string;
  canManage: boolean;
}

export function ProjectKpisTab({ projectId, canManage }: ProjectKpisTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    target_value: "",
    current_value: "",
    unit: "",
    measurement_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const { data: kpis, isLoading } = useQuery({
    queryKey: ["project-kpis", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_kpis")
        .select("*")
        .eq("project_id", projectId)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveKpi = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        project_id: projectId,
        created_by: user?.id,
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        current_value: formData.current_value ? parseFloat(formData.current_value) : null,
        measurement_date: formData.measurement_date || null,
      };

      if (editingKpi) {
        const { error } = await supabase
          .from("project_kpis")
          .update(payload)
          .eq("id", editingKpi.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("project_kpis").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-kpis", projectId] });
      closeDialog();
      toast({ title: editingKpi ? "KPI modifié" : "KPI ajouté" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteKpi = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_kpis").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-kpis", projectId] });
      toast({ title: "KPI supprimé" });
    },
  });

  const openDialog = (kpi?: any) => {
    if (kpi) {
      setEditingKpi(kpi);
      setFormData({
        name: kpi.name,
        target_value: kpi.target_value?.toString() || "",
        current_value: kpi.current_value?.toString() || "",
        unit: kpi.unit || "",
        measurement_date: kpi.measurement_date || new Date().toISOString().split("T")[0],
        notes: kpi.notes || "",
      });
    } else {
      setEditingKpi(null);
      setFormData({
        name: "",
        target_value: "",
        current_value: "",
        unit: "",
        measurement_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingKpi(null);
  };

  const calculateProgress = (current: number | null, target: number | null) => {
    if (!current || !target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Indicateurs de performance ({kpis?.length || 0})</h3>
        {canManage && (
          <Button size="sm" onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        )}
      </div>

      {kpis?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun indicateur de performance défini
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {kpis?.map((kpi) => {
            const progress = calculateProgress(kpi.current_value, kpi.target_value);
            return (
              <Card key={kpi.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <h4 className="font-medium">{kpi.name}</h4>
                    </div>
                    {canManage && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openDialog(kpi)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteKpi.mutate(kpi.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-mono">
                        {kpi.current_value ?? 0} / {kpi.target_value ?? "?"} {kpi.unit}
                      </span>
                    </div>
                    <Progress value={progress} />
                    <p className="text-xs text-muted-foreground text-right">
                      {progress.toFixed(0)}% de l'objectif
                    </p>
                  </div>

                  {kpi.measurement_date && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Dernière mesure: {format(new Date(kpi.measurement_date), "dd MMM yyyy", { locale: fr })}
                    </p>
                  )}
                  {kpi.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{kpi.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingKpi ? "Modifier le KPI" : "Nouveau KPI"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveKpi.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de l'indicateur *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Taux de complétion, Nombre de livrables validés..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Valeur cible</Label>
                <Input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valeur actuelle</Label>
                <Input
                  type="number"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unité</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="%, €, jours..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date de mesure</Label>
              <Input
                type="date"
                value={formData.measurement_date}
                onChange={(e) => setFormData({ ...formData, measurement_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
              <Button type="submit" disabled={saveKpi.isPending}>
                {saveKpi.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
