import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, MapPin, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PartnershipMeetingsTabProps {
  partnershipId: string;
  canManage: boolean;
}

export function PartnershipMeetingsTab({ partnershipId, canManage }: PartnershipMeetingsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    meeting_date: "",
    location: "",
    agenda: "",
    minutes: "",
    attendees: "",
    next_meeting_date: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["partnership-meetings", partnershipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_meetings")
        .select("*")
        .eq("partnership_id", partnershipId)
        .order("meeting_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const attendeesArray = data.attendees 
        ? data.attendees.split(",").map((a: string) => a.trim()).filter(Boolean)
        : [];
      
      const { error } = await supabase
        .from("partnership_meetings")
        .insert([{
          partnership_id: partnershipId,
          title: data.title,
          meeting_date: data.meeting_date,
          location: data.location || null,
          agenda: data.agenda || null,
          minutes: data.minutes || null,
          attendees: attendeesArray,
          next_meeting_date: data.next_meeting_date || null,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnership-meetings", partnershipId] });
      toast({ title: "Réunion ajoutée avec succès" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      meeting_date: "",
      location: "",
      agenda: "",
      minutes: "",
      attendees: "",
      next_meeting_date: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-4 mt-4">
      {canManage && (
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle réunion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Planifier une réunion</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date et heure *</Label>
                    <Input
                      type="datetime-local"
                      value={formData.meeting_date}
                      onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lieu</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Participants (séparés par des virgules)</Label>
                  <Input
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                    placeholder="Jean Dupont, Marie Martin, ..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ordre du jour</Label>
                  <Textarea
                    value={formData.agenda}
                    onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Compte-rendu</Label>
                  <Textarea
                    value={formData.minutes}
                    onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prochaine réunion</Label>
                  <Input
                    type="datetime-local"
                    value={formData.next_meeting_date}
                    onChange={(e) => setFormData({ ...formData, next_meeting_date: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    Ajouter
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {meetings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucune réunion planifiée
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{meeting.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(meeting.meeting_date), "dd MMM yyyy à HH:mm", { locale: fr })}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2 space-y-3">
                {meeting.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {meeting.location}
                  </div>
                )}
                
                {meeting.attendees && meeting.attendees.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {meeting.attendees.map((attendee: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {attendee}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {meeting.agenda && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Ordre du jour:</span>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{meeting.agenda}</p>
                  </div>
                )}

                {meeting.minutes && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Compte-rendu:
                    </span>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{meeting.minutes}</p>
                  </div>
                )}

                {meeting.next_meeting_date && (
                  <div className="text-sm text-primary">
                    Prochaine réunion: {format(new Date(meeting.next_meeting_date), "dd MMM yyyy à HH:mm", { locale: fr })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
