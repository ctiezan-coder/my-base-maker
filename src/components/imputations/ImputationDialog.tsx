import { useEffect, useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Imputation, ImputationFormData } from "@/types/imputation";

interface ImputationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imputation?: Imputation | null;
}

export function ImputationDialog({ open, onOpenChange, imputation }: ImputationDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: directions } = useQuery({
    queryKey: ['directions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('directions')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState<ImputationFormData>({
    date_reception: new Date().toISOString().split('T')[0],
    provenance: "",
    objet: "",
    imputation: "",
    date_imputation: null,
    date_realisation: null,
    observations: "",
    etat: "En attente",
    direction_id: null,
    created_by: user?.id || null,
  });

  useEffect(() => {
    if (imputation) {
      setFormData({
        date_reception: imputation.date_reception,
        provenance: imputation.provenance,
        objet: imputation.objet,
        imputation: imputation.imputation,
        date_imputation: imputation.date_imputation,
        date_realisation: imputation.date_realisation,
        observations: imputation.observations,
        etat: imputation.etat,
        direction_id: imputation.direction_id,
        created_by: imputation.created_by,
      });
    } else {
      setFormData({
        date_reception: new Date().toISOString().split('T')[0],
        provenance: "",
        objet: "",
        imputation: "",
        date_imputation: null,
        date_realisation: null,
        observations: "",
        etat: "En attente",
        direction_id: null,
        created_by: user?.id || null,
      });
    }
  }, [imputation, user]);

  const saveMutation = useMutation({
    mutationFn: async (data: ImputationFormData) => {
      if (imputation) {
        const { error } = await supabase
          .from('imputations')
          .update(data)
          .eq('id', imputation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('imputations')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imputations'] });
      toast({
        title: "Succès",
        description: imputation
          ? "Imputation modifiée avec succès"
          : "Imputation ajoutée avec succès",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await saveMutation.mutateAsync(formData);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {imputation ? "Modifier l'imputation" : "Nouvelle Imputation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_reception">Date de réception *</Label>
              <Input
                id="date_reception"
                type="date"
                value={formData.date_reception}
                onChange={(e) =>
                  setFormData({ ...formData, date_reception: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provenance">Provenance *</Label>
              <Input
                id="provenance"
                value={formData.provenance}
                onChange={(e) =>
                  setFormData({ ...formData, provenance: e.target.value })
                }
                placeholder="Ministère, Partenaire..."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objet">Objet *</Label>
            <Textarea
              id="objet"
              value={formData.objet}
              onChange={(e) =>
                setFormData({ ...formData, objet: e.target.value })
              }
              placeholder="Description détaillée du document"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imputation">Imputation (Direction) *</Label>
              <Input
                id="imputation"
                value={formData.imputation}
                onChange={(e) =>
                  setFormData({ ...formData, imputation: e.target.value })
                }
                placeholder="Direction responsable"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direction_id">Direction</Label>
              <Select
                value={formData.direction_id || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, direction_id: value || null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une direction" />
                </SelectTrigger>
                <SelectContent>
                  {directions?.map((direction) => (
                    <SelectItem key={direction.id} value={direction.id}>
                      {direction.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_imputation">Date d'imputation</Label>
              <Input
                id="date_imputation"
                type="date"
                value={formData.date_imputation || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    date_imputation: e.target.value || null,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_realisation">Date de réalisation</Label>
              <Input
                id="date_realisation"
                type="date"
                value={formData.date_realisation || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    date_realisation: e.target.value || null,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              value={formData.observations || ""}
              onChange={(e) =>
                setFormData({ ...formData, observations: e.target.value })
              }
              placeholder="Commentaires ou notes complémentaires"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="etat">État *</Label>
            <Select
              value={formData.etat}
              onValueChange={(value: any) =>
                setFormData({ ...formData, etat: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Terminé">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
