import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Plane, Calendar, MapPin, Users, TrendingUp, FileText, Edit, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { sanitizeFilterValue } from "@/lib/utils";

interface TradeMission {
  id: string;
  mission_name: string;
  mission_type: string;
  destination_country: string;
  destination_city: string | null;
  start_date: string;
  end_date: string;
  objectives: string | null;
  target_sectors: string[] | null;
  budget_estimated: number | null;
  budget_actual: number | null;
  currency: string;
  organizer: string | null;
  status: string;
  results_contacts: number;
  results_leads: number;
  results_contracts: number;
  results_value: number | null;
  report_summary: string | null;
  lessons_learned: string | null;
  created_at: string;
}

interface TradeMissionsTabProps {
  canManage: boolean;
}

const missionTypes: Record<string, string> = {
  mission_prospection: "Mission de prospection",
  salon_international: "Salon international",
  foire: "Foire commerciale",
  rencontre_b2b: "Rencontre B2B",
  visite_acheteurs: "Visite d'acheteurs",
  autre: "Autre",
};

const statusLabels: Record<string, string> = {
  planifiee: "Planifiée",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

const statusColors: Record<string, string> = {
  planifiee: "bg-blue-100 text-blue-800",
  en_cours: "bg-yellow-100 text-yellow-800",
  terminee: "bg-green-100 text-green-800",
  annulee: "bg-red-100 text-red-800",
};

export function TradeMissionsTab({ canManage }: TradeMissionsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<TradeMission | null>(null);
  const [formData, setFormData] = useState({
    mission_name: "",
    mission_type: "mission_prospection",
    destination_country: "",
    destination_city: "",
    start_date: "",
    end_date: "",
    objectives: "",
    target_sectors: "",
    budget_estimated: "",
    organizer: "",
    status: "planifiee",
  });

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ["trade-missions", searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("trade_missions")
        .select("*")
        .order("start_date", { ascending: false });

      if (searchTerm) {
        query = query.or(`mission_name.ilike.%${sanitizeFilterValue(searchTerm)}%,destination_country.ilike.%${sanitizeFilterValue(searchTerm)}%`);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TradeMission[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("trade_missions").insert([{
        mission_name: data.mission_name,
        mission_type: data.mission_type,
        destination_country: data.destination_country,
        destination_city: data.destination_city || null,
        start_date: data.start_date,
        end_date: data.end_date,
        objectives: data.objectives || null,
        target_sectors: data.target_sectors ? data.target_sectors.split(",").map(s => s.trim()) : null,
        budget_estimated: data.budget_estimated ? parseFloat(data.budget_estimated) : null,
        organizer: data.organizer || null,
        status: data.status,
        created_by: user.user?.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Mission créée avec succès" });
      queryClient.invalidateQueries({ queryKey: ["trade-missions"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<TradeMission> & { id: string }) => {
      const { id, ...rest } = data;
      const { error } = await supabase.from("trade_missions").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Mission mise à jour" });
      queryClient.invalidateQueries({ queryKey: ["trade-missions"] });
      setDialogOpen(false);
      setDetailsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      mission_name: "",
      mission_type: "mission_prospection",
      destination_country: "",
      destination_city: "",
      start_date: "",
      end_date: "",
      objectives: "",
      target_sectors: "",
      budget_estimated: "",
      organizer: "",
      status: "planifiee",
    });
    setSelectedMission(null);
  };

  const handleEdit = (mission: TradeMission) => {
    setSelectedMission(mission);
    setFormData({
      mission_name: mission.mission_name,
      mission_type: mission.mission_type,
      destination_country: mission.destination_country,
      destination_city: mission.destination_city || "",
      start_date: mission.start_date,
      end_date: mission.end_date,
      objectives: mission.objectives || "",
      target_sectors: mission.target_sectors?.join(", ") || "",
      budget_estimated: mission.budget_estimated?.toString() || "",
      organizer: mission.organizer || "",
      status: mission.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.mission_name || !formData.destination_country || !formData.start_date || !formData.end_date) {
      toast({ title: "Erreur", description: "Veuillez remplir les champs obligatoires", variant: "destructive" });
      return;
    }
    if (selectedMission) {
      updateMutation.mutate({
        id: selectedMission.id,
        mission_name: formData.mission_name,
        mission_type: formData.mission_type,
        destination_country: formData.destination_country,
        destination_city: formData.destination_city || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        objectives: formData.objectives || null,
        target_sectors: formData.target_sectors ? formData.target_sectors.split(",").map(s => s.trim()) : null,
        budget_estimated: formData.budget_estimated ? parseFloat(formData.budget_estimated) : null,
        organizer: formData.organizer || null,
        status: formData.status,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Stats calculations
  const stats = {
    total: missions.length,
    planned: missions.filter(m => m.status === "planifiee").length,
    completed: missions.filter(m => m.status === "terminee").length,
    totalContacts: missions.reduce((sum, m) => sum + m.results_contacts, 0),
    totalLeads: missions.reduce((sum, m) => sum + m.results_leads, 0),
    totalContracts: missions.reduce((sum, m) => sum + m.results_contracts, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total missions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
            <p className="text-sm text-muted-foreground">Planifiées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-sm text-muted-foreground">Terminées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
            <p className="text-sm text-muted-foreground">Contacts B2B</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalLeads}</div>
            <p className="text-sm text-muted-foreground">Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats.totalContracts}</div>
            <p className="text-sm text-muted-foreground">Contrats</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une mission..."
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
        </div>
        {canManage && (
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle mission
          </Button>
        )}
      </div>

      {/* Missions Grid */}
      {isLoading ? (
        <p>Chargement...</p>
      ) : missions.length === 0 ? (
        <Card className="p-8 text-center">
          <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune mission commerciale trouvée</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missions.map((mission) => (
            <Card key={mission.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge className={statusColors[mission.status]}>
                    {statusLabels[mission.status]}
                  </Badge>
                  <Badge variant="outline">{missionTypes[mission.mission_type]}</Badge>
                </div>
                <CardTitle className="text-lg mt-2">{mission.mission_name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {mission.destination_country}{mission.destination_city && `, ${mission.destination_city}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(mission.start_date), "dd MMM", { locale: fr })} - {format(new Date(mission.end_date), "dd MMM yyyy", { locale: fr })}
                  </div>
                  
                  {mission.target_sectors && mission.target_sectors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {mission.target_sectors.slice(0, 3).map((sector, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{sector}</Badge>
                      ))}
                    </div>
                  )}

                  {mission.status === "terminee" && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <div className="text-center">
                        <div className="font-semibold">{mission.results_contacts}</div>
                        <div className="text-xs text-muted-foreground">Contacts</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{mission.results_leads}</div>
                        <div className="text-xs text-muted-foreground">Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{mission.results_contracts}</div>
                        <div className="text-xs text-muted-foreground">Contrats</div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedMission(mission); setDetailsDialogOpen(true); }}>
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                    {canManage && (
                      <Button variant="outline" size="sm" onClick={() => handleEdit(mission)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMission ? "Modifier la mission" : "Nouvelle mission commerciale"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Nom de la mission *</Label>
              <Input
                value={formData.mission_name}
                onChange={(e) => setFormData({ ...formData, mission_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type de mission *</Label>
              <Select value={formData.mission_type} onValueChange={(v) => setFormData({ ...formData, mission_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(missionTypes).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="space-y-2">
              <Label>Pays de destination *</Label>
              <Input
                value={formData.destination_country}
                onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input
                value={formData.destination_city}
                onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date de début *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date de fin *</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Budget estimé (EUR)</Label>
              <Input
                type="number"
                value={formData.budget_estimated}
                onChange={(e) => setFormData({ ...formData, budget_estimated: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Organisateur</Label>
              <Input
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Secteurs cibles (séparés par virgule)</Label>
              <Input
                value={formData.target_sectors}
                onChange={(e) => setFormData({ ...formData, target_sectors: e.target.value })}
                placeholder="Agroalimentaire, Textile, Cosmétiques"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Objectifs</Label>
              <Textarea
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {selectedMission ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog with Results */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMission?.mission_name}</DialogTitle>
          </DialogHeader>
          {selectedMission && (
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">Informations</TabsTrigger>
                <TabsTrigger value="results">Résultats</TabsTrigger>
                <TabsTrigger value="report">Rapport</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="flex gap-2">
                  <Badge className={statusColors[selectedMission.status]}>
                    {statusLabels[selectedMission.status]}
                  </Badge>
                  <Badge variant="outline">{missionTypes[selectedMission.mission_type]}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Destination</Label>
                    <p>{selectedMission.destination_country}{selectedMission.destination_city && `, ${selectedMission.destination_city}`}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Dates</Label>
                    <p>{format(new Date(selectedMission.start_date), "dd MMM", { locale: fr })} - {format(new Date(selectedMission.end_date), "dd MMM yyyy", { locale: fr })}</p>
                  </div>
                  {selectedMission.organizer && (
                    <div>
                      <Label className="text-muted-foreground">Organisateur</Label>
                      <p>{selectedMission.organizer}</p>
                    </div>
                  )}
                  {selectedMission.budget_estimated && (
                    <div>
                      <Label className="text-muted-foreground">Budget estimé</Label>
                      <p>{selectedMission.budget_estimated.toLocaleString()} {selectedMission.currency}</p>
                    </div>
                  )}
                </div>
                {selectedMission.target_sectors && selectedMission.target_sectors.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Secteurs cibles</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedMission.target_sectors.map((s, i) => (
                        <Badge key={i} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMission.objectives && (
                  <div>
                    <Label className="text-muted-foreground">Objectifs</Label>
                    <p className="whitespace-pre-wrap">{selectedMission.objectives}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                {canManage && selectedMission.status === "terminee" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contacts B2B</Label>
                      <Input
                        type="number"
                        defaultValue={selectedMission.results_contacts}
                        onChange={(e) => {
                          updateMutation.mutate({ id: selectedMission.id, results_contacts: parseInt(e.target.value) || 0 });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Leads générés</Label>
                      <Input
                        type="number"
                        defaultValue={selectedMission.results_leads}
                        onChange={(e) => {
                          updateMutation.mutate({ id: selectedMission.id, results_leads: parseInt(e.target.value) || 0 });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contrats signés</Label>
                      <Input
                        type="number"
                        defaultValue={selectedMission.results_contracts}
                        onChange={(e) => {
                          updateMutation.mutate({ id: selectedMission.id, results_contracts: parseInt(e.target.value) || 0 });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valeur des contrats (EUR)</Label>
                      <Input
                        type="number"
                        defaultValue={selectedMission.results_value || 0}
                        onChange={(e) => {
                          updateMutation.mutate({ id: selectedMission.id, results_value: parseFloat(e.target.value) || 0 });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Budget réel (EUR)</Label>
                      <Input
                        type="number"
                        defaultValue={selectedMission.budget_actual || 0}
                        onChange={(e) => {
                          updateMutation.mutate({ id: selectedMission.id, budget_actual: parseFloat(e.target.value) || 0 });
                        }}
                      />
                    </div>
                  </div>
                )}
                {!canManage || selectedMission.status !== "terminee" ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold">{selectedMission.results_contacts}</div>
                        <p className="text-sm text-muted-foreground">Contacts B2B</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold">{selectedMission.results_leads}</div>
                        <p className="text-sm text-muted-foreground">Leads</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold">{selectedMission.results_contracts}</div>
                        <p className="text-sm text-muted-foreground">Contrats</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold">{selectedMission.results_value?.toLocaleString() || 0}</div>
                        <p className="text-sm text-muted-foreground">Valeur (EUR)</p>
                      </CardContent>
                    </Card>
                  </div>
                ) : null}
              </TabsContent>

              <TabsContent value="report" className="space-y-4">
                {canManage ? (
                  <>
                    <div className="space-y-2">
                      <Label>Résumé du rapport</Label>
                      <Textarea
                        defaultValue={selectedMission.report_summary || ""}
                        rows={5}
                        onChange={(e) => {
                          // Debounce this in production
                        }}
                        onBlur={(e) => {
                          if (e.target.value !== selectedMission.report_summary) {
                            updateMutation.mutate({ id: selectedMission.id, report_summary: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Leçons apprises</Label>
                      <Textarea
                        defaultValue={selectedMission.lessons_learned || ""}
                        rows={3}
                        onBlur={(e) => {
                          if (e.target.value !== selectedMission.lessons_learned) {
                            updateMutation.mutate({ id: selectedMission.id, lessons_learned: e.target.value });
                          }
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {selectedMission.report_summary && (
                      <div>
                        <Label className="text-muted-foreground">Résumé du rapport</Label>
                        <p className="whitespace-pre-wrap mt-1">{selectedMission.report_summary}</p>
                      </div>
                    )}
                    {selectedMission.lessons_learned && (
                      <div>
                        <Label className="text-muted-foreground">Leçons apprises</Label>
                        <p className="whitespace-pre-wrap mt-1">{selectedMission.lessons_learned}</p>
                      </div>
                    )}
                    {!selectedMission.report_summary && !selectedMission.lessons_learned && (
                      <p className="text-center text-muted-foreground py-8">Aucun rapport disponible</p>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
