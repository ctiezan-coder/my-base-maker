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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building2, Users, Factory, MapPin, Briefcase, Settings } from "lucide-react";
import { z } from "zod";

// Schéma de validation enrichi
const companyFormSchema = z.object({
  // Identité
  company_name: z.string().min(1, "La raison sociale est requise"),
  trade_name: z.string().nullable().optional(),
  sigle: z.string().nullable().optional(),
  rccm_number: z.string().min(1, "Le numéro RCCM est requis"),
  dfe_number: z.string().min(1, "Le compte contribuable est requis"),
  legal_form: z.string().nullable().optional(),
  company_size: z.string().nullable().optional(),
  creation_date: z.string().nullable().optional(),
  
  // Localisation
  headquarters_location: z.string().min(1, "La localisation est requise"),
  postal_address: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  commune: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  gps_latitude: z.number().nullable().optional(),
  gps_longitude: z.number().nullable().optional(),
  
  // Contacts
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  website: z.string().nullable().optional(),
  facebook_url: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  
  // Représentant légal
  legal_representative_name: z.string().nullable().optional(),
  legal_representative_gender: z.string().nullable().optional(),
  legal_representative_phone: z.string().nullable().optional(),
  legal_representative_email: z.string().nullable().optional(),
  
  // Contact principal
  main_contact_name: z.string().nullable().optional(),
  main_contact_function: z.string().nullable().optional(),
  main_contact_phone: z.string().nullable().optional(),
  main_contact_email: z.string().nullable().optional(),
  
  // Responsable export
  export_manager_name: z.string().nullable().optional(),
  export_manager_phone: z.string().nullable().optional(),
  export_manager_email: z.string().nullable().optional(),
  has_export_service: z.boolean().optional(),
  
  // Activité / Filière
  filiere: z.string().nullable().optional(),
  activity_sector: z.string().nullable().optional(),
  sub_sector: z.string().nullable().optional(),
  products_services: z.string().nullable().optional(),
  exported_products: z.string().nullable().optional(),
  hs_codes: z.array(z.string()).nullable().optional(),
  
  // Ressources humaines
  total_employees: z.number().nullable().optional(),
  permanent_employees: z.number().nullable().optional(),
  seasonal_employees: z.number().nullable().optional(),
  male_employees: z.number().nullable().optional(),
  female_employees: z.number().nullable().optional(),
  managers_count: z.number().nullable().optional(),
  technicians_count: z.number().nullable().optional(),
  workers_count: z.number().nullable().optional(),
  
  // Capacité de production
  annual_capacity: z.number().nullable().optional(),
  current_production: z.number().nullable().optional(),
  capacity_utilization_rate: z.number().nullable().optional(),
  production_equipment: z.string().nullable().optional(),
  production_lead_time_days: z.number().nullable().optional(),
  can_increase_capacity: z.boolean().optional(),
  available_stock: z.string().nullable().optional(),
  
  // Finances
  annual_turnover: z.number().nullable().optional(),
  export_turnover: z.number().nullable().optional(),
  export_rate: z.number().nullable().optional(),
  
  // Marchés
  target_export_markets: z.array(z.string()).nullable().optional(),
  current_export_markets: z.array(z.string()).nullable().optional(),
  practiced_incoterms: z.array(z.string()).nullable().optional(),
  
  // Certifications
  certifications: z.array(z.string()).nullable().optional(),
  
  // Accompagnement ACIEX
  accompaniment_status: z.string().nullable().optional(),
  accompaniment_type: z.string().nullable().optional(),
  accompaniment_priority: z.string().nullable().optional(),
  assigned_aciex_officer: z.string().nullable().optional(),
  registration_date_aciex: z.string().nullable().optional(),
  first_contact_date: z.string().nullable().optional(),
  initial_diagnostic: z.string().nullable().optional(),
  export_maturity_level: z.string().nullable().optional(),
  
  // Besoins
  support_needed: z.string().nullable().optional(),
  technical_needs: z.string().nullable().optional(),
  financial_needs: z.string().nullable().optional(),
  marketing_needs: z.string().nullable().optional(),
  logistics_needs: z.string().nullable().optional(),
  specific_needs_details: z.string().nullable().optional(),
  needs_priority: z.string().nullable().optional(),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: any;
  onClose: () => void;
}

const FILIERES = [
  "Anacarde",
  "Cacao",
  "Café",
  "Coton",
  "Fruits et légumes",
  "Hévéa",
  "Huile de palme",
  "Karité",
  "Mangue",
  "Noix de coco",
  "Produits halieutiques",
  "Riz",
  "Textile",
  "Transformation alimentaire",
  "Autre"
];

const REGIONS = [
  "Abidjan",
  "Bas-Sassandra",
  "Comoé",
  "Denguélé",
  "Gôh-Djiboua",
  "Lacs",
  "Lagunes",
  "Montagnes",
  "Sassandra-Marahoué",
  "Savanes",
  "Vallée du Bandama",
  "Woroba",
  "Yamoussoukro",
  "Zanzan"
];

export function CompanyDialog({ open, onOpenChange, company, onClose }: CompanyDialogProps) {
  const { toast } = useToast();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      company_name: "",
      rccm_number: "",
      dfe_number: "",
      headquarters_location: "",
      has_export_service: false,
      can_increase_capacity: false,
    },
  });

  useEffect(() => {
    if (company) {
      form.reset({
        company_name: company.company_name || "",
        trade_name: company.trade_name || "",
        sigle: company.sigle || "",
        rccm_number: company.rccm_number || "",
        dfe_number: company.dfe_number || "",
        legal_form: company.legal_form || null,
        company_size: company.company_size || null,
        creation_date: company.creation_date || null,
        headquarters_location: company.headquarters_location || "",
        postal_address: company.postal_address || "",
        postal_code: company.postal_code || "",
        city: company.city || "",
        commune: company.commune || "",
        region: company.region || null,
        gps_latitude: company.gps_latitude || null,
        gps_longitude: company.gps_longitude || null,
        phone: company.phone || "",
        email: company.email || "",
        website: company.website || "",
        facebook_url: company.facebook_url || "",
        linkedin_url: company.linkedin_url || "",
        legal_representative_name: company.legal_representative_name || "",
        legal_representative_gender: company.legal_representative_gender || null,
        legal_representative_phone: company.legal_representative_phone || "",
        legal_representative_email: company.legal_representative_email || "",
        main_contact_name: company.main_contact_name || "",
        main_contact_function: company.main_contact_function || "",
        main_contact_phone: company.main_contact_phone || "",
        main_contact_email: company.main_contact_email || "",
        export_manager_name: company.export_manager_name || "",
        export_manager_phone: company.export_manager_phone || "",
        export_manager_email: company.export_manager_email || "",
        has_export_service: company.has_export_service || false,
        filiere: company.filiere || null,
        activity_sector: company.activity_sector || "",
        sub_sector: company.sub_sector || "",
        products_services: company.products_services || "",
        exported_products: company.exported_products || "",
        total_employees: company.total_employees || null,
        permanent_employees: company.permanent_employees || null,
        seasonal_employees: company.seasonal_employees || null,
        male_employees: company.male_employees || null,
        female_employees: company.female_employees || null,
        managers_count: company.managers_count || null,
        technicians_count: company.technicians_count || null,
        workers_count: company.workers_count || null,
        annual_capacity: company.annual_capacity || null,
        current_production: company.current_production || null,
        capacity_utilization_rate: company.capacity_utilization_rate || null,
        production_equipment: company.production_equipment || "",
        production_lead_time_days: company.production_lead_time_days || null,
        can_increase_capacity: company.can_increase_capacity || false,
        available_stock: company.available_stock || "",
        annual_turnover: company.annual_turnover || null,
        export_turnover: company.export_turnover || null,
        export_rate: company.export_rate || null,
        accompaniment_status: company.accompaniment_status || null,
        accompaniment_type: company.accompaniment_type || null,
        accompaniment_priority: company.accompaniment_priority || null,
        assigned_aciex_officer: company.assigned_aciex_officer || "",
        registration_date_aciex: company.registration_date_aciex || null,
        first_contact_date: company.first_contact_date || null,
        initial_diagnostic: company.initial_diagnostic || "",
        export_maturity_level: company.export_maturity_level || null,
        support_needed: company.support_needed || null,
        technical_needs: company.technical_needs || "",
        financial_needs: company.financial_needs || "",
        marketing_needs: company.marketing_needs || "",
        logistics_needs: company.logistics_needs || "",
        specific_needs_details: company.specific_needs_details || "",
        needs_priority: company.needs_priority || null,
      });
    } else {
      form.reset({
        company_name: "",
        rccm_number: "",
        dfe_number: "",
        headquarters_location: "",
        has_export_service: false,
        can_increase_capacity: false,
      });
    }
  }, [company, form]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      // Nettoyer les données - convertir les chaînes vides en null
      const cleanData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        cleanData[key] = value === "" ? null : value;
      }

      if (company) {
        const { error } = await supabase
          .from("companies")
          .update(cleanData as any)
          .eq("id", company.id);

        if (error) throw error;
        toast({ title: "Opérateur mis à jour avec succès" });
      } else {
        const { error } = await supabase
          .from("companies")
          .insert([cleanData as any]);
        if (error) throw error;
        toast({ title: "Opérateur créé avec succès" });
      }
      
      onClose();
    } catch (error: any) {
      let errorMessage = error.message;
      
      if (error.message?.includes('unique_company_rccm') || error.code === '23505') {
        errorMessage = "Cet opérateur existe déjà (numéro RCCM déjà utilisé).";
      }
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {company ? "Modifier l'opérateur" : "Nouvel opérateur"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="identity" className="w-full">
              <TabsList className="grid w-full grid-cols-6 h-auto">
                <TabsTrigger value="identity" className="flex flex-col items-center gap-1 py-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs">Identité</span>
                </TabsTrigger>
                <TabsTrigger value="location" className="flex flex-col items-center gap-1 py-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs">Localisation</span>
                </TabsTrigger>
                <TabsTrigger value="contacts" className="flex flex-col items-center gap-1 py-2">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Contacts</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex flex-col items-center gap-1 py-2">
                  <Factory className="h-4 w-4" />
                  <span className="text-xs">Activité</span>
                </TabsTrigger>
                <TabsTrigger value="hr" className="flex flex-col items-center gap-1 py-2">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">RH</span>
                </TabsTrigger>
                <TabsTrigger value="support" className="flex flex-col items-center gap-1 py-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-xs">ACIEX</span>
                </TabsTrigger>
              </TabsList>

              {/* IDENTITÉ */}
              <TabsContent value="identity" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raison sociale *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nom de l'entreprise" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trade_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom commercial</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="sigle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sigle</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Ex: SCAB" />
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
                            <SelectItem value="SARLU">SARLU</SelectItem>
                            <SelectItem value="SAS">SAS</SelectItem>
                            <SelectItem value="SASU">SASU</SelectItem>
                            <SelectItem value="SNC">SNC</SelectItem>
                            <SelectItem value="EI">Entreprise Individuelle</SelectItem>
                            <SelectItem value="GIE">GIE</SelectItem>
                            <SelectItem value="Coopérative">Coopérative</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taille</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TPE (1-9)">TPE (1-9)</SelectItem>
                            <SelectItem value="PME (10-49)">PME (10-49)</SelectItem>
                            <SelectItem value="ETI (50-249)">ETI (50-249)</SelectItem>
                            <SelectItem value="Grande entreprise (250+)">GE (250+)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="rccm_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro RCCM *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="CI-ABJ-2024-B-12345" />
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
                        <FormLabel>Compte Contribuable *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1234567 A" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="creation_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de création</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* LOCALISATION */}
              <TabsContent value="location" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="headquarters_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse du siège social *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Rue, quartier, bâtiment..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="commune"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commune</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Cocody" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Abidjan" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Région</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REGIONS.map((region) => (
                              <SelectItem key={region} value={region}>{region}</SelectItem>
                            ))}
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
                    name="postal_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse postale</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="BP 1234 Abidjan" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gps_latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude GPS</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.000001"
                            {...field}
                            value={field.value ?? ""} 
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="5.3600" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gps_longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude GPS</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.000001"
                            {...field}
                            value={field.value ?? ""} 
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="-3.9800" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* CONTACTS */}
              <TabsContent value="contacts" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="+225 00 00 00 00 00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} type="email" placeholder="contact@entreprise.ci" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site web</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="www.entreprise.ci" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkedin_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="linkedin.com/company/..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">Représentant légal</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="legal_representative_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="legal_representative_gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="M">Masculin</SelectItem>
                              <SelectItem value="F">Féminin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <FormField
                      control={form.control}
                      name="legal_representative_phone"
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
                    <FormField
                      control={form.control}
                      name="legal_representative_email"
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
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">Contact principal</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="main_contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="main_contact_function"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fonction</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="Directeur commercial" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <FormField
                      control={form.control}
                      name="main_contact_phone"
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
                    <FormField
                      control={form.control}
                      name="main_contact_email"
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
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Responsable Export</h4>
                    <FormField
                      control={form.control}
                      name="has_export_service"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0 text-sm">Service export dédié</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="export_manager_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="export_manager_phone"
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
                    <FormField
                      control={form.control}
                      name="export_manager_email"
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
                  </div>
                </div>
              </TabsContent>

              {/* ACTIVITÉ */}
              <TabsContent value="activity" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="filiere"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Filière</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la filière" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FILIERES.map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="activity_sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secteur d'activité</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Agroalimentaire, Industrie..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="products_services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produits / Services</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="Description des produits et services..." />
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
                        <Textarea {...field} value={field.value || ""} placeholder="Liste des produits exportés..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Capacité de production</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="annual_capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacité annuelle (tonnes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="current_production"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Production actuelle</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="capacity_utilization_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taux d'utilisation (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="0"
                              max="100"
                              {...field}
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <FormField
                      control={form.control}
                      name="can_increase_capacity"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Peut augmenter la capacité</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Finances</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="annual_turnover"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CA annuel (FCFA)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="export_turnover"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CA export (FCFA)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="export_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taux export (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="0"
                              max="100"
                              {...field}
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* RESSOURCES HUMAINES */}
              <TabsContent value="hr" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="total_employees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Effectif total</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field}
                            value={field.value ?? ""} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permanent_employees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanents</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field}
                            value={field.value ?? ""} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seasonal_employees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saisonniers</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field}
                            value={field.value ?? ""} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="male_employees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hommes</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field}
                            value={field.value ?? ""} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="female_employees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Femmes</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field}
                            value={field.value ?? ""} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Répartition par catégorie</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="managers_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cadres</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="technicians_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Techniciens</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="workers_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ouvriers</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* ACCOMPAGNEMENT ACIEX */}
              <TabsContent value="support" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="accompaniment_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut accompagnement</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="prospect">Prospect</SelectItem>
                            <SelectItem value="en_cours">En cours</SelectItem>
                            <SelectItem value="actif">Actif</SelectItem>
                            <SelectItem value="suspendu">Suspendu</SelectItem>
                            <SelectItem value="termine">Terminé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accompaniment_priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priorité</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="haute">Haute</SelectItem>
                            <SelectItem value="moyenne">Moyenne</SelectItem>
                            <SelectItem value="basse">Basse</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="export_maturity_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maturité export</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="debutant">Débutant</SelectItem>
                            <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                            <SelectItem value="confirme">Confirmé</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
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
                    name="registration_date_aciex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date inscription ACIEX</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="first_contact_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date premier contact</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assigned_aciex_officer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent ACIEX assigné</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Nom de l'agent" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initial_diagnostic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnostic initial</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="Résumé du diagnostic initial..." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Besoins identifiés</h4>
                  <div className="grid grid-cols-2 gap-4">
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
                              <SelectItem value="Information">Information</SelectItem>
                              <SelectItem value="Formation">Formation</SelectItem>
                              <SelectItem value="Financement">Financement</SelectItem>
                              <SelectItem value="Accompagnement technique">Accompagnement technique</SelectItem>
                              <SelectItem value="Mise en relation">Mise en relation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="needs_priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priorité besoins</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="important">Important</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="specific_needs_details"
                    render={({ field }) => (
                      <FormItem className="mt-3">
                        <FormLabel>Détails des besoins</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} placeholder="Décrivez les besoins spécifiques..." rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
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
