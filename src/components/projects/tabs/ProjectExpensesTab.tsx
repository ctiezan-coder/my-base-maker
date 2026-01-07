import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

interface ProjectExpensesTabProps {
  projectId: string;
  budget: number | null;
  canManage: boolean;
}

const categories = [
  { value: "personnel", label: "Personnel" },
  { value: "équipement", label: "Équipement" },
  { value: "services", label: "Services" },
  { value: "déplacement", label: "Déplacement" },
  { value: "autre", label: "Autre" },
];

export function ProjectExpensesTab({ projectId, budget, canManage }: ProjectExpensesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    category: "autre",
  });

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["project-expenses", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_expenses")
        .select("*")
        .eq("project_id", projectId)
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const budgetProgress = budget ? Math.min((totalExpenses / budget) * 100, 100) : 0;
  const remainingBudget = budget ? budget - totalExpenses : null;

  const saveExpense = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        project_id: projectId,
        created_by: user?.id,
      };

      if (editingExpense) {
        const { error } = await supabase
          .from("project_expenses")
          .update(payload)
          .eq("id", editingExpense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("project_expenses").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-expenses", projectId] });
      closeDialog();
      toast({ title: editingExpense ? "Dépense modifiée" : "Dépense ajoutée" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-expenses", projectId] });
      toast({ title: "Dépense supprimée" });
    },
  });

  const openDialog = (expense?: any) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        expense_date: expense.expense_date,
        category: expense.category || "autre",
      });
    } else {
      setEditingExpense(null);
      setFormData({
        description: "",
        amount: "",
        expense_date: new Date().toISOString().split("T")[0],
        category: "autre",
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingExpense(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      {/* Budget Overview */}
      {budget && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget consommé</span>
                <span className="font-mono">
                  {new Intl.NumberFormat('fr-FR').format(totalExpenses)} / {new Intl.NumberFormat('fr-FR').format(budget)} FCFA
                </span>
              </div>
              <Progress value={budgetProgress} className={budgetProgress > 90 ? "bg-red-200" : ""} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{budgetProgress.toFixed(1)}% utilisé</span>
                <span className={remainingBudget && remainingBudget < 0 ? "text-destructive font-semibold" : ""}>
                  Reste: {new Intl.NumberFormat('fr-FR').format(remainingBudget || 0)} FCFA
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Dépenses ({expenses?.length || 0})</h3>
        {canManage && (
          <Button size="sm" onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        )}
      </div>

      {expenses?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucune dépense enregistrée
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {expenses?.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(expense.expense_date), "dd MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{expense.category}</Badge>
                    <span className="font-mono font-semibold">
                      {new Intl.NumberFormat('fr-FR').format(expense.amount)} FCFA
                    </span>
                    {canManage && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => openDialog(expense)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteExpense.mutate(expense.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Modifier la dépense" : "Nouvelle dépense"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveExpense.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Montant (FCFA) *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
              <Button type="submit" disabled={saveExpense.isPending}>
                {saveExpense.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
