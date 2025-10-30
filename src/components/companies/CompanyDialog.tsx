import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: any;
  onClose: () => void;
}

export function CompanyDialog({ open, onOpenChange, company, onClose }: CompanyDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    company_name: "",
    rccm_number: "",
    dfe_number: "",
    legal_form: "",
    headquarters_location: "",
    email: "",
    phone: "",
    activity_sector: "",
    exported_products: "",
    commercial_events_participation: "Jamais" as "Jamais" | "Foires" | "Salons",
    support_needed: "",
  });

  useEffect(() => {
    if (company) {
      setFormData(company);
    } else {
      setFormData({
        company_name: "",
        rccm_number: "",
        dfe_number: "",
        legal_form: "",
        headquarters_location: "",
        email: "",
        phone: "",
        activity_sector: "",
        exported_products: "",
        commercial_events_participation: "Jamais",
        support_needed: "",
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (company) {
        const { error } = await supabase
          .from("companies")
          .update(formData)
          .eq("id", company.id);

        if (error) throw error;
        toast({ title: "Entreprise mise à jour avec succès" });
      } else {
        const { error } = await supabase
          .from("companies")
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Entreprise créée avec succès" });
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {company ? "Modifier l'opérateur" : "Nouvel opérateur"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="identity">Identité</TabsTrigger>
              <TabsTrigger value="activity">Activité</TabsTrigger>
              <TabsTrigger value="support">Accompagnement</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Raison sociale *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal_form">Forme juridique</Label>
                  <Select
                    value={formData.legal_form}
                    onValueChange={(value) => setFormData({ ...formData, legal_form: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SA">SA</SelectItem>
                      <SelectItem value="SARL">SARL</SelectItem>
                      <SelectItem value="SAS">SAS</SelectItem>
                      <SelectItem value="SASU">SASU</SelectItem>
                      <SelectItem value="EI">EI</SelectItem>
                      <SelectItem value="GIE">GIE</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rccm_number">Numéro RCCM *</Label>
                  <Input
                    id="rccm_number"
                    value={formData.rccm_number}
                    onChange={(e) => setFormData({ ...formData, rccm_number: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dfe_number">Numéro DFE *</Label>
                  <Input
                    id="dfe_number"
                    value={formData.dfe_number}
                    onChange={(e) => setFormData({ ...formData, dfe_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headquarters_location">Localisation siège social *</Label>
                <Input
                  id="headquarters_location"
                  value={formData.headquarters_location}
                  onChange={(e) => setFormData({ ...formData, headquarters_location: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="activity_sector">Secteur d'activité</Label>
                <Input
                  id="activity_sector"
                  value={formData.activity_sector}
                  onChange={(e) => setFormData({ ...formData, activity_sector: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exported_products">Produits exportés</Label>
                <Textarea
                  id="exported_products"
                  value={formData.exported_products}
                  onChange={(e) => setFormData({ ...formData, exported_products: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commercial_events">Participation événements</Label>
                <Select
                  value={formData.commercial_events_participation}
                  onValueChange={(value) => setFormData({ ...formData, commercial_events_participation: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Foires">Foires</SelectItem>
                    <SelectItem value="Salons">Salons</SelectItem>
                    <SelectItem value="Jamais">Jamais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="support" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="support_needed">Type d'accompagnement</Label>
                <Select
                  value={formData.support_needed}
                  onValueChange={(value) => setFormData({ ...formData, support_needed: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Financier">Financier</SelectItem>
                    <SelectItem value="Non financier">Non financier</SelectItem>
                    <SelectItem value="Les deux">Les deux</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

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
