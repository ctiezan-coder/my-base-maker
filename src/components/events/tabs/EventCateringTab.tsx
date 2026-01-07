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
import { Plus, UtensilsCrossed, Clock, Users, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface EventCateringTabProps {
  eventId: string;
  canManage?: boolean;
}

const SERVICE_TYPES = [
  { value: 'breakfast', label: 'Petit-déjeuner' },
  { value: 'coffee_break', label: 'Pause-café' },
  { value: 'lunch', label: 'Déjeuner' },
  { value: 'dinner', label: 'Dîner' },
  { value: 'cocktail', label: 'Cocktail' },
  { value: 'gala', label: 'Dîner de gala' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'snacks', label: 'Collations' },
];

export function EventCateringTab({ eventId, canManage }: EventCateringTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: cateringItems, isLoading } = useQuery({
    queryKey: ["event-catering", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_catering")
        .select("*")
        .eq("event_id", eventId)
        .order("service_date")
        .order("service_time");
      if (error) throw error;
      return data;
    },
  });

  const saveItem = useMutation({
    mutationFn: async (data: any) => {
      if (selectedItem) {
        const { error } = await supabase
          .from("event_catering")
          .update(data)
          .eq("id", selectedItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_catering")
          .insert({ ...data, event_id: eventId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-catering", eventId] });
      toast({ title: selectedItem ? "Service mis à jour" : "Service ajouté" });
      setDialogOpen(false);
      setSelectedItem(null);
      setForm({});
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_catering").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-catering", eventId] });
      toast({ title: "Service supprimé" });
    },
  });

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setForm(item);
    setDialogOpen(true);
  };

  const totalCost = cateringItems?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0;
  const totalPeople = cateringItems?.reduce((sum, item) => sum + (item.expected_count || 0), 0) || 0;

  const getServiceLabel = (type: string) => {
    return SERVICE_TYPES.find(s => s.value === type)?.label || type;
  };

  // Group by date
  const byDate = cateringItems?.reduce((acc: any, item: any) => {
    const date = item.service_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{cateringItems?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Services de restauration</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalPeople}</div>
            <p className="text-sm text-muted-foreground">Personnes attendues (total)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalCost.toLocaleString()} XOF</div>
            <p className="text-sm text-muted-foreground">Coût total estimé</p>
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

      {/* Items by Date */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : Object.keys(byDate).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun service de restauration
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(byDate).map(([date, items]: [string, any]) => (
            <Card key={date}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {format(new Date(date), "EEEE dd MMMM yyyy", { locale: fr })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex items-start justify-between p-3 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <UtensilsCrossed className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{getServiceLabel(item.service_type)}</h4>
                            <Badge variant={item.status === 'confirmed' ? 'default' : 'secondary'}>
                              {item.status === 'confirmed' ? 'Confirmé' : item.status === 'pending' ? 'En attente' : item.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            {item.service_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.service_time.substring(0, 5)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {item.expected_count} personnes
                            </span>
                            {item.cost > 0 && (
                              <span>{Number(item.cost).toLocaleString()} XOF</span>
                            )}
                          </div>
                          {item.menu_description && (
                            <p className="text-xs text-muted-foreground mt-1">{item.menu_description}</p>
                          )}
                          {item.caterer_name && (
                            <p className="text-xs text-muted-foreground mt-1">Traiteur: {item.caterer_name}</p>
                          )}
                          {item.dietary_options?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.dietary_options.map((opt: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">{opt}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteItem.mutate(item.id)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
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
            <DialogTitle>{selectedItem ? "Modifier" : "Ajouter un service"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveItem.mutate(form); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Type de service *</Label>
              <Select
                value={form.service_type || ""}
                onValueChange={(value) => setForm({ ...form, service_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.service_date || ""}
                  onChange={(e) => setForm({ ...form, service_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Heure</Label>
                <Input
                  type="time"
                  value={form.service_time || ""}
                  onChange={(e) => setForm({ ...form, service_time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de personnes</Label>
                <Input
                  type="number"
                  value={form.expected_count || ""}
                  onChange={(e) => setForm({ ...form, expected_count: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Coût (XOF)</Label>
                <Input
                  type="number"
                  value={form.cost || ""}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description du menu</Label>
              <Textarea
                value={form.menu_description || ""}
                onChange={(e) => setForm({ ...form, menu_description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Traiteur</Label>
                <Input
                  value={form.caterer_name || ""}
                  onChange={(e) => setForm({ ...form, caterer_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact traiteur</Label>
                <Input
                  value={form.caterer_contact || ""}
                  onChange={(e) => setForm({ ...form, caterer_contact: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={form.status || "pending"}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saveItem.isPending}>Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
