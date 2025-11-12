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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ChangeProjectStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  currentStatus: string;
}

export function ChangeProjectStatusDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  currentStatus,
}: ChangeProjectStatusDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState(currentStatus);

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from("projects")
        .update({ status })
        .eq("id", projectId);

      if (error) throw error;

      // Create notification
      const { error: notifError } = await supabase.from("notifications").insert([
        {
          user_id: user?.id!,
          title: "Statut du projet modifié",
          message: `Le statut du projet "${projectName}" a été changé en "${status}"`,
          type: "info",
          reference_id: projectId,
          reference_table: "projects",
        },
      ]);

      if (notifError) console.error("Notification error:", notifError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Statut modifié avec succès");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la modification du statut");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus === currentStatus) {
      toast.info("Aucun changement détecté");
      return;
    }
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Changer le statut - {projectName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="status">Nouveau statut</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planifié">Planifié</SelectItem>
                <SelectItem value="en cours">En cours</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
                <SelectItem value="complété">Complété</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
