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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, DollarSign, TrendingUp, TrendingDown, Trash2, Pencil } from "lucide-react";
import { BUDGET_CATEGORIES } from "@/types/event";
import { Event } from "@/types/event";

interface EventBudgetTabProps {
  eventId: string;
  event: Event;
  canManage?: boolean;
}

export function EventBudgetTab({ eventId, event, canManage }: EventBudgetTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: budgetItems, isLoading } = useQuery({
    queryKey: ["event-budget-items", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_budget_items")
        .select("*")
        .eq("event_id", eventId)
        .order("category");
      if (error) throw error;
      return data;
    },
  });

  const saveItem = useMutation({
    mutationFn: async (data: any) => {
      if (selectedItem) {
        const { error } = await supabase
          .from("event_budget_items")
          .update(data)
          .eq("id", selectedItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_budget_items")
          .insert({ ...data, event_id: eventId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-budget-items", eventId] });
      toast({ title: selectedItem ? "Poste mis à jour" : "Poste ajouté" });
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
      const { error } = await supabase.from("event_budget_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-budget-items", eventId] });
      toast({ title: "Poste supprimé" });
    },
  });

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setForm(item);
    setDialogOpen(true);
  };

  const totalEstimated = budgetItems?.reduce((sum, item) => sum + (Number(item.estimated_amount) || 0), 0) || 0;
  const totalActual = budgetItems?.reduce((sum, item) => sum + (Number(item.actual_amount) || 0), 0) || 0;
  const variance = totalEstimated - totalActual;
  const budgetProgress = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;

  // Group by category
  const byCategory = budgetItems?.reduce((acc: any, item: any) => {
    const cat = item.category;
    if (!acc[cat]) {
      acc[cat] = { items: [], estimated: 0, actual: 0 };
    }
    acc[cat].items.push(item);
    acc[cat].estimated += Number(item.estimated_amount) || 0;
    acc[cat].actual += Number(item.actual_amount) || 0;
    return acc;
  }, {}) || {};

  const getCategoryLabel = (category: string) => {
    return BUDGET_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget prévisionnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEstimated.toLocaleString()} XOF</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dépenses réelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActual.toLocaleString()} XOF</div>
            <Progress value={budgetProgress} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{budgetProgress.toFixed(0)}% consommé</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Écart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-1 ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {variance >= 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              {Math.abs(variance).toLocaleString()} XOF
            </div>
            <p className="text-xs text-muted-foreground">{variance >= 0 ? 'Sous budget' : 'Dépassement'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Postes budgétaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetItems?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter un poste
          </Button>
        </div>
      )}

      {/* Budget by Category */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : Object.keys(byCategory).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun poste budgétaire
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(byCategory).map(([category, data]: [string, any]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{getCategoryLabel(category)}</CardTitle>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Prévu: </span>
                    <span className="font-medium">{data.estimated.toLocaleString()} XOF</span>
                    <span className="mx-2">|</span>
                    <span className="text-muted-foreground">Réel: </span>
                    <span className="font-medium">{data.actual.toLocaleString()} XOF</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Poste</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead className="text-right">Prévu</TableHead>
                      <TableHead className="text-right">Réel</TableHead>
                      <TableHead>Statut</TableHead>
                      {canManage && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.item_name}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.vendor || "-"}</TableCell>
                        <TableCell className="text-right">
                          {(Number(item.estimated_amount) || 0).toLocaleString()} XOF
                        </TableCell>
                        <TableCell className="text-right">
                          {(Number(item.actual_amount) || 0).toLocaleString()} XOF
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'paid' ? 'default' : 'secondary'}>
                            {item.status === 'paid' ? 'Payé' : item.status === 'pending' ? 'En attente' : item.status}
                          </Badge>
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteItem.mutate(item.id)}>
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Modifier" : "Ajouter un poste"}</DialogTitle>
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
                  {BUDGET_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nom du poste *</Label>
              <Input
                value={form.item_name || ""}
                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Montant prévu</Label>
                <Input
                  type="number"
                  value={form.estimated_amount || ""}
                  onChange={(e) => setForm({ ...form, estimated_amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Montant réel</Label>
                <Input
                  type="number"
                  value={form.actual_amount || ""}
                  onChange={(e) => setForm({ ...form, actual_amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fournisseur</Label>
                <Input
                  value={form.vendor || ""}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                />
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
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="paid">Payé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>N° Facture</Label>
              <Input
                value={form.invoice_number || ""}
                onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
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
