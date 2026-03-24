import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, FileText, Shield, ExternalLink, Clock, DollarSign, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { sanitizeFilterValue } from "@/lib/utils";

interface RegulatoryRequirement {
  id: string;
  country: string;
  region: string | null;
  sector: string | null;
  product_category: string | null;
  requirement_type: string;
  title: string;
  description: string | null;
  mandatory: boolean;
  issuing_authority: string | null;
  authority_contact: string | null;
  authority_website: string | null;
  validity_period: string | null;
  cost_estimate: number | null;
  currency: string;
  processing_time: string | null;
  documents_required: string[] | null;
  useful_links: string[] | null;
  notes: string | null;
  last_updated: string;
  created_at: string;
}

interface RegulatoryRequirementsTabProps {
  canManage: boolean;
}

const requirementTypes: Record<string, string> = {
  certification: "Certification",
  norme: "Norme",
  phytosanitaire: "Phytosanitaire",
  sanitaire: "Sanitaire",
  douane: "Douane",
  quotas: "Quotas",
  licence: "Licence",
  autre: "Autre",
};

const typeColors: Record<string, string> = {
  certification: "bg-blue-100 text-blue-800",
  norme: "bg-purple-100 text-purple-800",
  phytosanitaire: "bg-green-100 text-green-800",
  sanitaire: "bg-red-100 text-red-800",
  douane: "bg-yellow-100 text-yellow-800",
  quotas: "bg-orange-100 text-orange-800",
  licence: "bg-indigo-100 text-indigo-800",
  autre: "bg-gray-100 text-gray-800",
};

export function RegulatoryRequirementsTab({ canManage }: RegulatoryRequirementsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<RegulatoryRequirement | null>(null);
  const [formData, setFormData] = useState({
    country: "",
    region: "",
    sector: "",
    product_category: "",
    requirement_type: "certification",
    title: "",
    description: "",
    mandatory: true,
    issuing_authority: "",
    authority_contact: "",
    authority_website: "",
    validity_period: "",
    cost_estimate: "",
    currency: "EUR",
    processing_time: "",
    documents_required: "",
    useful_links: "",
    notes: "",
  });

  const { data: requirements = [], isLoading } = useQuery({
    queryKey: ["regulatory-requirements", searchTerm, countryFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("regulatory_requirements")
        .select("*")
        .order("country", { ascending: true });

      if (searchTerm) {
        query = query.or(`title.ilike.%${sanitizeFilterValue(searchTerm)}%,country.ilike.%${sanitizeFilterValue(searchTerm)}%,sector.ilike.%${sanitizeFilterValue(searchTerm)}%`);
      }
      if (countryFilter !== "all") {
        query = query.eq("country", countryFilter);
      }
      if (typeFilter !== "all") {
        query = query.eq("requirement_type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RegulatoryRequirement[];
    },
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["requirement-countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regulatory_requirements")
        .select("country")
        .not("country", "is", null);
      
      if (error) throw error;
      return Array.from(new Set(data.map(r => r.country))).sort();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("regulatory_requirements").insert([{
        country: data.country,
        region: data.region || null,
        sector: data.sector || null,
        product_category: data.product_category || null,
        requirement_type: data.requirement_type,
        title: data.title,
        description: data.description || null,
        mandatory: data.mandatory,
        issuing_authority: data.issuing_authority || null,
        authority_contact: data.authority_contact || null,
        authority_website: data.authority_website || null,
        validity_period: data.validity_period || null,
        cost_estimate: data.cost_estimate ? parseFloat(data.cost_estimate) : null,
        currency: data.currency,
        processing_time: data.processing_time || null,
        documents_required: data.documents_required ? data.documents_required.split("\n").filter(s => s.trim()) : null,
        useful_links: data.useful_links ? data.useful_links.split("\n").filter(s => s.trim()) : null,
        notes: data.notes || null,
        created_by: user.user?.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Exigence créée avec succès" });
      queryClient.invalidateQueries({ queryKey: ["regulatory-requirements"] });
      queryClient.invalidateQueries({ queryKey: ["requirement-countries"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { id, ...rest } = data;
      const { error } = await supabase.from("regulatory_requirements").update({
        country: rest.country,
        region: rest.region || null,
        sector: rest.sector || null,
        product_category: rest.product_category || null,
        requirement_type: rest.requirement_type,
        title: rest.title,
        description: rest.description || null,
        mandatory: rest.mandatory,
        issuing_authority: rest.issuing_authority || null,
        authority_contact: rest.authority_contact || null,
        authority_website: rest.authority_website || null,
        validity_period: rest.validity_period || null,
        cost_estimate: rest.cost_estimate ? parseFloat(rest.cost_estimate) : null,
        currency: rest.currency,
        processing_time: rest.processing_time || null,
        documents_required: rest.documents_required ? rest.documents_required.split("\n").filter(s => s.trim()) : null,
        useful_links: rest.useful_links ? rest.useful_links.split("\n").filter(s => s.trim()) : null,
        notes: rest.notes || null,
        last_updated: new Date().toISOString().split("T")[0],
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Exigence mise à jour" });
      queryClient.invalidateQueries({ queryKey: ["regulatory-requirements"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("regulatory_requirements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Exigence supprimée" });
      queryClient.invalidateQueries({ queryKey: ["regulatory-requirements"] });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      country: "",
      region: "",
      sector: "",
      product_category: "",
      requirement_type: "certification",
      title: "",
      description: "",
      mandatory: true,
      issuing_authority: "",
      authority_contact: "",
      authority_website: "",
      validity_period: "",
      cost_estimate: "",
      currency: "EUR",
      processing_time: "",
      documents_required: "",
      useful_links: "",
      notes: "",
    });
    setSelectedRequirement(null);
  };

  const handleEdit = (requirement: RegulatoryRequirement) => {
    setSelectedRequirement(requirement);
    setFormData({
      country: requirement.country,
      region: requirement.region || "",
      sector: requirement.sector || "",
      product_category: requirement.product_category || "",
      requirement_type: requirement.requirement_type,
      title: requirement.title,
      description: requirement.description || "",
      mandatory: requirement.mandatory,
      issuing_authority: requirement.issuing_authority || "",
      authority_contact: requirement.authority_contact || "",
      authority_website: requirement.authority_website || "",
      validity_period: requirement.validity_period || "",
      cost_estimate: requirement.cost_estimate?.toString() || "",
      currency: requirement.currency,
      processing_time: requirement.processing_time || "",
      documents_required: requirement.documents_required?.join("\n") || "",
      useful_links: requirement.useful_links?.join("\n") || "",
      notes: requirement.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.country || !formData.title || !formData.requirement_type) {
      toast({ title: "Erreur", description: "Veuillez remplir les champs obligatoires", variant: "destructive" });
      return;
    }
    if (selectedRequirement) {
      updateMutation.mutate({ ...formData, id: selectedRequirement.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Group requirements by country
  const groupedRequirements = requirements.reduce((acc, req) => {
    if (!acc[req.country]) {
      acc[req.country] = [];
    }
    acc[req.country].push(req);
    return acc;
  }, {} as Record<string, RegulatoryRequirement[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pays" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les pays</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(requirementTypes).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle exigence
          </Button>
        )}
      </div>

      {isLoading ? (
        <p>Chargement...</p>
      ) : requirements.length === 0 ? (
        <Card className="p-8 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune exigence réglementaire trouvée</p>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {Object.entries(groupedRequirements).map(([country, reqs]) => (
            <AccordionItem key={country} value={country} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{country}</span>
                  <Badge variant="secondary">{reqs.length} exigence{reqs.length > 1 ? "s" : ""}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {reqs.map((req) => (
                    <Card key={req.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2 items-center">
                            <Badge className={typeColors[req.requirement_type]}>
                              {requirementTypes[req.requirement_type]}
                            </Badge>
                            {req.mandatory && <Badge variant="destructive">Obligatoire</Badge>}
                          </div>
                          {canManage && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(req)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm("Supprimer cette exigence ?")) {
                                    deleteMutation.mutate(req.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg">{req.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {req.description && (
                          <p className="text-sm text-muted-foreground">{req.description}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {req.sector && (
                            <div>
                              <span className="text-muted-foreground">Secteur:</span>
                              <p>{req.sector}</p>
                            </div>
                          )}
                          {req.issuing_authority && (
                            <div>
                              <span className="text-muted-foreground">Autorité:</span>
                              <p>{req.issuing_authority}</p>
                            </div>
                          )}
                          {req.processing_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{req.processing_time}</span>
                            </div>
                          )}
                          {req.cost_estimate && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>{req.cost_estimate.toLocaleString()} {req.currency}</span>
                            </div>
                          )}
                        </div>
                        {req.documents_required && req.documents_required.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">Documents requis:</span>
                            <ul className="list-disc list-inside text-sm mt-1">
                              {req.documents_required.map((doc, i) => (
                                <li key={i}>{doc}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {req.authority_website && (
                          <a
                            href={req.authority_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Site officiel
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Dernière mise à jour: {format(new Date(req.last_updated), "dd/MM/yyyy")}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRequirement ? "Modifier l'exigence" : "Nouvelle exigence réglementaire"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pays *</Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Région</Label>
              <Input
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Titre *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={formData.requirement_type} onValueChange={(v) => setFormData({ ...formData, requirement_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(requirementTypes).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Secteur</Label>
              <Input
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie produit</Label>
              <Input
                value={formData.product_category}
                onChange={(e) => setFormData({ ...formData, product_category: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.mandatory}
                onCheckedChange={(checked) => setFormData({ ...formData, mandatory: checked })}
              />
              <Label>Obligatoire</Label>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Autorité délivrante</Label>
              <Input
                value={formData.issuing_authority}
                onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Site web autorité</Label>
              <Input
                value={formData.authority_website}
                onChange={(e) => setFormData({ ...formData, authority_website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Délai de traitement</Label>
              <Input
                value={formData.processing_time}
                onChange={(e) => setFormData({ ...formData, processing_time: e.target.value })}
                placeholder="ex: 2-4 semaines"
              />
            </div>
            <div className="space-y-2">
              <Label>Durée de validité</Label>
              <Input
                value={formData.validity_period}
                onChange={(e) => setFormData({ ...formData, validity_period: e.target.value })}
                placeholder="ex: 1 an"
              />
            </div>
            <div className="space-y-2">
              <Label>Coût estimé</Label>
              <Input
                type="number"
                value={formData.cost_estimate}
                onChange={(e) => setFormData({ ...formData, cost_estimate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Devise</Label>
              <Input
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Documents requis (un par ligne)</Label>
              <Textarea
                value={formData.documents_required}
                onChange={(e) => setFormData({ ...formData, documents_required: e.target.value })}
                rows={3}
                placeholder="Certificat d'origine&#10;Facture commerciale&#10;Liste de colisage"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Liens utiles (un par ligne)</Label>
              <Textarea
                value={formData.useful_links}
                onChange={(e) => setFormData({ ...formData, useful_links: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {selectedRequirement ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
