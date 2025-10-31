import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface FolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder?: any;
  parentFolderId?: string | null;
  onClose: () => void;
}

export function FolderDialog({ open, onOpenChange, folder, parentFolderId, onClose }: FolderDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    direction_id: "",
    parent_folder_id: parentFolderId || null,
  });

  const { data: directions } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directions")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (folder) {
      setFormData(folder);
    } else {
      setFormData({
        name: "",
        direction_id: "",
        parent_folder_id: parentFolderId || null,
      });
    }
  }, [folder, parentFolderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (folder) {
        const { error } = await supabase
          .from("folders")
          .update({ name: formData.name, direction_id: formData.direction_id })
          .eq("id", folder.id);

        if (error) throw error;
        toast({ title: "Dossier mis à jour avec succès" });
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("folders")
          .insert([{ ...formData, created_by: user?.id }]);

        if (error) throw error;
        toast({ title: "Dossier créé avec succès" });
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {folder ? "Modifier le dossier" : "Nouveau dossier"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du dossier *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Ex: Rapports 2024"
            />
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
                {directions?.map((dir) => (
                  <SelectItem key={dir.id} value={dir.id}>
                    {dir.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
