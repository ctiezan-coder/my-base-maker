import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, MapPin, User, Trash2, Pencil, Coffee } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";

interface EventProgramTabProps {
  eventId: string;
  canManage?: boolean;
}

export function EventProgramTab({ eventId, canManage }: EventProgramTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [speakerDialogOpen, setSpeakerDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<any>(null);
  const [sessionForm, setSessionForm] = useState<any>({});
  const [speakerForm, setSpeakerForm] = useState<any>({});

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["event-sessions", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_sessions")
        .select("*")
        .eq("event_id", eventId)
        .order("session_date")
        .order("start_time");
      if (error) throw error;
      return data;
    },
  });

  const { data: speakers } = useQuery({
    queryKey: ["event-speakers", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_speakers")
        .select("*")
        .eq("event_id", eventId)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveSession = useMutation({
    mutationFn: async (data: any) => {
      if (selectedSession) {
        const { error } = await supabase
          .from("event_sessions")
          .update(data)
          .eq("id", selectedSession.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_sessions")
          .insert({ ...data, event_id: eventId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-sessions", eventId] });
      toast({ title: selectedSession ? "Session mise à jour" : "Session ajoutée" });
      setDialogOpen(false);
      setSelectedSession(null);
      setSessionForm({});
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-sessions", eventId] });
      toast({ title: "Session supprimée" });
    },
  });

  const saveSpeaker = useMutation({
    mutationFn: async (data: any) => {
      if (selectedSpeaker) {
        const { error } = await supabase
          .from("event_speakers")
          .update(data)
          .eq("id", selectedSpeaker.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_speakers")
          .insert({ ...data, event_id: eventId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-speakers", eventId] });
      toast({ title: selectedSpeaker ? "Intervenant mis à jour" : "Intervenant ajouté" });
      setSpeakerDialogOpen(false);
      setSelectedSpeaker(null);
      setSpeakerForm({});
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteSpeaker = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_speakers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-speakers", eventId] });
      toast({ title: "Intervenant supprimé" });
    },
  });

  const handleEditSession = (session: any) => {
    setSelectedSession(session);
    setSessionForm(session);
    setDialogOpen(true);
  };

  const handleEditSpeaker = (speaker: any) => {
    setSelectedSpeaker(speaker);
    setSpeakerForm(speaker);
    setSpeakerDialogOpen(true);
  };

  // Group sessions by date
  const sessionsByDate = sessions?.reduce((acc: any, session: any) => {
    const date = session.session_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Programme par session</h3>
            {canManage && (
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Session
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Chargement...</div>
          ) : Object.keys(sessionsByDate).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucune session programmée
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(sessionsByDate).map(([date, dateSessions]: [string, any]) => (
                <Card key={date}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {format(new Date(date), "EEEE dd MMMM yyyy", { locale: fr })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dateSessions.map((session: any) => (
                      <div 
                        key={session.id} 
                        className={`p-3 rounded-lg border ${session.is_break ? 'bg-muted' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {session.is_break ? (
                                <Coffee className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Clock className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="text-sm font-medium">
                                {session.start_time?.substring(0, 5)} - {session.end_time?.substring(0, 5)}
                              </span>
                              {session.is_parallel && (
                                <Badge variant="outline" className="text-xs">Parallèle</Badge>
                              )}
                            </div>
                            <h4 className="font-medium mt-1">{session.title}</h4>
                            {session.description && (
                              <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                            )}
                            {session.room && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                {session.room}
                              </div>
                            )}
                          </div>
                          {canManage && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditSession(session)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSession.mutate(session.id)}>
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Speakers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Intervenants</h3>
            {canManage && (
              <Button size="sm" onClick={() => setSpeakerDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Intervenant
              </Button>
            )}
          </div>

          {speakers?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun intervenant
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {speakers?.map((speaker: any) => (
                <Card key={speaker.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{speaker.name}</h4>
                            {speaker.is_keynote && (
                              <Badge variant="default" className="text-xs">Keynote</Badge>
                            )}
                          </div>
                          {speaker.title && (
                            <p className="text-sm text-muted-foreground">{speaker.title}</p>
                          )}
                          {speaker.organization && (
                            <p className="text-sm text-muted-foreground">{speaker.organization}</p>
                          )}
                          {speaker.topics?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {speaker.topics.map((topic: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">{topic}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditSpeaker(speaker)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSpeaker.mutate(speaker.id)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSession ? "Modifier la session" : "Nouvelle session"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveSession.mutate(sessionForm); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={sessionForm.session_date || ""}
                  onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Salle</Label>
                <Input
                  value={sessionForm.room || ""}
                  onChange={(e) => setSessionForm({ ...sessionForm, room: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure début *</Label>
                <Input
                  type="time"
                  value={sessionForm.start_time || ""}
                  onChange={(e) => setSessionForm({ ...sessionForm, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Heure fin *</Label>
                <Input
                  type="time"
                  value={sessionForm.end_time || ""}
                  onChange={(e) => setSessionForm({ ...sessionForm, end_time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input
                value={sessionForm.title || ""}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={sessionForm.description || ""}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={sessionForm.is_break || false}
                  onCheckedChange={(checked) => setSessionForm({ ...sessionForm, is_break: checked })}
                />
                <Label>Pause/Break</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={sessionForm.is_parallel || false}
                  onCheckedChange={(checked) => setSessionForm({ ...sessionForm, is_parallel: checked })}
                />
                <Label>Session parallèle</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveSession.isPending}>Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Speaker Dialog */}
      <Dialog open={speakerDialogOpen} onOpenChange={setSpeakerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSpeaker ? "Modifier l'intervenant" : "Nouvel intervenant"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveSpeaker.mutate(speakerForm); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={speakerForm.name || ""}
                onChange={(e) => setSpeakerForm({ ...speakerForm, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titre/Fonction</Label>
                <Input
                  value={speakerForm.title || ""}
                  onChange={(e) => setSpeakerForm({ ...speakerForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Organisation</Label>
                <Input
                  value={speakerForm.organization || ""}
                  onChange={(e) => setSpeakerForm({ ...speakerForm, organization: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={speakerForm.email || ""}
                  onChange={(e) => setSpeakerForm({ ...speakerForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={speakerForm.phone || ""}
                  onChange={(e) => setSpeakerForm({ ...speakerForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Biographie</Label>
              <Textarea
                value={speakerForm.bio || ""}
                onChange={(e) => setSpeakerForm({ ...speakerForm, bio: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={speakerForm.is_keynote || false}
                onCheckedChange={(checked) => setSpeakerForm({ ...speakerForm, is_keynote: checked })}
              />
              <Label>Intervenant principal (Keynote)</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSpeakerDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveSpeaker.isPending}>Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
