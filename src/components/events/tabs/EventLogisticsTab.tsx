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
import { Progress } from "@/components/ui/progress";
import { Plus, Truck, CheckCircle, Circle, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LOGISTICS_CATEGORIES } from "@/types/event";

interface EventLogisticsTabProps {
  eventId: string;
  canManage?: boolean;
}

export function EventLogisticsTab({ eventId, canManage }: EventLogisticsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: logisticsItems, isLoading } = useQuery({
    queryKey: ["event-logistics", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_logistics")
        .select("*")
        .eq("event_id", eventId)
        .order("category")
        .order("due_date");
      if (error) throw error;
      return data;
    },
  });

  const saveItem = useMutation({
    mutationFn: async (data: any) => {
      if (selectedItem) {
        const { error } = await supabase
          .from("event_logistics")
          .update(data)
          .eq("id", selectedItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_logistics")
          .insert({ ...data, event_id: eventId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-logistics", eventId] });
      toast({ title: selectedItem ? "Élément mis à jour" : "Élément ajouté" });
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
      const { error } = await supabase.from("event_logistics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-logistics", eventId] });
      toast({ title: "Élément supprimé" });
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase
        .from("event_logistics")
        .update({ completed: !item.completed })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-logistics", eventId] });
    },
  });

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setForm(item);
    setDialogOpen(true);
  };

  const totalItems = logisticsItems?.length || 0;
  const completedItems = logisticsItems?.filter(i => i.completed).length || 0;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Group by category
  const byCategory = logisticsItems?.reduce((acc: any, item: any) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {}) || {};

  const getCategoryLabel = (category: string) => {
    return LOGISTICS_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progression logistique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1 h-3" />
            <span className="text-sm font-medium">{completedItems}/{totalItems}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{progress.toFixed(0)}% des tâches complétées</p>
        </CardContent>
      </Card>

      {/* Add Button */}
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        </div>
      )}

      {/* Items by Category */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : Object.keys(byCategory).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun élément logistique
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(byCategory).map(([category, items]: [string, any]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  {getCategoryLabel(category)}
                  <Badge variant="secondary" className="ml-auto">
                    {items.filter((i: any) => i.completed).length}/{items.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.map((item: any) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border ${item.completed ? 'bg-muted' : ''}`}
                    >
                      {canManage && (
                        <button onClick={() => toggleComplete.mutate(item)}>
                          {item.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {item.item_name}
                          </span>
                          {item.quantity > 1 && (
                            <Badge variant="outline" className="text-xs">x{item.quantity}</Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {item.assigned_to && <span>Assigné: {item.assigned_to}</span>}
                          {item.vendor && <span>Fournisseur: {item.vendor}</span>}
                          {item.due_date && (
                            <span>Échéance: {format(new Date(item.due_date), "dd/MM/yyyy", { locale: fr })}</span>
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
            <DialogTitle>{selectedItem ? "Modifier" : "Ajouter un élément"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveItem.mutate(form); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select
                value={form.category || ""}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {LOGISTICS_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Élément *</Label>
                <Input
                  value={form.item_name || ""}
                  onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Quantité</Label>
                <Input
                  type="number"
                  value={form.quantity || 1}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assigné à</Label>
                <Input
                  value={form.assigned_to || ""}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fournisseur</Label>
                <Input
                  value={form.vendor || ""}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date limite</Label>
              <Input
                type="date"
                value={form.due_date || ""}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.completed || false}
                onCheckedChange={(checked) => setForm({ ...form, completed: checked })}
              />
              <Label>Complété</Label>
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
