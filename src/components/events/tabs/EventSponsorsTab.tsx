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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Star, Globe, Mail, Phone, Trash2, Pencil } from "lucide-react";
import { SPONSOR_LEVELS } from "@/types/event";

interface EventSponsorsTabProps {
  eventId: string;
  canManage?: boolean;
}

export function EventSponsorsTab({ eventId, canManage }: EventSponsorsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["event-sponsors", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_sponsors")
        .select("*")
        .eq("event_id", eventId)
        .order("sponsor_level");
      if (error) throw error;
      return data;
    },
  });

  const saveSponsor = useMutation({
    mutationFn: async (data: any) => {
      if (selectedSponsor) {
        const { error } = await supabase
          .from("event_sponsors")
          .update(data)
          .eq("id", selectedSponsor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_sponsors")
          .insert({ ...data, event_id: eventId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsors", eventId] });
      toast({ title: selectedSponsor ? "Sponsor mis à jour" : "Sponsor ajouté" });
      setDialogOpen(false);
      setSelectedSponsor(null);
      setForm({});
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteSponsor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_sponsors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsors", eventId] });
      toast({ title: "Sponsor supprimé" });
    },
  });

  const handleEdit = (sponsor: any) => {
    setSelectedSponsor(sponsor);
    setForm(sponsor);
    setDialogOpen(true);
  };

  const totalValue = sponsors?.reduce((sum, s) => sum + (Number(s.contribution_value) || 0), 0) || 0;

  const getSponsorLevel = (level: string) => {
    return SPONSOR_LEVELS.find(l => l.value === level) || SPONSOR_LEVELS[3];
  };

  // Group by level
  const byLevel: Record<string, any[]> = {};
  SPONSOR_LEVELS.forEach(level => {
    byLevel[level.value] = sponsors?.filter(s => s.sponsor_level === level.value) || [];
  });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{sponsors?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Sponsors & Partenaires</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalValue.toLocaleString()} XOF</div>
            <p className="text-sm text-muted-foreground">Valeur totale</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{sponsors?.filter(s => s.is_media_partner).length || 0}</div>
            <p className="text-sm text-muted-foreground">Partenaires média</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        </div>
      )}

      {/* Sponsors by Level */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : sponsors?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun sponsor
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {SPONSOR_LEVELS.map(level => {
            const levelSponsors = byLevel[level.value];
            if (levelSponsors.length === 0) return null;
            
            return (
              <div key={level.value}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className={`w-5 h-5 ${level.value === 'platinum' ? 'text-gray-400' : level.value === 'gold' ? 'text-yellow-500' : level.value === 'silver' ? 'text-gray-400' : 'text-orange-600'}`} />
                  Sponsors {level.label}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {levelSponsors.map((sponsor: any) => (
                    <Card key={sponsor.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{sponsor.name}</h4>
                              <Badge className={getSponsorLevel(sponsor.sponsor_level).color}>
                                {getSponsorLevel(sponsor.sponsor_level).label}
                              </Badge>
                              {sponsor.is_media_partner && (
                                <Badge variant="outline">Média</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {sponsor.contribution_type === 'financial' ? 'Financier' : 'En nature'}
                              {sponsor.contribution_value > 0 && ` - ${Number(sponsor.contribution_value).toLocaleString()} XOF`}
                            </p>
                            {sponsor.benefits_offered && (
                              <p className="text-xs text-muted-foreground mt-1">{sponsor.benefits_offered}</p>
                            )}
                            <div className="mt-2 space-y-1">
                              {sponsor.website && (
                                <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {sponsor.website}
                                </a>
                              )}
                              {sponsor.contact_email && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {sponsor.contact_email}
                                </p>
                              )}
                            </div>
                          </div>
                          {canManage && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(sponsor)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSponsor.mutate(sponsor.id)}>
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSponsor ? "Modifier" : "Ajouter un sponsor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveSponsor.mutate(form); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select
                  value={form.sponsor_level || "bronze"}
                  onValueChange={(value) => setForm({ ...form, sponsor_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPONSOR_LEVELS.map(l => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.contribution_type || "financial"}
                  onValueChange={(value) => setForm({ ...form, contribution_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financier</SelectItem>
                    <SelectItem value="in_kind">En nature</SelectItem>
                    <SelectItem value="mixed">Mixte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valeur contribution (XOF)</Label>
              <Input
                type="number"
                value={form.contribution_value || ""}
                onChange={(e) => setForm({ ...form, contribution_value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contreparties offertes</Label>
              <Textarea
                value={form.benefits_offered || ""}
                onChange={(e) => setForm({ ...form, benefits_offered: e.target.value })}
                placeholder="Logo sur supports, stand, prise de parole..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Site web</Label>
                <Input
                  value={form.website || ""}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact email</Label>
                <Input
                  type="email"
                  value={form.contact_email || ""}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.is_media_partner || false}
                onCheckedChange={(checked) => setForm({ ...form, is_media_partner: checked })}
              />
              <Label>Partenaire média</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveSponsor.isPending}>Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
