import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useUserDirection } from "@/hooks/useUserDirection";
import { createNotification } from "@/hooks/useNotification";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: any;
  onClose: () => void;
}

export function ProjectDialog({ open, onOpenChange, project, onClose }: ProjectDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { data: userDirection } = useUserDirection();
  
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    status: "planifié",
    start_date: "",
    end_date: "",
    budget: "",
    direction_id: "",
  });

  const { data: directions = [] } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directions")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "planifié",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
        budget: project.budget?.toString() || "",
        direction_id: project.direction_id || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        status: "planifié",
        start_date: "",
        end_date: "",
        budget: "",
        direction_id: userDirection?.direction_id || "",
      });
    }
  }, [project, userDirection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const directionId = formData.direction_id || project?.direction_id || userDirection?.direction_id;
      
      if (!directionId) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Direction non définie. Veuillez sélectionner une direction.",
        });
        setLoading(false);
        return;
      }

      const dataToSave = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        direction_id: directionId,
      };

      if (project) {
        const { error } = await supabase
          .from("projects")
          .update(dataToSave)
          .eq("id", project.id);

        if (error) throw error;
        toast({ title: "Projet mis à jour avec succès" });
      } else {
        const { data: newProject, error } = await supabase
          .from("projects")
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;

        // Notifier tous les utilisateurs de la direction
        if (newProject && directionId) {
          const { data: directionUsers } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("direction_id", directionId);

          if (directionUsers) {
            for (const u of directionUsers) {
              await createNotification({
                userId: u.user_id,
                title: "Nouveau projet créé",
                message: `Un nouveau projet a été créé: "${formData.name}"`,
                type: "info",
                referenceId: newProject.id,
                referenceTable: "projects",
              });
            }
          }
        }

        toast({ title: "Projet créé avec succès" });
      }
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? "Modifier le projet" : "Nouveau projet"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du projet *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planifié">Planifié</SelectItem>
                  <SelectItem value="en cours">En cours</SelectItem>
                  <SelectItem value="terminé">Terminé</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (FCFA)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direction_id">Direction *</Label>
            <Select
              value={formData.direction_id}
              onValueChange={(value) => setFormData({ ...formData, direction_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une direction" />
              </SelectTrigger>
              <SelectContent>
                {directions.map((direction) => (
                  <SelectItem key={direction.id} value={direction.id}>
                    {direction.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date début</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Date fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
