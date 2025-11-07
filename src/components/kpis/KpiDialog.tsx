import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { KpiTracking } from "@/types/kpi";

interface KpiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpi?: KpiTracking | null;
  onClose: () => void;
}

export function KpiDialog({ open, onOpenChange, kpi, onClose }: KpiDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kpi_name: "",
    kpi_value: 0,
    period: new Date().toISOString().split('T')[0],
    target_value: null as number | null,
    unit: "",
    notes: "",
    direction_id: "",
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
    if (kpi) {
      setFormData({
        kpi_name: kpi.kpi_name,
        kpi_value: kpi.kpi_value,
        period: kpi.period,
        target_value: kpi.target_value,
        unit: kpi.unit || "",
        notes: kpi.notes || "",
        direction_id: kpi.direction_id,
      });
    } else {
      setFormData({
        kpi_name: "",
        kpi_value: 0,
        period: new Date().toISOString().split('T')[0],
        target_value: null,
        unit: "CFA",
        notes: "",
        direction_id: "",
      });
    }
  }, [kpi, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const dataToSubmit = {
        ...formData,
        kpi_value: Number(formData.kpi_value),
        target_value: formData.target_value ? Number(formData.target_value) : null,
        unit: formData.unit || null,
        notes: formData.notes || null,
        created_by: user?.id,
      };

      if (kpi) {
        const { error } = await supabase
          .from("kpi_tracking")
          .update(dataToSubmit)
          .eq("id", kpi.id);
        if (error) throw error;
        toast({ title: "KPI mis à jour avec succès" });
      } else {
        const { error } = await supabase
          .from("kpi_tracking")
          .insert([dataToSubmit]);
        if (error) throw error;
        toast({ title: "KPI créé avec succès" });
      }

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
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
            {kpi ? "Modifier le KPI" : "Nouveau KPI"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kpi_name">Nom du KPI *</Label>
              <Input
                id="kpi_name"
                value={formData.kpi_name}
                onChange={(e) => setFormData({ ...formData, kpi_name: e.target.value })}
                placeholder="Ex: Nombre d'exportateurs accompagnés"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direction_id">Direction *</Label>
              <Select
                value={formData.direction_id}
                onValueChange={(value) => setFormData({ ...formData, direction_id: value })}
                required
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kpi_value">Valeur *</Label>
              <Input
                id="kpi_value"
                type="number"
                step="0.01"
                value={formData.kpi_value}
                onChange={(e) => setFormData({ ...formData, kpi_value: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_value">Valeur cible</Label>
              <Input
                id="target_value"
                type="number"
                step="0.01"
                value={formData.target_value || ""}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value ? parseFloat(e.target.value) : null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unité</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Ex: %, €, nombre"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Période *</Label>
            <Input
              id="period"
              type="date"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes ou commentaires additionnels..."
              rows={3}
            />
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
