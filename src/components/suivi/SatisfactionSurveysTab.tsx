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
import { Plus, ClipboardCheck, Star, Edit, Trash2, BarChart3, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SatisfactionSurveysTabProps {
  canManage?: boolean;
}

export function SatisfactionSurveysTab({ canManage = false }: SatisfactionSurveysTabProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ["satisfaction-surveys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("satisfaction_surveys")
        .select("*, directions(name), survey_responses(id, overall_rating)")
        .order("created_at", { ascending: false });
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
    mutationFn: async (survey: any) => {
      if (survey.id) {
        const { error } = await supabase.from("satisfaction_surveys").update(survey).eq("id", survey.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("satisfaction_surveys").insert(survey);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["satisfaction-surveys"] });
      toast.success(selectedSurvey?.id ? "Enquête mise à jour" : "Enquête créée");
      setDialogOpen(false);
      setSelectedSurvey(null);
    },
    onError: (error: any) => toast.error("Erreur: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("satisfaction_surveys").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["satisfaction-surveys"] });
      toast.success("Enquête supprimée");
    },
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      closed: "bg-blue-100 text-blue-800",
      archived: "bg-slate-100 text-slate-800",
    };
    const labels: Record<string, string> = {
      draft: "Brouillon",
      active: "Active",
      closed: "Clôturée",
      archived: "Archivée",
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const getSurveyTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      operator: "Opérateurs",
      training: "Formation",
      event: "Événement",
      general: "Général",
      program: "Programme",
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  const calculateAvgRating = (responses: any[]) => {
    if (!responses?.length) return 0;
    const validRatings = responses.filter((r) => r.overall_rating != null);
    if (!validRatings.length) return 0;
    const sum = validRatings.reduce((acc, r) => acc + r.overall_rating, 0);
    return (sum / validRatings.length).toFixed(1);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const survey = {
      ...selectedSurvey,
      title: formData.get("title"),
      description: formData.get("description"),
      survey_type: formData.get("survey_type"),
      direction_id: formData.get("direction_id") || null,
      start_date: formData.get("start_date") || null,
      end_date: formData.get("end_date") || null,
      status: formData.get("status"),
    };
    saveMutation.mutate(survey);
  };

  // Stats
  const stats = {
    total: surveys.length,
    active: surveys.filter((s: any) => s.status === "active").length,
    totalResponses: surveys.reduce((acc: number, s: any) => acc + (s.survey_responses?.length || 0), 0),
    avgSatisfaction: (() => {
      const allRatings = surveys.flatMap((s: any) => s.survey_responses?.filter((r: any) => r.overall_rating != null).map((r: any) => r.overall_rating) || []);
      if (!allRatings.length) return 0;
      return (allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length).toFixed(1);
    })(),
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total enquêtes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalResponses}</p>
                <p className="text-xs text-muted-foreground">Réponses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.avgSatisfaction}/5</p>
                <p className="text-xs text-muted-foreground">Note moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Enquêtes de Satisfaction</h2>
        {canManage && (
          <Button onClick={() => { setSelectedSurvey({}); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Nouvelle enquête
          </Button>
        )}
      </div>

      {/* Surveys List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey: any) => {
          const responseCount = survey.survey_responses?.length || 0;
          const avgRating = calculateAvgRating(survey.survey_responses);

          return (
            <Card key={survey.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{survey.title}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      {getStatusBadge(survey.status)}
                      {getSurveyTypeBadge(survey.survey_type)}
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedSurvey(survey); setDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(survey.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {survey.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{survey.description}</p>}
                
                <div className="space-y-2 text-sm">
                  {survey.directions?.name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Direction:</span>
                      <span>{survey.directions.name}</span>
                    </div>
                  )}
                  {survey.start_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Période:</span>
                      <span>
                        {format(new Date(survey.start_date), "dd/MM/yy", { locale: fr })}
                        {survey.end_date && ` - ${format(new Date(survey.end_date), "dd/MM/yy", { locale: fr })}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Réponses:</span>
                    <span className="font-medium">{responseCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Note moyenne:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{avgRating}/5</span>
                    </div>
                  </div>
                </div>

                {responseCount > 0 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => { setSelectedSurvey(survey); setResultsDialogOpen(true); }}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Voir les résultats
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        {surveys.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center text-muted-foreground">
              Aucune enquête de satisfaction
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedSurvey?.id ? "Modifier l'enquête" : "Nouvelle enquête"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titre *</label>
              <Input name="title" defaultValue={selectedSurvey?.title} required />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" defaultValue={selectedSurvey?.description} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type *</label>
                <Select name="survey_type" defaultValue={selectedSurvey?.survey_type || "general"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">Opérateurs</SelectItem>
                    <SelectItem value="training">Formation</SelectItem>
                    <SelectItem value="event">Événement</SelectItem>
                    <SelectItem value="program">Programme</SelectItem>
                    <SelectItem value="general">Général</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <Select name="status" defaultValue={selectedSurvey?.status || "draft"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Clôturée</SelectItem>
                    <SelectItem value="archived">Archivée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Direction</label>
                <Select name="direction_id" defaultValue={selectedSurvey?.direction_id}>
                  <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                  <SelectContent>
                    {directions.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date début</label>
                <Input name="start_date" type="date" defaultValue={selectedSurvey?.start_date} />
              </div>
              <div>
                <label className="text-sm font-medium">Date fin</label>
                <Input name="end_date" type="date" defaultValue={selectedSurvey?.end_date} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveMutation.isPending}>Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Résultats: {selectedSurvey?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold">{selectedSurvey?.survey_responses?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Réponses</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <Star className="h-8 w-8 mx-auto text-yellow-500 fill-yellow-500 mb-2" />
                  <p className="text-2xl font-bold">{calculateAvgRating(selectedSurvey?.survey_responses)}/5</p>
                  <p className="text-sm text-muted-foreground">Note moyenne</p>
                </CardContent>
              </Card>
            </div>

            {/* Rating Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Distribution des notes</CardTitle>
              </CardHeader>
              <CardContent>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = selectedSurvey?.survey_responses?.filter((r: any) => r.overall_rating === rating).length || 0;
                  const total = selectedSurvey?.survey_responses?.length || 1;
                  const percentage = Math.round((count / total) * 100);
                  
                  return (
                    <div key={rating} className="flex items-center gap-2 mb-2">
                      <span className="w-8 text-sm">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="w-12 text-sm text-right">{count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
