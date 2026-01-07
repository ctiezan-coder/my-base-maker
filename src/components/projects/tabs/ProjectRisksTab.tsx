import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectRisksTabProps {
  projectId: string;
  canManage: boolean;
}

const probabilityColors: Record<string, string> = {
  faible: "secondary",
  moyen: "default",
  élevé: "destructive",
  critique: "destructive",
};

const impactColors: Record<string, string> = {
  faible: "secondary",
  moyen: "default",
  élevé: "destructive",
  critique: "destructive",
};

const statusColors: Record<string, string> = {
  identifié: "secondary",
  "en cours": "default",
  résolu: "outline",
  survenu: "destructive",
};

export function ProjectRisksTab({ projectId, canManage }: ProjectRisksTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    probability: "moyen",
    impact: "moyen",
    status: "identifié",
    mitigation_plan: "",
    owner_id: "",
  });

  const { data: risks, isLoading } = useQuery({
    queryKey: ["project-risks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_risks")
        .select(`
          *,
          owner:employees(first_name, last_name)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: employees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("status", "Actif")
        .order("last_name");
      if (error) throw error;
      return data;
    },
  });

  const saveRisk = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        project_id: projectId,
        created_by: user?.id,
        owner_id: formData.owner_id || null,
      };

      if (editingRisk) {
        const { error } = await supabase
          .from("project_risks")
          .update(payload)
          .eq("id", editingRisk.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("project_risks").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-risks", projectId] });
      closeDialog();
      toast({ title: editingRisk ? "Risque modifié" : "Risque ajouté" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteRisk = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_risks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-risks", projectId] });
      toast({ title: "Risque supprimé" });
    },
  });

  const openDialog = (risk?: any) => {
    if (risk) {
      setEditingRisk(risk);
      setFormData({
        name: risk.name,
        description: risk.description || "",
        probability: risk.probability,
        impact: risk.impact,
        status: risk.status,
        mitigation_plan: risk.mitigation_plan || "",
        owner_id: risk.owner_id || "",
      });
    } else {
      setEditingRisk(null);
      setFormData({
        name: "",
        description: "",
        probability: "moyen",
        impact: "moyen",
        status: "identifié",
        mitigation_plan: "",
        owner_id: "",
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRisk(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Risques ({risks?.length || 0})</h3>
        {canManage && (
          <Button size="sm" onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        )}
      </div>

      {risks?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun risque identifié
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {risks?.map((risk) => (
            <Card key={risk.id}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-1" />
                    <div>
                      <p className="font-medium">{risk.name}</p>
                      {risk.description && (
                        <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant={probabilityColors[risk.probability] as any}>
                          Prob: {risk.probability}
                        </Badge>
                        <Badge variant={impactColors[risk.impact] as any}>
                          Impact: {risk.impact}
                        </Badge>
                      </div>
                      {risk.mitigation_plan && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Mitigation:</span> {risk.mitigation_plan}
                        </p>
                      )}
                      {risk.owner && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Responsable: {risk.owner.first_name} {risk.owner.last_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColors[risk.status] as any}>{risk.status}</Badge>
                    {canManage && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => openDialog(risk)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteRisk.mutate(risk.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRisk ? "Modifier le risque" : "Nouveau risque"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveRisk.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Probabilité</Label>
                <Select value={formData.probability} onValueChange={(v) => setFormData({ ...formData, probability: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faible">Faible</SelectItem>
                    <SelectItem value="moyen">Moyen</SelectItem>
                    <SelectItem value="élevé">Élevé</SelectItem>
                    <SelectItem value="critique">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Impact</Label>
                <Select value={formData.impact} onValueChange={(v) => setFormData({ ...formData, impact: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faible">Faible</SelectItem>
                    <SelectItem value="moyen">Moyen</SelectItem>
                    <SelectItem value="élevé">Élevé</SelectItem>
                    <SelectItem value="critique">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identifié">Identifié</SelectItem>
                    <SelectItem value="en cours">En cours</SelectItem>
                    <SelectItem value="résolu">Résolu</SelectItem>
                    <SelectItem value="survenu">Survenu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Plan de mitigation</Label>
              <Textarea
                value={formData.mitigation_plan}
                onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
                placeholder="Actions pour réduire ou éliminer le risque..."
              />
            </div>
            <div className="space-y-2">
              <Label>Responsable</Label>
              <Select value={formData.owner_id} onValueChange={(v) => setFormData({ ...formData, owner_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Non assigné" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Non assigné</SelectItem>
                  {employees?.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
              <Button type="submit" disabled={saveRisk.isPending}>
                {saveRisk.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
