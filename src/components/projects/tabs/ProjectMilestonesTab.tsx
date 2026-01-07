import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Flag, CheckCircle } from "lucide-react";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectMilestonesTabProps {
  projectId: string;
  canManage: boolean;
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  "en attente": { color: "secondary", icon: Flag },
  "en cours": { color: "default", icon: Flag },
  "terminé": { color: "outline", icon: CheckCircle },
  "annulé": { color: "destructive", icon: Flag },
};

export function ProjectMilestonesTab({ projectId, canManage }: ProjectMilestonesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    due_date: "",
    status: "en attente",
  });

  const { data: milestones, isLoading } = useQuery({
    queryKey: ["project-milestones", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMilestone = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        project_id: projectId,
        created_by: user?.id,
        completed_date: formData.status === "terminé" ? new Date().toISOString().split("T")[0] : null,
      };

      if (editingMilestone) {
        const { error } = await supabase
          .from("project_milestones")
          .update(payload)
          .eq("id", editingMilestone.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("project_milestones").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-milestones", projectId] });
      closeDialog();
      toast({ title: editingMilestone ? "Jalon modifié" : "Jalon créé" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteMilestone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_milestones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-milestones", projectId] });
      toast({ title: "Jalon supprimé" });
    },
  });

  const openDialog = (milestone?: any) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setFormData({
        name: milestone.name,
        description: milestone.description || "",
        due_date: milestone.due_date,
        status: milestone.status,
      });
    } else {
      setEditingMilestone(null);
      setFormData({ name: "", description: "", due_date: "", status: "en attente" });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingMilestone(null);
    setFormData({ name: "", description: "", due_date: "", status: "en attente" });
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Jalons ({milestones?.length || 0})</h3>
        {canManage && (
          <Button size="sm" onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        )}
      </div>

      {milestones?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun jalon défini
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {milestones?.map((milestone) => {
            const StatusIcon = statusConfig[milestone.status]?.icon || Flag;
            return (
              <Card key={milestone.id}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <StatusIcon className="w-5 h-5 mt-1 text-primary" />
                      <div>
                        <p className="font-medium">{milestone.name}</p>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          Échéance: {format(new Date(milestone.due_date), "dd MMM yyyy", { locale: fr })}
                          {milestone.completed_date && (
                            <span className="ml-2 text-green-600">
                              (Terminé le {format(new Date(milestone.completed_date), "dd MMM yyyy", { locale: fr })})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusConfig[milestone.status]?.color as any}>
                        {milestone.status}
                      </Badge>
                      {canManage && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => openDialog(milestone)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteMilestone.mutate(milestone.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMilestone ? "Modifier le jalon" : "Nouveau jalon"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMilestone.mutate(); }} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date d'échéance *</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en attente">En attente</SelectItem>
                    <SelectItem value="en cours">En cours</SelectItem>
                    <SelectItem value="terminé">Terminé</SelectItem>
                    <SelectItem value="annulé">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
              <Button type="submit" disabled={saveMilestone.isPending}>
                {saveMilestone.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
