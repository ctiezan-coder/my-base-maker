import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, FileCheck } from "lucide-react";
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

interface ProjectDeliverablesTabProps {
  projectId: string;
  canManage: boolean;
}

const statusColors: Record<string, string> = {
  "à faire": "secondary",
  "en cours": "default",
  "terminé": "outline",
  "validé": "default",
};

export function ProjectDeliverablesTab({ projectId, canManage }: ProjectDeliverablesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    due_date: "",
    status: "à faire",
    milestone_id: "",
    assigned_to: "",
  });

  const { data: deliverables, isLoading } = useQuery({
    queryKey: ["project-deliverables", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_deliverables")
        .select(`
          *,
          milestone:project_milestones(name),
          assigned:employees(first_name, last_name)
        `)
        .eq("project_id", projectId)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: milestones } = useQuery({
    queryKey: ["project-milestones-select", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_milestones")
        .select("id, name")
        .eq("project_id", projectId)
        .order("due_date");
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

  const saveDeliverable = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        project_id: projectId,
        created_by: user?.id,
        milestone_id: formData.milestone_id || null,
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date || null,
      };

      if (editingDeliverable) {
        const { error } = await supabase
          .from("project_deliverables")
          .update(payload)
          .eq("id", editingDeliverable.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("project_deliverables").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-deliverables", projectId] });
      closeDialog();
      toast({ title: editingDeliverable ? "Livrable modifié" : "Livrable créé" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteDeliverable = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_deliverables").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-deliverables", projectId] });
      toast({ title: "Livrable supprimé" });
    },
  });

  const openDialog = (deliverable?: any) => {
    if (deliverable) {
      setEditingDeliverable(deliverable);
      setFormData({
        name: deliverable.name,
        description: deliverable.description || "",
        due_date: deliverable.due_date || "",
        status: deliverable.status,
        milestone_id: deliverable.milestone_id || "",
        assigned_to: deliverable.assigned_to || "",
      });
    } else {
      setEditingDeliverable(null);
      setFormData({ name: "", description: "", due_date: "", status: "à faire", milestone_id: "", assigned_to: "" });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingDeliverable(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Livrables ({deliverables?.length || 0})</h3>
        {canManage && (
          <Button size="sm" onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        )}
      </div>

      {deliverables?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun livrable défini
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {deliverables?.map((deliverable) => (
            <Card key={deliverable.id}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileCheck className="w-5 h-5 mt-1 text-primary" />
                    <div>
                      <p className="font-medium">{deliverable.name}</p>
                      {deliverable.description && (
                        <p className="text-sm text-muted-foreground mt-1">{deliverable.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        {deliverable.due_date && (
                          <span>Échéance: {format(new Date(deliverable.due_date), "dd MMM yyyy", { locale: fr })}</span>
                        )}
                        {deliverable.milestone && (
                          <span>Jalon: {deliverable.milestone.name}</span>
                        )}
                        {deliverable.assigned && (
                          <span>Assigné à: {deliverable.assigned.first_name} {deliverable.assigned.last_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColors[deliverable.status] as any}>
                      {deliverable.status}
                    </Badge>
                    {canManage && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => openDialog(deliverable)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteDeliverable.mutate(deliverable.id)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDeliverable ? "Modifier le livrable" : "Nouveau livrable"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveDeliverable.mutate(); }} className="space-y-4">
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
                <Label>Date d'échéance</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="à faire">À faire</SelectItem>
                    <SelectItem value="en cours">En cours</SelectItem>
                    <SelectItem value="terminé">Terminé</SelectItem>
                    <SelectItem value="validé">Validé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jalon associé</Label>
                <Select value={formData.milestone_id} onValueChange={(v) => setFormData({ ...formData, milestone_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun</SelectItem>
                    {milestones?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assigné à</Label>
                <Select value={formData.assigned_to} onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}>
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
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
              <Button type="submit" disabled={saveDeliverable.isPending}>
                {saveDeliverable.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
