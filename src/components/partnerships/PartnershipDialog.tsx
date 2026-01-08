import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserDirection } from "@/hooks/useUserDirection";

interface PartnershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnership?: any;
  onClose: () => void;
}

const PARTNER_TYPES = [
  "Convention",
  "Accord-cadre",
  "Protocole d'accord (MoU)",
  "Mémorandum",
  "Lettre d'intention",
  "PTF",
  "Entreprise",
  "ONG",
  "Institution publique",
  "Organisation internationale"
];

const ORGANIZATION_TYPES = [
  "Gouvernement",
  "Organisation internationale",
  "ONG",
  "Entreprise privée",
  "Institution financière",
  "Université/Centre de recherche",
  "Chambre de commerce",
  "Association professionnelle"
];

const LIFECYCLE_STAGES = [
  { value: "identification", label: "Identification" },
  { value: "negociation", label: "Négociation" },
  { value: "signature", label: "Signature" },
  { value: "mise_en_oeuvre", label: "Mise en œuvre" },
  { value: "suivi", label: "Suivi" },
  { value: "renouvellement", label: "Renouvellement" },
  { value: "cloture", label: "Clôture" }
];

const STATUSES = [
  { value: "prospection", label: "Prospection" },
  { value: "en négociation", label: "En négociation" },
  { value: "signé", label: "Signé" },
  { value: "actif", label: "Actif" },
  { value: "suspendu", label: "Suspendu" },
  { value: "expiré", label: "Expiré" },
  { value: "renouvelé", label: "Renouvelé" },
  { value: "résilié", label: "Résilié" }
];

const DOMAINS = [
  "Export",
  "Formation",
  "Financement",
  "Technique",
  "Événementiel",
  "Recherche",
  "Marketing"
];

// Map partnership status to project status
const mapPartnershipStatusToProjectStatus = (partnershipStatus: string): string => {
  const statusMap: Record<string, string> = {
    'prospection': 'planifié',
    'en négociation': 'planifié',
    'signé': 'en cours',
    'actif': 'en cours',
    'suspendu': 'en pause',
    'expiré': 'terminé',
    'renouvelé': 'en cours',
    'résilié': 'annulé'
  };
  return statusMap[partnershipStatus] || 'planifié';
};

export function PartnershipDialog({ open, onOpenChange, partnership, onClose }: PartnershipDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const { data: userDirection } = useUserDirection();
  
  const [formData, setFormData] = useState<any>({
    partner_name: "",
    partner_type: "",
    organization_type: "",
    partner_country: "",
    partner_sector: "",
    partner_website: "",
    description: "",
    lifecycle_stage: "identification",
    status: "prospection",
    start_date: "",
    end_date: "",
    signature_date: "",
    renewal_conditions: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    aciex_focal_point: "",
    aciex_focal_email: "",
    aciex_focal_phone: "",
    strategic_objectives: "",
    target_beneficiaries: "",
    expected_results: "",
    aciex_responsibilities: "",
    partner_responsibilities: "",
    resources_provided: "",
    deliverables_schedule: "",
    confidentiality_clauses: "",
    budget: "",
    partner_contribution: "",
    in_kind_contribution: "",
    disbursement_terms: "",
    direction_id: "",
  });

  const { data: directions = [] } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directions")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: linkedProjects = [] } = useQuery({
    queryKey: ["partnership-projects", partnership?.id],
    queryFn: async () => {
      if (!partnership?.id) return [];
      const { data, error } = await supabase
        .from("partnership_projects")
        .select("project_id")
        .eq("partnership_id", partnership.id);
      if (error) throw error;
      return data.map(p => p.project_id);
    },
    enabled: !!partnership?.id,
  });

  useEffect(() => {
    if (partnership) {
      setFormData({
        partner_name: partnership.partner_name || "",
        partner_type: partnership.partner_type || "",
        organization_type: partnership.organization_type || "",
        partner_country: partnership.partner_country || "",
        partner_sector: partnership.partner_sector || "",
        partner_website: partnership.partner_website || "",
        description: partnership.description || "",
        lifecycle_stage: partnership.lifecycle_stage || "identification",
        status: partnership.status || "prospection",
        start_date: partnership.start_date || "",
        end_date: partnership.end_date || "",
        signature_date: partnership.signature_date || "",
        renewal_conditions: partnership.renewal_conditions || "",
        contact_person: partnership.contact_person || "",
        contact_email: partnership.contact_email || "",
        contact_phone: partnership.contact_phone || "",
        aciex_focal_point: partnership.aciex_focal_point || "",
        aciex_focal_email: partnership.aciex_focal_email || "",
        aciex_focal_phone: partnership.aciex_focal_phone || "",
        strategic_objectives: partnership.strategic_objectives || "",
        target_beneficiaries: partnership.target_beneficiaries || "",
        expected_results: partnership.expected_results || "",
        aciex_responsibilities: partnership.aciex_responsibilities || "",
        partner_responsibilities: partnership.partner_responsibilities || "",
        resources_provided: partnership.resources_provided || "",
        deliverables_schedule: partnership.deliverables_schedule || "",
        confidentiality_clauses: partnership.confidentiality_clauses || "",
        budget: partnership.budget?.toString() || "",
        partner_contribution: partnership.partner_contribution?.toString() || "",
        in_kind_contribution: partnership.in_kind_contribution || "",
        disbursement_terms: partnership.disbursement_terms || "",
        direction_id: partnership.direction_id || "",
      });
      setSelectedDomains(partnership.domains || []);
    } else {
      setFormData({
        partner_name: "",
        partner_type: "",
        organization_type: "",
        partner_country: "",
        partner_sector: "",
        partner_website: "",
        description: "",
        lifecycle_stage: "identification",
        status: "prospection",
        start_date: "",
        end_date: "",
        signature_date: "",
        renewal_conditions: "",
        contact_person: "",
        contact_email: "",
        contact_phone: "",
        aciex_focal_point: "",
        aciex_focal_email: "",
        aciex_focal_phone: "",
        strategic_objectives: "",
        target_beneficiaries: "",
        expected_results: "",
        aciex_responsibilities: "",
        partner_responsibilities: "",
        resources_provided: "",
        deliverables_schedule: "",
        confidentiality_clauses: "",
        budget: "",
        partner_contribution: "",
        in_kind_contribution: "",
        disbursement_terms: "",
        direction_id: userDirection?.direction_id || "",
      });
      setSelectedProjects([]);
      setSelectedDomains([]);
    }
  }, [partnership, userDirection]);

  useEffect(() => {
    if (linkedProjects.length > 0) {
      setSelectedProjects(linkedProjects);
    }
  }, [linkedProjects.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const directionId =
        formData.direction_id || partnership?.direction_id || userDirection?.direction_id;

      if (!directionId) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Direction non définie. Veuillez sélectionner une direction.",
        });
        setLoading(false);
        return;
      }

      const dataToSave = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        partner_contribution: formData.partner_contribution ? parseFloat(formData.partner_contribution) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        signature_date: formData.signature_date || null,
        direction_id: directionId,
        domains: selectedDomains,
      };

      let partnershipId: string;

      if (partnership) {
        const { error } = await supabase
          .from("partnerships")
          .update(dataToSave)
          .eq("id", partnership.id);

        if (error) throw error;
        partnershipId = partnership.id;
      } else {
        const { data, error } = await supabase
          .from("partnerships")
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
        partnershipId = data.id;

        // Automatically create a project for this partnership
        const projectData = {
          name: `Partenariat: ${formData.partner_name}`,
          description: formData.description || `Projet lié au partenariat avec ${formData.partner_name}`,
          direction_id: directionId,
          status: mapPartnershipStatusToProjectStatus(formData.status),
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          project_type: 'partenariat',
          priority_level: '3' as const, // Medium priority
        };

        const { data: projectResult, error: projectError } = await supabase
          .from("projects")
          .insert([projectData])
          .select()
          .single();

        if (projectError) {
          console.error("Erreur lors de la création du projet associé:", projectError);
        } else {
          // Link the partnership to the project
          const { error: linkError } = await supabase
            .from("partnership_projects")
            .insert([{
              partnership_id: partnershipId,
              project_id: projectResult.id,
            }]);

          if (linkError) {
            console.error("Erreur lors du lien partenariat-projet:", linkError);
          }
        }
      }

      // For updates, manage selected projects
      if (partnership) {
        // Delete existing project links
        await supabase
          .from("partnership_projects")
          .delete()
          .eq("partnership_id", partnershipId);

        // Insert new project links
        if (selectedProjects.length > 0) {
          const projectLinks = selectedProjects.map(projectId => ({
            partnership_id: partnershipId,
            project_id: projectId,
          }));

          const { error: linkError } = await supabase
            .from("partnership_projects")
            .insert(projectLinks);

          if (linkError) throw linkError;
        }
      }

      toast({ 
        title: partnership ? "Partenariat mis à jour avec succès" : "Partenariat créé avec succès (projet associé créé automatiquement)"
      });
      onClose();
    } catch (error: any) {
      let errorMessage = error.message;
      
      if (error.message?.includes('unique_partnership') || error.code === '23505') {
        errorMessage = "Ce partenariat existe déjà (même nom et direction). Veuillez modifier les informations.";
      }
      
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {partnership ? "Modifier le partenariat" : "Nouveau partenariat"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="objectifs">Objectifs</TabsTrigger>
              <TabsTrigger value="engagements">Engagements</TabsTrigger>
              <TabsTrigger value="finances">Finances</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="partner_name">Nom du partenaire *</Label>
                  <Input
                    id="partner_name"
                    value={formData.partner_name}
                    onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner_type">Type de partenariat</Label>
                  <Select
                    value={formData.partner_type}
                    onValueChange={(value) => setFormData({ ...formData, partner_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTNER_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization_type">Type d'organisation</Label>
                  <Select
                    value={formData.organization_type}
                    onValueChange={(value) => setFormData({ ...formData, organization_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANIZATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner_country">Pays</Label>
                  <Input
                    id="partner_country"
                    value={formData.partner_country}
                    onChange={(e) => setFormData({ ...formData, partner_country: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner_sector">Secteur</Label>
                  <Input
                    id="partner_sector"
                    value={formData.partner_sector}
                    onChange={(e) => setFormData({ ...formData, partner_sector: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner_website">Site web</Label>
                  <Input
                    id="partner_website"
                    type="url"
                    value={formData.partner_website}
                    onChange={(e) => setFormData({ ...formData, partner_website: e.target.value })}
                    placeholder="https://..."
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
                      {directions.map((direction) => (
                        <SelectItem key={direction.id} value={direction.id}>
                          {direction.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lifecycle_stage">Étape du cycle de vie</Label>
                  <Select
                    value={formData.lifecycle_stage}
                    onValueChange={(value) => setFormData({ ...formData, lifecycle_stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LIFECYCLE_STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Description de l'organisation</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature_date">Date de signature</Label>
                  <Input
                    id="signature_date"
                    type="date"
                    value={formData.signature_date}
                    onChange={(e) => setFormData({ ...formData, signature_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Date de début</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Date d'échéance</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="renewal_conditions">Conditions de renouvellement</Label>
                  <Input
                    id="renewal_conditions"
                    value={formData.renewal_conditions}
                    onChange={(e) => setFormData({ ...formData, renewal_conditions: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Domaines d'intervention</Label>
                  <div className="flex flex-wrap gap-4 p-3 border rounded-md">
                    {DOMAINS.map((domain) => (
                      <div key={domain} className="flex items-center space-x-2">
                        <Checkbox
                          id={`domain-${domain}`}
                          checked={selectedDomains.includes(domain)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDomains([...selectedDomains, domain]);
                            } else {
                              setSelectedDomains(selectedDomains.filter(d => d !== domain));
                            }
                          }}
                        />
                        <Label htmlFor={`domain-${domain}`} className="text-sm font-normal cursor-pointer">
                          {domain}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-primary">Point focal Partenaire</h4>
                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Nom</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Téléphone</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-primary">Point focal ACIEX</h4>
                  <div className="space-y-2">
                    <Label htmlFor="aciex_focal_point">Nom</Label>
                    <Input
                      id="aciex_focal_point"
                      value={formData.aciex_focal_point}
                      onChange={(e) => setFormData({ ...formData, aciex_focal_point: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aciex_focal_email">Email</Label>
                    <Input
                      id="aciex_focal_email"
                      type="email"
                      value={formData.aciex_focal_email}
                      onChange={(e) => setFormData({ ...formData, aciex_focal_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aciex_focal_phone">Téléphone</Label>
                    <Input
                      id="aciex_focal_phone"
                      value={formData.aciex_focal_phone}
                      onChange={(e) => setFormData({ ...formData, aciex_focal_phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Projets liés</Label>
                <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                  {projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun projet disponible</p>
                  ) : (
                    projects.map((project) => (
                      <div key={project.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`project-${project.id}`}
                          checked={selectedProjects.includes(project.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProjects([...selectedProjects, project.id]);
                            } else {
                              setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`project-${project.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {project.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="objectifs" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="strategic_objectives">Objectifs stratégiques</Label>
                <Textarea
                  id="strategic_objectives"
                  value={formData.strategic_objectives}
                  onChange={(e) => setFormData({ ...formData, strategic_objectives: e.target.value })}
                  rows={4}
                  placeholder="Décrivez les objectifs principaux du partenariat..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_beneficiaries">Bénéficiaires visés</Label>
                <Textarea
                  id="target_beneficiaries"
                  value={formData.target_beneficiaries}
                  onChange={(e) => setFormData({ ...formData, target_beneficiaries: e.target.value })}
                  rows={3}
                  placeholder="Qui sont les bénéficiaires du partenariat..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_results">Résultats attendus</Label>
                <Textarea
                  id="expected_results"
                  value={formData.expected_results}
                  onChange={(e) => setFormData({ ...formData, expected_results: e.target.value })}
                  rows={4}
                  placeholder="Quels sont les résultats attendus..."
                />
              </div>
            </TabsContent>

            <TabsContent value="engagements" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aciex_responsibilities">Responsabilités ACIEX</Label>
                  <Textarea
                    id="aciex_responsibilities"
                    value={formData.aciex_responsibilities}
                    onChange={(e) => setFormData({ ...formData, aciex_responsibilities: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner_responsibilities">Responsabilités du partenaire</Label>
                  <Textarea
                    id="partner_responsibilities"
                    value={formData.partner_responsibilities}
                    onChange={(e) => setFormData({ ...formData, partner_responsibilities: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resources_provided">Ressources mises à disposition</Label>
                <Textarea
                  id="resources_provided"
                  value={formData.resources_provided}
                  onChange={(e) => setFormData({ ...formData, resources_provided: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliverables_schedule">Calendrier des livrables</Label>
                <Textarea
                  id="deliverables_schedule"
                  value={formData.deliverables_schedule}
                  onChange={(e) => setFormData({ ...formData, deliverables_schedule: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidentiality_clauses">Clauses de confidentialité</Label>
                <Textarea
                  id="confidentiality_clauses"
                  value={formData.confidentiality_clauses}
                  onChange={(e) => setFormData({ ...formData, confidentiality_clauses: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="finances" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget total ACIEX (FCFA)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner_contribution">Contribution partenaire (FCFA)</Label>
                  <Input
                    id="partner_contribution"
                    type="number"
                    value={formData.partner_contribution}
                    onChange={(e) => setFormData({ ...formData, partner_contribution: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="in_kind_contribution">Contributions en nature</Label>
                <Textarea
                  id="in_kind_contribution"
                  value={formData.in_kind_contribution}
                  onChange={(e) => setFormData({ ...formData, in_kind_contribution: e.target.value })}
                  rows={3}
                  placeholder="Expertise technique, locaux, équipements..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disbursement_terms">Modalités de décaissement</Label>
                <Textarea
                  id="disbursement_terms"
                  value={formData.disbursement_terms}
                  onChange={(e) => setFormData({ ...formData, disbursement_terms: e.target.value })}
                  rows={3}
                />
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
