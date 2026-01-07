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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ClipboardList, Edit, Trash2, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ActionPlansTabProps {
  canManage?: boolean;
}

export function ActionPlansTab({ canManage = false }: ActionPlansTabProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());

  const { data: actionPlans = [], isLoading } = useQuery({
    queryKey: ["action-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("action_plans")
        .select("*, directions(name), strategic_objectives(title), action_plan_activities(*)")
        .order("fiscal_year", { ascending: false });
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

  const { data: objectives = [] } = useQuery({
    queryKey: ["strategic-objectives"],
    queryFn: async () => {
      const { data, error } = await supabase.from("strategic_objectives").select("id, title").order("title");
      if (error) throw error;
      return data;
    },
  });

  const savePlanMutation = useMutation({
    mutationFn: async (plan: any) => {
      if (plan.id) {
        const { error } = await supabase.from("action_plans").update(plan).eq("id", plan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("action_plans").insert(plan);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-plans"] });
      toast.success(selectedPlan?.id ? "Plan mis à jour" : "Plan créé");
      setDialogOpen(false);
      setSelectedPlan(null);
    },
    onError: (error: any) => toast.error("Erreur: " + error.message),
  });

  const saveActivityMutation = useMutation({
    mutationFn: async (activity: any) => {
      if (activity.id) {
        const { error } = await supabase.from("action_plan_activities").update(activity).eq("id", activity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("action_plan_activities").insert(activity);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-plans"] });
      toast.success(selectedActivity?.id ? "Activité mise à jour" : "Activité créée");
      setActivityDialogOpen(false);
      setSelectedActivity(null);
    },
    onError: (error: any) => toast.error("Erreur: " + error.message),
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("action_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-plans"] });
      toast.success("Plan supprimé");
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("action_plan_activities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-plans"] });
      toast.success("Activité supprimée");
    },
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      approved: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      draft: "Brouillon",
      approved: "Approuvé",
      in_progress: "En cours",
      completed: "Terminé",
      cancelled: "Annulé",
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const getActivityStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      delayed: "bg-orange-100 text-orange-800",
      cancelled: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      pending: "En attente",
      in_progress: "En cours",
      completed: "Terminée",
      delayed: "En retard",
      cancelled: "Annulée",
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPlans(newExpanded);
  };

  const calculatePlanProgress = (activities: any[]) => {
    if (!activities?.length) return 0;
    const completed = activities.filter((a) => a.status === "completed").length;
    return Math.round((completed / activities.length) * 100);
  };

  const handleSubmitPlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const plan = {
      ...selectedPlan,
      title: formData.get("title"),
      description: formData.get("description"),
      direction_id: formData.get("direction_id"),
      objective_id: formData.get("objective_id") || null,
      fiscal_year: parseInt(formData.get("fiscal_year") as string),
      start_date: formData.get("start_date") || null,
      end_date: formData.get("end_date") || null,
      status: formData.get("status"),
      budget_allocated: parseFloat(formData.get("budget_allocated") as string) || 0,
      budget_consumed: parseFloat(formData.get("budget_consumed") as string) || 0,
      notes: formData.get("notes"),
    };
    savePlanMutation.mutate(plan);
  };

  const handleSubmitActivity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const activity = {
      ...selectedActivity,
      action_plan_id: selectedActivity.action_plan_id,
      title: formData.get("title"),
      description: formData.get("description"),
      start_date: formData.get("start_date") || null,
      end_date: formData.get("end_date") || null,
      responsible: formData.get("responsible"),
      resources_needed: formData.get("resources_needed"),
      kpi_indicator: formData.get("kpi_indicator"),
      target_value: parseFloat(formData.get("target_value") as string) || null,
      current_value: parseFloat(formData.get("current_value") as string) || 0,
      status: formData.get("status"),
      obstacles: formData.get("obstacles"),
      notes: formData.get("notes"),
    };
    saveActivityMutation.mutate(activity);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Plans d'Action par Direction
          </h2>
          <p className="text-sm text-muted-foreground">{actionPlans.length} plans d'action</p>
        </div>
        {canManage && (
          <Button onClick={() => { setSelectedPlan({}); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Nouveau plan
          </Button>
        )}
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {actionPlans.map((plan: any) => {
          const progress = calculatePlanProgress(plan.action_plan_activities);
          const isExpanded = expandedPlans.has(plan.id);
          
          return (
            <Card key={plan.id}>
              <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(plan.id)}>
                <CardHeader className="cursor-pointer" onClick={() => toggleExpand(plan.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{plan.title}</CardTitle>
                        {getStatusBadge(plan.status)}
                        <Badge variant="outline">{plan.fiscal_year}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {plan.directions?.name} • {plan.action_plan_activities?.length || 0} activités
                        {plan.strategic_objectives?.title && ` • Objectif: ${plan.strategic_objectives.title}`}
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex-1 max-w-xs">
                          <Progress value={progress} className="h-2" />
                        </div>
                        <span className="text-sm font-medium">{progress}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canManage && (
                        <>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); setDialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deletePlanMutation.mutate(plan.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    {plan.description && <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>}
                    
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Activités du plan</h4>
                      {canManage && (
                        <Button variant="outline" size="sm" onClick={() => { setSelectedActivity({ action_plan_id: plan.id }); setActivityDialogOpen(true); }}>
                          <Plus className="h-4 w-4 mr-2" />Ajouter activité
                        </Button>
                      )}
                    </div>

                    {plan.action_plan_activities?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Activité</TableHead>
                            <TableHead>Responsable</TableHead>
                            <TableHead>Période</TableHead>
                            <TableHead>Progression</TableHead>
                            <TableHead>Statut</TableHead>
                            {canManage && <TableHead className="text-right">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plan.action_plan_activities.map((activity: any) => (
                            <TableRow key={activity.id}>
                              <TableCell className="font-medium">{activity.title}</TableCell>
                              <TableCell>{activity.responsible || "-"}</TableCell>
                              <TableCell>
                                {activity.start_date && format(new Date(activity.start_date), "dd/MM/yy", { locale: fr })}
                                {activity.end_date && ` - ${format(new Date(activity.end_date), "dd/MM/yy", { locale: fr })}`}
                              </TableCell>
                              <TableCell>
                                {activity.target_value ? (
                                  <div className="flex items-center gap-2">
                                    <Progress value={(activity.current_value / activity.target_value) * 100} className="h-2 w-16" />
                                    <span className="text-xs">{activity.current_value}/{activity.target_value}</span>
                                  </div>
                                ) : "-"}
                              </TableCell>
                              <TableCell>{getActivityStatusBadge(activity.status)}</TableCell>
                              {canManage && (
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => { setSelectedActivity({ ...activity, action_plan_id: plan.id }); setActivityDialogOpen(true); }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => deleteActivityMutation.mutate(activity.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Aucune activité dans ce plan</p>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlan?.id ? "Modifier le plan" : "Nouveau plan d'action"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPlan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Titre *</label>
                <Input name="title" defaultValue={selectedPlan?.title} required />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea name="description" defaultValue={selectedPlan?.description} rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">Direction *</label>
                <Select name="direction_id" defaultValue={selectedPlan?.direction_id} required>
                  <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {directions.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Objectif lié</label>
                <Select name="objective_id" defaultValue={selectedPlan?.objective_id}>
                  <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                  <SelectContent>
                    {objectives.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Année *</label>
                <Input name="fiscal_year" type="number" defaultValue={selectedPlan?.fiscal_year || new Date().getFullYear()} required />
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <Select name="status" defaultValue={selectedPlan?.status || "draft"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date début</label>
                <Input name="start_date" type="date" defaultValue={selectedPlan?.start_date} />
              </div>
              <div>
                <label className="text-sm font-medium">Date fin</label>
                <Input name="end_date" type="date" defaultValue={selectedPlan?.end_date} />
              </div>
              <div>
                <label className="text-sm font-medium">Budget alloué (FCFA)</label>
                <Input name="budget_allocated" type="number" defaultValue={selectedPlan?.budget_allocated} />
              </div>
              <div>
                <label className="text-sm font-medium">Budget consommé (FCFA)</label>
                <Input name="budget_consumed" type="number" defaultValue={selectedPlan?.budget_consumed} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea name="notes" defaultValue={selectedPlan?.notes} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={savePlanMutation.isPending}>Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedActivity?.id ? "Modifier l'activité" : "Nouvelle activité"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitActivity} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Titre *</label>
                <Input name="title" defaultValue={selectedActivity?.title} required />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea name="description" defaultValue={selectedActivity?.description} rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">Responsable</label>
                <Input name="responsible" defaultValue={selectedActivity?.responsible} />
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <Select name="status" defaultValue={selectedActivity?.status || "pending"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                    <SelectItem value="delayed">En retard</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date début</label>
                <Input name="start_date" type="date" defaultValue={selectedActivity?.start_date} />
              </div>
              <div>
                <label className="text-sm font-medium">Date fin</label>
                <Input name="end_date" type="date" defaultValue={selectedActivity?.end_date} />
              </div>
              <div>
                <label className="text-sm font-medium">Indicateur KPI</label>
                <Input name="kpi_indicator" defaultValue={selectedActivity?.kpi_indicator} />
              </div>
              <div>
                <label className="text-sm font-medium">Valeur cible</label>
                <Input name="target_value" type="number" step="0.01" defaultValue={selectedActivity?.target_value} />
              </div>
              <div>
                <label className="text-sm font-medium">Valeur actuelle</label>
                <Input name="current_value" type="number" step="0.01" defaultValue={selectedActivity?.current_value} />
              </div>
              <div>
                <label className="text-sm font-medium">Ressources nécessaires</label>
                <Input name="resources_needed" defaultValue={selectedActivity?.resources_needed} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Obstacles identifiés</label>
                <Textarea name="obstacles" defaultValue={selectedActivity?.obstacles} rows={2} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea name="notes" defaultValue={selectedActivity?.notes} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActivityDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveActivityMutation.isPending}>Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
