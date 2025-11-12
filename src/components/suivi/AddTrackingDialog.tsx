import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AddTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export function AddTrackingDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
}: AddTrackingDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    tracking_type: "Réunion",
    tracking_date: "",
    status: "Planifié",
    description: "",
  });

  const createTrackingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("project_tracking").insert([
        {
          project_id: projectId,
          ...data,
          created_by: user?.id,
        },
      ]);

      if (error) throw error;

      // Create notification
      const { error: notifError } = await supabase.from("notifications").insert([
        {
          user_id: user?.id!,
          title: "Nouveau suivi ajouté",
          message: `Suivi de type "${data.tracking_type}" ajouté pour le projet "${projectName}"`,
          type: "success",
          reference_id: projectId,
          reference_table: "projects",
        },
      ]);

      if (notifError) console.error("Notification error:", notifError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tracking"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Suivi ajouté avec succès");
      onOpenChange(false);
      setFormData({
        tracking_type: "Réunion",
        tracking_date: "",
        status: "Planifié",
        description: "",
      });
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout du suivi");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tracking_date) {
      toast.error("Veuillez sélectionner une date");
      return;
    }
    createTrackingMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un suivi - {projectName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tracking_type">Type de suivi</Label>
            <Select
              value={formData.tracking_type}
              onValueChange={(value) =>
                setFormData({ ...formData, tracking_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Réunion">Réunion</SelectItem>
                <SelectItem value="Rapport">Rapport</SelectItem>
                <SelectItem value="Visite">Visite</SelectItem>
                <SelectItem value="Évaluation">Évaluation</SelectItem>
                <SelectItem value="Audit">Audit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tracking_date">Date</Label>
            <Input
              id="tracking_date"
              type="date"
              value={formData.tracking_date}
              onChange={(e) =>
                setFormData({ ...formData, tracking_date: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planifié">Planifié</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Complété">Complété</SelectItem>
                <SelectItem value="Annulé">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={createTrackingMutation.isPending}>
              {createTrackingMutation.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
