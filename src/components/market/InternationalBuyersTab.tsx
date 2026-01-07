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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Search, Building2, Mail, Phone, Globe, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface InternationalBuyer {
  id: string;
  organization_name: string;
  country: string;
  region: string | null;
  sector: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  position: string | null;
  purchase_volume: string | null;
  purchase_frequency: string | null;
  products_interested: string[] | null;
  quality_requirements: string | null;
  certifications_required: string[] | null;
  payment_terms: string | null;
  preferred_incoterms: string | null;
  website: string | null;
  notes: string | null;
  status: string;
  last_contact_date: string | null;
  created_at: string;
}

interface InternationalBuyersTabProps {
  canManage: boolean;
}

const statusLabels: Record<string, string> = {
  prospect: "Prospect",
  contact_etabli: "Contact établi",
  negociation: "En négociation",
  partenaire_actif: "Partenaire actif",
  inactif: "Inactif",
};

const statusColors: Record<string, string> = {
  prospect: "bg-gray-100 text-gray-800",
  contact_etabli: "bg-blue-100 text-blue-800",
  negociation: "bg-yellow-100 text-yellow-800",
  partenaire_actif: "bg-green-100 text-green-800",
  inactif: "bg-red-100 text-red-800",
};

export function InternationalBuyersTab({ canManage }: InternationalBuyersTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<InternationalBuyer | null>(null);
  const [formData, setFormData] = useState({
    organization_name: "",
    country: "",
    region: "",
    sector: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    position: "",
    purchase_volume: "",
    purchase_frequency: "",
    products_interested: "",
    quality_requirements: "",
    certifications_required: "",
    payment_terms: "",
    preferred_incoterms: "",
    website: "",
    notes: "",
    status: "prospect",
  });

  const { data: buyers = [], isLoading } = useQuery({
    queryKey: ["international-buyers", searchTerm, statusFilter, countryFilter],
    queryFn: async () => {
      let query = supabase
        .from("international_buyers")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`organization_name.ilike.%${searchTerm}%,contact_name.ilike.%${searchTerm}%,sector.ilike.%${searchTerm}%`);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (countryFilter !== "all") {
        query = query.eq("country", countryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InternationalBuyer[];
    },
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["buyer-countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("international_buyers")
        .select("country")
        .not("country", "is", null);
      
      if (error) throw error;
      return Array.from(new Set(data.map(b => b.country))).sort();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("international_buyers").insert([{
        ...data,
        products_interested: data.products_interested ? data.products_interested.split(",").map(s => s.trim()) : null,
        certifications_required: data.certifications_required ? data.certifications_required.split(",").map(s => s.trim()) : null,
        created_by: user.user?.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Acheteur créé avec succès" });
      queryClient.invalidateQueries({ queryKey: ["international-buyers"] });
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
      const { error } = await supabase.from("international_buyers").update({
        ...rest,
        products_interested: rest.products_interested ? rest.products_interested.split(",").map(s => s.trim()) : null,
        certifications_required: rest.certifications_required ? rest.certifications_required.split(",").map(s => s.trim()) : null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Acheteur mis à jour avec succès" });
      queryClient.invalidateQueries({ queryKey: ["international-buyers"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("international_buyers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Acheteur supprimé" });
      queryClient.invalidateQueries({ queryKey: ["international-buyers"] });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      organization_name: "",
      country: "",
      region: "",
      sector: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      position: "",
      purchase_volume: "",
      purchase_frequency: "",
      products_interested: "",
      quality_requirements: "",
      certifications_required: "",
      payment_terms: "",
      preferred_incoterms: "",
      website: "",
      notes: "",
      status: "prospect",
    });
    setSelectedBuyer(null);
  };

  const handleEdit = (buyer: InternationalBuyer) => {
    setSelectedBuyer(buyer);
    setFormData({
      organization_name: buyer.organization_name,
      country: buyer.country,
      region: buyer.region || "",
      sector: buyer.sector,
      contact_name: buyer.contact_name || "",
      contact_email: buyer.contact_email || "",
      contact_phone: buyer.contact_phone || "",
      position: buyer.position || "",
      purchase_volume: buyer.purchase_volume || "",
      purchase_frequency: buyer.purchase_frequency || "",
      products_interested: buyer.products_interested?.join(", ") || "",
      quality_requirements: buyer.quality_requirements || "",
      certifications_required: buyer.certifications_required?.join(", ") || "",
      payment_terms: buyer.payment_terms || "",
      preferred_incoterms: buyer.preferred_incoterms || "",
      website: buyer.website || "",
      notes: buyer.notes || "",
      status: buyer.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.organization_name || !formData.country || !formData.sector) {
      toast({ title: "Erreur", description: "Veuillez remplir les champs obligatoires", variant: "destructive" });
      return;
    }
    if (selectedBuyer) {
      updateMutation.mutate({ ...formData, id: selectedBuyer.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un acheteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        </div>
        {canManage && (
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel acheteur
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Acheteurs internationaux ({buyers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : buyers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun acheteur trouvé</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead>Secteur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buyers.map((buyer) => (
                  <TableRow key={buyer.id}>
                    <TableCell className="font-medium">{buyer.organization_name}</TableCell>
                    <TableCell>{buyer.country}</TableCell>
                    <TableCell>{buyer.sector}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {buyer.contact_name && <div>{buyer.contact_name}</div>}
                        {buyer.contact_email && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {buyer.contact_email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[buyer.status]}>
                        {statusLabels[buyer.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setSelectedBuyer(buyer); setDetailsDialogOpen(true); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManage && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(buyer)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("Supprimer cet acheteur ?")) {
                                  deleteMutation.mutate(buyer.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBuyer ? "Modifier l'acheteur" : "Nouvel acheteur international"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Organisation *</Label>
              <Input
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
              />
            </div>
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
            <div className="space-y-2">
              <Label>Secteur *</Label>
              <Input
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nom du contact</Label>
              <Input
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Poste</Label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Volume d'achat</Label>
              <Input
                value={formData.purchase_volume}
                onChange={(e) => setFormData({ ...formData, purchase_volume: e.target.value })}
                placeholder="ex: 100 tonnes/an"
              />
            </div>
            <div className="space-y-2">
              <Label>Fréquence d'achat</Label>
              <Input
                value={formData.purchase_frequency}
                onChange={(e) => setFormData({ ...formData, purchase_frequency: e.target.value })}
                placeholder="ex: Mensuel"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Produits intéressés (séparés par virgule)</Label>
              <Input
                value={formData.products_interested}
                onChange={(e) => setFormData({ ...formData, products_interested: e.target.value })}
                placeholder="Cacao, Café, Noix de cajou"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Certifications requises (séparées par virgule)</Label>
              <Input
                value={formData.certifications_required}
                onChange={(e) => setFormData({ ...formData, certifications_required: e.target.value })}
                placeholder="ISO 22000, Bio, Fairtrade"
              />
            </div>
            <div className="space-y-2">
              <Label>Conditions de paiement</Label>
              <Input
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                placeholder="ex: LC à 30 jours"
              />
            </div>
            <div className="space-y-2">
              <Label>Incoterms préférés</Label>
              <Input
                value={formData.preferred_incoterms}
                onChange={(e) => setFormData({ ...formData, preferred_incoterms: e.target.value })}
                placeholder="ex: FOB, CIF"
              />
            </div>
            <div className="space-y-2">
              <Label>Site web</Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Exigences qualité</Label>
              <Textarea
                value={formData.quality_requirements}
                onChange={(e) => setFormData({ ...formData, quality_requirements: e.target.value })}
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
              {selectedBuyer ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBuyer?.organization_name}</DialogTitle>
          </DialogHeader>
          {selectedBuyer && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={statusColors[selectedBuyer.status]}>
                  {statusLabels[selectedBuyer.status]}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Pays</Label>
                  <p>{selectedBuyer.country} {selectedBuyer.region && `(${selectedBuyer.region})`}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Secteur</Label>
                  <p>{selectedBuyer.sector}</p>
                </div>
                {selectedBuyer.contact_name && (
                  <div>
                    <Label className="text-muted-foreground">Contact</Label>
                    <p>{selectedBuyer.contact_name} {selectedBuyer.position && `- ${selectedBuyer.position}`}</p>
                  </div>
                )}
                {selectedBuyer.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedBuyer.contact_email}`} className="text-primary hover:underline">
                      {selectedBuyer.contact_email}
                    </a>
                  </div>
                )}
                {selectedBuyer.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedBuyer.contact_phone}</span>
                  </div>
                )}
                {selectedBuyer.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={selectedBuyer.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {selectedBuyer.website}
                    </a>
                  </div>
                )}
              </div>
              {selectedBuyer.products_interested && selectedBuyer.products_interested.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Produits intéressés</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedBuyer.products_interested.map((p, i) => (
                      <Badge key={i} variant="outline">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedBuyer.certifications_required && selectedBuyer.certifications_required.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Certifications requises</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedBuyer.certifications_required.map((c, i) => (
                      <Badge key={i} variant="secondary">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {selectedBuyer.purchase_volume && (
                  <div>
                    <Label className="text-muted-foreground">Volume d'achat</Label>
                    <p>{selectedBuyer.purchase_volume}</p>
                  </div>
                )}
                {selectedBuyer.purchase_frequency && (
                  <div>
                    <Label className="text-muted-foreground">Fréquence</Label>
                    <p>{selectedBuyer.purchase_frequency}</p>
                  </div>
                )}
                {selectedBuyer.payment_terms && (
                  <div>
                    <Label className="text-muted-foreground">Conditions de paiement</Label>
                    <p>{selectedBuyer.payment_terms}</p>
                  </div>
                )}
                {selectedBuyer.preferred_incoterms && (
                  <div>
                    <Label className="text-muted-foreground">Incoterms</Label>
                    <p>{selectedBuyer.preferred_incoterms}</p>
                  </div>
                )}
              </div>
              {selectedBuyer.quality_requirements && (
                <div>
                  <Label className="text-muted-foreground">Exigences qualité</Label>
                  <p className="whitespace-pre-wrap">{selectedBuyer.quality_requirements}</p>
                </div>
              )}
              {selectedBuyer.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="whitespace-pre-wrap">{selectedBuyer.notes}</p>
                </div>
              )}
              {selectedBuyer.last_contact_date && (
                <div>
                  <Label className="text-muted-foreground">Dernier contact</Label>
                  <p>{format(new Date(selectedBuyer.last_contact_date), "dd MMMM yyyy", { locale: fr })}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
