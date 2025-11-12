import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OperatorTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OperatorTrackingDialog({ open, onOpenChange }: OperatorTrackingDialogProps) {
  const [formData, setFormData] = useState({
    companyId: "",
    trackingStatus: "En prospection",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les entreprises existantes
  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies-for-tracking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, company_name, activity_sector, accompaniment_status')
        .order('company_name');
      
      if (error) throw error;
      return data;
    },
    enabled: open
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyId) {
      toast.error("Veuillez sélectionner un opérateur");
      return;
    }

    setIsSubmitting(true);

    try {
      // Mettre à jour le statut d'accompagnement de l'entreprise
      const { error } = await supabase
        .from('companies')
        .update({ 
          accompaniment_status: formData.trackingStatus,
          aciex_interaction_history: formData.notes 
        })
        .eq('id', formData.companyId);

      if (error) throw error;

      toast.success("Suivi de l'opérateur enregistré avec succès");
      onOpenChange(false);
      
      // Reset form
      setFormData({
        companyId: "",
        trackingStatus: "En prospection",
        notes: ""
      });
    } catch (error: any) {
      console.error('Error saving operator tracking:', error);
      toast.error("Erreur lors de l'enregistrement du suivi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suivre un opérateur</DialogTitle>
          <DialogDescription>
            Sélectionnez un opérateur existant pour démarrer ou mettre à jour son suivi
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyId">Opérateur *</Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Select 
                value={formData.companyId} 
                onValueChange={(value) => setFormData({ ...formData, companyId: value })}
              >
                <SelectTrigger id="companyId">
                  <SelectValue placeholder="Sélectionner un opérateur" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.company_name} {company.activity_sector && `• ${company.activity_sector}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut d'accompagnement *</Label>
            <Select 
              value={formData.trackingStatus} 
              onValueChange={(value) => setFormData({ ...formData, trackingStatus: value })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="En prospection">En prospection</SelectItem>
                <SelectItem value="Négociation">Négociation</SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Suspendu">Suspendu</SelectItem>
                <SelectItem value="En attente">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Historique d'interaction</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ajoutez des notes sur votre interaction avec cet opérateur..."
              rows={6}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer le suivi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
