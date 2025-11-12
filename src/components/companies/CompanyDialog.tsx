import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema, type CompanyValidationData } from "@/lib/validations/company-validation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Company } from "@/types/company";

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company;
  onClose: () => void;
}

export function CompanyDialog({ open, onOpenChange, company, onClose }: CompanyDialogProps) {
  const { toast } = useToast();

  const form = useForm<CompanyValidationData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: "",
      trade_name: "",
      rccm_number: "",
      dfe_number: "",
      legal_form: null,
      company_size: null,
      creation_date: null,
      headquarters_location: "",
      postal_address: "",
      city: "",
      phone: "",
      email: "",
      website: "",
      legal_representative_name: "",
      legal_representative_gender: null,
      legal_representative_phone: "",
      legal_representative_email: "",
      export_manager_name: "",
      export_manager_email: "",
      export_manager_phone: "",
      has_export_service: false,
      activity_sector: "",
      products_services: "",
      exported_products: "",
      target_export_markets: null,
      current_export_markets: null,
      certifications: null,
      annual_turnover: null,
      commercial_events_participation: "Jamais",
      support_needed: null,
      accompaniment_status: "",
      aciex_interaction_history: "",
      direction_id: null,
      created_by: null,
    },
  });

  useEffect(() => {
    if (company) {
      form.reset({
        company_name: company.company_name || "",
        trade_name: company.trade_name || "",
        rccm_number: company.rccm_number || "",
        dfe_number: company.dfe_number || "",
        legal_form: company.legal_form as any,
        company_size: company.company_size as any,
        creation_date: company.creation_date || null,
        headquarters_location: company.headquarters_location || "",
        postal_address: company.postal_address || "",
        city: company.city || "",
        phone: company.phone || "",
        email: company.email || "",
        website: company.website || "",
        legal_representative_name: company.legal_representative_name || "",
        legal_representative_gender: company.legal_representative_gender as any,
        legal_representative_phone: company.legal_representative_phone || "",
        legal_representative_email: company.legal_representative_email || "",
        export_manager_name: company.export_manager_name || "",
        export_manager_email: company.export_manager_email || "",
        export_manager_phone: company.export_manager_phone || "",
        has_export_service: company.has_export_service || false,
        activity_sector: company.activity_sector || "",
        products_services: company.products_services || "",
        exported_products: company.exported_products || "",
        target_export_markets: company.target_export_markets || null,
        current_export_markets: company.current_export_markets || null,
        certifications: company.certifications || null,
        annual_turnover: company.annual_turnover || null,
        commercial_events_participation: company.commercial_events_participation as any,
        support_needed: company.support_needed as any,
        accompaniment_status: company.accompaniment_status || "",
        aciex_interaction_history: company.aciex_interaction_history || "",
        direction_id: company.direction_id || null,
        created_by: company.created_by || null,
      });
    } else {
      form.reset();
    }
  }, [company, form]);

  const onSubmit = async (data: CompanyValidationData) => {
    try {
      if (company) {
        const { error } = await supabase
          .from("companies")
          .update(data as any)
          .eq("id", company.id);

        if (error) throw error;
        toast({ title: "Entreprise mise à jour avec succès" });
      } else {
        const { error } = await supabase
          .from("companies")
          .insert([data as any]);

        if (error) throw error;
        toast({ title: "Entreprise créée avec succès" });
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="identity" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="identity">Identité</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
                <TabsTrigger value="support">Accompagnement</TabsTrigger>
              </TabsList>

              <TabsContent value="identity" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raison sociale *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="legal_form"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forme juridique</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rccm_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro RCCM *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dfe_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compte Contribuables *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="headquarters_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localisation siège social *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="activity_sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secteur d'activité</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exported_products"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produits exportés</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commercial_events_participation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participation événements</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Jamais">Jamais</SelectItem>
                          <SelectItem value="Foires">Foires</SelectItem>
                          <SelectItem value="Salons">Salons</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="support" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="support_needed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'accompagnement</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Financier">Financier</SelectItem>
                          <SelectItem value="Non financier">Non financier</SelectItem>
                          <SelectItem value="Les deux">Les deux</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
