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
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Mail, Bell, Send, Clock, CheckCircle, Trash2, Pencil, Megaphone } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Event } from "@/types/event";

interface EventCommunicationTabProps {
  eventId: string;
  event: Event;
  canManage?: boolean;
}

const NOTIFICATION_TYPES = [
  { value: 'invitation', label: 'Invitation' },
  { value: 'confirmation', label: 'Confirmation d\'inscription' },
  { value: 'reminder_week', label: 'Rappel 1 semaine' },
  { value: 'reminder_day', label: 'Rappel 24h' },
  { value: 'change', label: 'Modification événement' },
  { value: 'thank_you', label: 'Remerciement post-événement' },
  { value: 'materials', label: 'Envoi des supports' },
  { value: 'survey', label: 'Enquête de satisfaction' },
  { value: 'custom', label: 'Message personnalisé' },
];

export function EventCommunicationTab({ eventId, event, canManage }: EventCommunicationTabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["event-notifications", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_notifications")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: participantsCount } = useQuery({
    queryKey: ["event-participants-count-comm", eventId],
    queryFn: async () => {
      const { count } = await supabase
        .from("event_participants")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId);
      return count || 0;
    },
  });

  const saveNotification = useMutation({
    mutationFn: async (data: any) => {
      if (selectedNotif) {
        const { error } = await supabase
          .from("event_notifications")
          .update(data)
          .eq("id", selectedNotif.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_notifications")
          .insert({ ...data, event_id: eventId, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-notifications", eventId] });
      toast({ title: selectedNotif ? "Notification mise à jour" : "Notification créée" });
      setDialogOpen(false);
      setSelectedNotif(null);
      setForm({});
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-notifications", eventId] });
      toast({ title: "Notification supprimée" });
    },
  });

  const markAsSent = useMutation({
    mutationFn: async (notif: any) => {
      const { error } = await supabase
        .from("event_notifications")
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString(),
          recipients_count: participantsCount 
        })
        .eq("id", notif.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-notifications", eventId] });
      toast({ title: "Notification marquée comme envoyée" });
    },
  });

  const handleEdit = (notif: any) => {
    setSelectedNotif(notif);
    setForm(notif);
    setDialogOpen(true);
  };

  const getNotifTypeLabel = (type: string) => {
    return NOTIFICATION_TYPES.find(n => n.value === type)?.label || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Envoyé</Badge>;
      case 'scheduled':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Programmé</Badge>;
      case 'draft':
      default:
        return <Badge variant="outline">Brouillon</Badge>;
    }
  };

  const sentCount = notifications?.filter(n => n.status === 'sent').length || 0;
  const draftCount = notifications?.filter(n => n.status === 'draft').length || 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{notifications?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Communications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{sentCount}</div>
            <p className="text-sm text-muted-foreground">Envoyées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-600">{draftCount}</div>
            <p className="text-sm text-muted-foreground">Brouillons</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{participantsCount}</div>
            <p className="text-sm text-muted-foreground">Destinataires potentiels</p>
          </CardContent>
        </Card>
      </div>

      {/* Social Media Links */}
      {event.hashtag && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Présence sur les réseaux sociaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {event.hashtag && (
                <Badge variant="secondary" className="text-sm">#{event.hashtag}</Badge>
              )}
              {event.press_release_url && (
                <a href={event.press_release_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  Communiqué de presse
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle communication
          </Button>
        </div>
      )}

      {/* Notifications List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : notifications?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucune communication
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications?.map((notif: any) => (
            <Card key={notif.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{notif.subject}</h4>
                        {getStatusBadge(notif.status)}
                        <Badge variant="outline" className="text-xs">
                          {getNotifTypeLabel(notif.notification_type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Créé le {format(new Date(notif.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}</span>
                        {notif.sent_at && (
                          <span className="text-green-600">
                            Envoyé le {format(new Date(notif.sent_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                            {notif.recipients_count && ` à ${notif.recipients_count} destinataires`}
                          </span>
                        )}
                        {notif.scheduled_for && notif.status !== 'sent' && (
                          <span>
                            Programmé pour le {format(new Date(notif.scheduled_for), "dd/MM/yyyy HH:mm", { locale: fr })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      {notif.status !== 'sent' && (
                        <Button variant="outline" size="sm" onClick={() => markAsSent.mutate(notif)}>
                          <Send className="w-3 h-3 mr-1" />
                          Marquer envoyé
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(notif)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteNotification.mutate(notif.id)}>
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNotif ? "Modifier" : "Nouvelle communication"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveNotification.mutate(form); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={form.notification_type || ""}
                onValueChange={(value) => setForm({ ...form, notification_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPES.map(n => (
                    <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sujet *</Label>
              <Input
                value={form.subject || ""}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={form.message || ""}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={form.status || "draft"}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="scheduled">Programmé</SelectItem>
                    <SelectItem value="sent">Envoyé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Programmé pour</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduled_for ? format(new Date(form.scheduled_for), "yyyy-MM-dd'T'HH:mm") : ""}
                  onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveNotification.isPending}>Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
