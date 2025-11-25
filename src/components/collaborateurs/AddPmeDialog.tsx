import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@supabase/auth-helpers-react";
import { useUserDirection } from "@/hooks/useUserDirection";

interface AddPmeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPmeDialog({ open, onOpenChange }: AddPmeDialogProps) {
  const { user } = useAuth();
  const { directionId } = useUserDirection();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sector: "",
    status: "Prospection",
    market: "",
    contact: "",
    nextMeeting: "",
    description: "",
    dfeNumber: "",
    rccmNumber: "",
    headquarters: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Vous devez être connecté pour ajouter une PME");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("companies").insert({
        company_name: formData.name,
        activity_sector: formData.sector,
        accompaniment_status: formData.status,
        target_export_markets: formData.market ? [formData.market] : null,
        legal_representative_name: formData.contact,
        aciex_interaction_history: formData.description,
        dfe_number: formData.dfeNumber,
        rccm_number: formData.rccmNumber,
        headquarters_location: formData.headquarters,
        direction_id: directionId,
        created_by: user.id
      });

      if (error) throw error;

      toast.success("PME ajoutée avec succès");
      onOpenChange(false);

      // Reset form
      setFormData({
        name: "",
        sector: "",
        status: "Prospection",
        market: "",
        contact: "",
        nextMeeting: "",
        description: "",
        dfeNumber: "",
        rccmNumber: "",
        headquarters: ""
      });
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("Erreur lors de l'ajout de la PME");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une PME</DialogTitle>
          <DialogDescription>
            Ajoutez une nouvelle PME à votre portefeuille d'accompagnement
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la PME *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cacao Excellence CI"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Secteur d'activité *</Label>
              <Input
                id="sector"
                required
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                placeholder="Ex: Agroalimentaire"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dfeNumber">Numéro DFE *</Label>
              <Input
                id="dfeNumber"
                required
                value={formData.dfeNumber}
                onChange={(e) => setFormData({ ...formData, dfeNumber: e.target.value })}
                placeholder="Ex: DFE123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rccmNumber">Numéro RCCM *</Label>
              <Input
                id="rccmNumber"
                required
                value={formData.rccmNumber}
                onChange={(e) => setFormData({ ...formData, rccmNumber: e.target.value })}
                placeholder="Ex: RCCM123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headquarters">Siège social *</Label>
              <Input
                id="headquarters"
                required
                value={formData.headquarters}
                onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                placeholder="Ex: Abidjan, Plateau"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prospection">En prospection</SelectItem>
                  <SelectItem value="Négociation">Négociation</SelectItem>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="market">Marché cible *</Label>
              <Input
                id="market"
                required
                value={formData.market}
                onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                placeholder="Ex: France, Belgique"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact principal *</Label>
              <Input
                id="contact"
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Nom, Fonction"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextMeeting">Prochain RDV</Label>
              <Input
                id="nextMeeting"
                type="date"
                value={formData.nextMeeting}
                onChange={(e) => setFormData({ ...formData, nextMeeting: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description / Notes</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Informations complémentaires sur la PME..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Ajout en cours..." : "Ajouter la PME"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
