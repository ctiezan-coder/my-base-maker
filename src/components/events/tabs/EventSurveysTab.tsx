import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Plus, Star, ThumbsUp, MessageSquare, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface EventSurveysTabProps {
  eventId: string;
  canManage?: boolean;
}

export function EventSurveysTab({ eventId, canManage }: EventSurveysTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<any>({});

  const { data: surveys, isLoading } = useQuery({
    queryKey: ["event-surveys", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_surveys")
        .select("*, participant:event_participants(company:companies(company_name))")
        .eq("event_id", eventId)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveSurvey = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("event_surveys")
        .insert({ ...data, event_id: eventId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-surveys", eventId] });
      toast({ title: "Réponse enregistrée" });
      setDialogOpen(false);
      setForm({});
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteSurvey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_surveys").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-surveys", eventId] });
      toast({ title: "Réponse supprimée" });
    },
  });

  // Calculate averages
  const calculateAvg = (field: string) => {
    const validSurveys = surveys?.filter(s => s[field] != null) || [];
    if (validSurveys.length === 0) return 0;
    return validSurveys.reduce((sum, s) => sum + s[field], 0) / validSurveys.length;
  };

  const avgOverall = calculateAvg('overall_rating');
  const avgOrganization = calculateAvg('organization_rating');
  const avgContent = calculateAvg('content_rating');
  const avgSpeakers = calculateAvg('speakers_rating');
  const avgLogistics = calculateAvg('logistics_rating');
  const avgVenue = calculateAvg('venue_rating');
  const recommendRate = surveys?.filter(s => s.would_recommend).length / (surveys?.length || 1) * 100 || 0;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  const RatingInput = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star className={`w-6 h-6 ${i <= value ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Note globale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{avgOverall.toFixed(1)}</span>
              {renderStars(Math.round(avgOverall))}
            </div>
            <p className="text-xs text-muted-foreground">{surveys?.length || 0} réponses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de recommandation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{recommendRate.toFixed(0)}%</span>
              <ThumbsUp className="w-5 h-5 text-green-600" />
            </div>
            <Progress value={recommendRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Organisation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{avgOrganization.toFixed(1)}</span>
              {renderStars(Math.round(avgOrganization))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contenu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{avgContent.toFixed(1)}</span>
              {renderStars(Math.round(avgContent))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détail des notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Organisation', value: avgOrganization },
              { label: 'Contenu', value: avgContent },
              { label: 'Intervenants', value: avgSpeakers },
              { label: 'Logistique', value: avgLogistics },
              { label: 'Lieu', value: avgVenue },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="w-24 text-sm">{item.label}</span>
                <Progress value={item.value * 20} className="flex-1 h-2" />
                <span className="text-sm font-medium w-8">{item.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Button */}
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter une réponse
          </Button>
        </div>
      )}

      {/* Survey responses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Commentaires ({surveys?.filter(s => s.comments || s.suggestions).length || 0})
        </h3>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : surveys?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune réponse
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {surveys?.map((survey: any) => (
              <Card key={survey.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {renderStars(survey.overall_rating || 0)}
                        {survey.would_recommend && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            Recommande
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(survey.submitted_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </span>
                      </div>
                      {survey.comments && (
                        <p className="text-sm mb-2">{survey.comments}</p>
                      )}
                      {survey.suggestions && (
                        <div className="bg-muted p-2 rounded text-sm">
                          <span className="font-medium">Suggestions: </span>
                          {survey.suggestions}
                        </div>
                      )}
                    </div>
                    {canManage && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSurvey.mutate(survey.id)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle réponse d'enquête</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveSurvey.mutate(form); }} className="space-y-4">
            <RatingInput 
              label="Note globale *" 
              value={form.overall_rating || 0} 
              onChange={(v) => setForm({ ...form, overall_rating: v })} 
            />
            <div className="grid grid-cols-2 gap-4">
              <RatingInput 
                label="Organisation" 
                value={form.organization_rating || 0} 
                onChange={(v) => setForm({ ...form, organization_rating: v })} 
              />
              <RatingInput 
                label="Contenu" 
                value={form.content_rating || 0} 
                onChange={(v) => setForm({ ...form, content_rating: v })} 
              />
              <RatingInput 
                label="Intervenants" 
                value={form.speakers_rating || 0} 
                onChange={(v) => setForm({ ...form, speakers_rating: v })} 
              />
              <RatingInput 
                label="Logistique" 
                value={form.logistics_rating || 0} 
                onChange={(v) => setForm({ ...form, logistics_rating: v })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Commentaires</Label>
              <Textarea
                value={form.comments || ""}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Suggestions d'amélioration</Label>
              <Textarea
                value={form.suggestions || ""}
                onChange={(e) => setForm({ ...form, suggestions: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.would_recommend || false}
                onCheckedChange={(checked) => setForm({ ...form, would_recommend: checked })}
              />
              <Label>Recommanderait cet événement</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveSurvey.isPending}>Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
