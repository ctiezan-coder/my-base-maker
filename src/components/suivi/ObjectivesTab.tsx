import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, TrendingUp, AlertTriangle, CheckCircle, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ObjectivesTabProps {
  canManage?: boolean;
}

export function ObjectivesTab({ canManage = false }: ObjectivesTabProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: objectives = [], isLoading } = useQuery({
    queryKey: ["strategic-objectives"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strategic_objectives")
        .select("*, directions(name)")
        .order("fiscal_year", { ascending: false })
        .order("priority");
      if (error) throw error;
      return data;
    },
  });

  const { data: directions = [] } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("directions").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (objective: any) => {
      if (objective.id) {
        const { error } = await supabase.from("strategic_objectives").update(objective).eq("id", objective.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("strategic_objectives").insert(objective);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-objectives"] });
      toast.success(selectedObjective?.id ? "Objectif mis à jour" : "Objectif créé");
      setDialogOpen(false);
      setSelectedObjective(null);
    },
    onError: (error: any) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("strategic_objectives").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-objectives"] });
      toast.success("Objectif supprimé");
    },
  });

  const filteredObjectives = objectives.filter((obj: any) => {
    const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || obj.objective_type === filterType;
    const matchesStatus = filterStatus === "all" || obj.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      achieved: "bg-green-100 text-green-800",
      at_risk: "bg-orange-100 text-orange-800",
      not_achieved: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      pending: "En attente",
      in_progress: "En cours",
      achieved: "Atteint",
      at_risk: "À risque",
      not_achieved: "Non atteint",
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: "bg-slate-100 text-slate-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return <Badge className={styles[priority]}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>;
  };

  const calculateProgress = (current: number, target: number) => {
    if (!target) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const objective = {
      ...selectedObjective,
      title: formData.get("title"),
      description: formData.get("description"),
      objective_type: formData.get("objective_type"),
      direction_id: formData.get("direction_id") || null,
      fiscal_year: parseInt(formData.get("fiscal_year") as string),
      target_value: parseFloat(formData.get("target_value") as string) || null,
      current_value: parseFloat(formData.get("current_value") as string) || 0,
      unit: formData.get("unit"),
      start_date: formData.get("start_date") || null,
      end_date: formData.get("end_date") || null,
      status: formData.get("status"),
      priority: formData.get("priority"),
      notes: formData.get("notes"),
    };
    saveMutation.mutate(objective);
  };

  // Stats
  const stats = {
    total: objectives.length,
    strategic: objectives.filter((o: any) => o.objective_type === "strategic").length,
    operational: objectives.filter((o: any) => o.objective_type === "operational").length,
    achieved: objectives.filter((o: any) => o.status === "achieved").length,
    atRisk: objectives.filter((o: any) => o.status === "at_risk").length,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total objectifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.strategic}</p>
                <p className="text-xs text-muted-foreground">Stratégiques</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.operational}</p>
                <p className="text-xs text-muted-foreground">Opérationnels</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.achieved}</p>
                <p className="text-xs text-muted-foreground">Atteints</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.atRisk}</p>
                <p className="text-xs text-muted-foreground">À risque</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="strategic">Stratégique</SelectItem>
                <SelectItem value="operational">Opérationnel</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="achieved">Atteint</SelectItem>
                <SelectItem value="at_risk">À risque</SelectItem>
                <SelectItem value="not_achieved">Non atteint</SelectItem>
              </SelectContent>
            </Select>
            {canManage && (
              <Button onClick={() => { setSelectedObjective({}); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />Nouvel objectif
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Objectives List */}
      <div className="grid gap-4">
        {filteredObjectives.map((objective: any) => {
          const progress = calculateProgress(objective.current_value || 0, objective.target_value || 0);
          return (
            <Card key={objective.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{objective.title}</h3>
                      {getStatusBadge(objective.status)}
                      {getPriorityBadge(objective.priority)}
                      <Badge variant="outline">{objective.objective_type === "strategic" ? "Stratégique" : "Opérationnel"}</Badge>
                    </div>
                    {objective.description && <p className="text-sm text-muted-foreground">{objective.description}</p>}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Année: {objective.fiscal_year}</span>
                      {objective.directions?.name && <span>Direction: {objective.directions.name}</span>}
                      {objective.end_date && <span>Échéance: {format(new Date(objective.end_date), "dd MMM yyyy", { locale: fr })}</span>}
                    </div>
                    {objective.target_value && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progression: {objective.current_value || 0} / {objective.target_value} {objective.unit}</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedObjective(objective); setDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(objective.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredObjectives.length === 0 && (
          <Card><CardContent className="pt-6 text-center text-muted-foreground">Aucun objectif trouvé</CardContent></Card>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedObjective?.id ? "Modifier l'objectif" : "Nouvel objectif"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Titre *</label>
                <Input name="title" defaultValue={selectedObjective?.title} required />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea name="description" defaultValue={selectedObjective?.description} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Type *</label>
                <Select name="objective_type" defaultValue={selectedObjective?.objective_type || "operational"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strategic">Stratégique</SelectItem>
                    <SelectItem value="operational">Opérationnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Direction</label>
                <Select name="direction_id" defaultValue={selectedObjective?.direction_id}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {directions.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Année fiscale *</label>
                <Input name="fiscal_year" type="number" defaultValue={selectedObjective?.fiscal_year || new Date().getFullYear()} required />
              </div>
              <div>
                <label className="text-sm font-medium">Priorité</label>
                <Select name="priority" defaultValue={selectedObjective?.priority || "medium"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Valeur cible</label>
                <Input name="target_value" type="number" step="0.01" defaultValue={selectedObjective?.target_value} />
              </div>
              <div>
                <label className="text-sm font-medium">Valeur actuelle</label>
                <Input name="current_value" type="number" step="0.01" defaultValue={selectedObjective?.current_value || 0} />
              </div>
              <div>
                <label className="text-sm font-medium">Unité</label>
                <Input name="unit" defaultValue={selectedObjective?.unit} placeholder="%, FCFA, nombre..." />
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <Select name="status" defaultValue={selectedObjective?.status || "pending"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="achieved">Atteint</SelectItem>
                    <SelectItem value="at_risk">À risque</SelectItem>
                    <SelectItem value="not_achieved">Non atteint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date de début</label>
                <Input name="start_date" type="date" defaultValue={selectedObjective?.start_date} />
              </div>
              <div>
                <label className="text-sm font-medium">Date de fin</label>
                <Input name="end_date" type="date" defaultValue={selectedObjective?.end_date} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea name="notes" defaultValue={selectedObjective?.notes} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
