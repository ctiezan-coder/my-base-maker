import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Wallet, TrendingDown, Calendar, User, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";

interface Budget {
  id: string;
  budget_name: string;
  mission_id: string | null;
  employee_id: string | null;
  direction_id: string | null;
  fiscal_year: number;
  allocated_amount: number;
  consumed_amount: number;
  remaining_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  mission?: {
    mission_number: string;
    destination: string;
    purpose: string;
  };
  employee?: {
    first_name: string;
    last_name: string;
  };
  direction?: {
    name: string;
  };
}

interface BudgetDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget;
}

export function BudgetDetailsDialog({ open, onOpenChange, budget }: BudgetDetailsDialogProps) {
  const queryClient = useQueryClient();
  const { canAccess: isManager } = useCanAccessModule('comptabilite', 'manager');
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    amount: 0,
    description: "",
    entry_date: new Date().toISOString().split('T')[0]
  });

  const { data: budgetEntries } = useQuery({
    queryKey: ['budget_entries', budget.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('budget_entries')
        .select('*')
        .eq('budget_id', budget.id)
        .order('entry_date', { ascending: false });
      return data || [];
    }
  });

  const { data: accountingEntries } = useQuery({
    queryKey: ['accounting_entries_for_budget', budget.id],
    queryFn: async () => {
      // Get entries linked through budget_entries
      const { data: linkedEntries } = await supabase
        .from('budget_entries')
        .select('accounting_entry_id')
        .eq('budget_id', budget.id)
        .not('accounting_entry_id', 'is', null);

      if (!linkedEntries || linkedEntries.length === 0) return [];

      const entryIds = linkedEntries
        .map(e => e.accounting_entry_id)
        .filter(Boolean) as string[];

      if (entryIds.length === 0) return [];

      const { data } = await supabase
        .from('accounting_entries')
        .select('*, account:accounting_accounts(account_number, account_name)')
        .in('id', entryIds)
        .order('entry_date', { ascending: false });

      return data || [];
    }
  });

  const addEntryMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('budget_entries')
        .insert({
          budget_id: budget.id,
          amount: newEntry.amount,
          description: newEntry.description,
          entry_date: newEntry.entry_date
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_entries', budget.id] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success("Dépense ajoutée");
      setShowAddEntry(false);
      setNewEntry({ amount: 0, description: "", entry_date: new Date().toISOString().split('T')[0] });
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout");
    }
  });

  const percentage = budget.allocated_amount > 0
    ? Math.min(100, (Number(budget.consumed_amount) / Number(budget.allocated_amount)) * 100)
    : 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Actif': 'bg-green-500',
      'Épuisé': 'bg-red-500',
      'Clôturé': 'bg-gray-500',
      'En attente': 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {budget.budget_name}
            <Badge className={getStatusColor(budget.status)}>{budget.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Montant Alloué
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Number(budget.allocated_amount).toLocaleString()} FCFA
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Consommé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {Number(budget.consumed_amount).toLocaleString()} FCFA
                </div>
                <Progress value={percentage} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}% utilisé</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Restant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${Number(budget.remaining_amount) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {Number(budget.remaining_amount).toLocaleString()} FCFA
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mission & Employee Info */}
          {(budget.mission || budget.employee) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informations liées</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {budget.mission && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Mission: {budget.mission.mission_number}</p>
                      <p className="text-sm text-muted-foreground">{budget.mission.destination}</p>
                      <p className="text-sm text-muted-foreground">{budget.mission.purpose}</p>
                    </div>
                  </div>
                )}
                {budget.employee && (
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Employé responsable</p>
                      <p className="text-sm text-muted-foreground">
                        {budget.employee.first_name} {budget.employee.last_name}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Budget Entries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Dépenses du Budget</CardTitle>
              {isManager && (
                <Button size="sm" onClick={() => setShowAddEntry(!showAddEntry)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showAddEntry && (
                <div className="mb-4 p-4 border rounded-lg space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium">Montant (FCFA)</label>
                      <Input
                        type="number"
                        value={newEntry.amount}
                        onChange={(e) => setNewEntry({ ...newEntry, amount: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={newEntry.entry_date}
                        onChange={(e) => setNewEntry({ ...newEntry, entry_date: e.target.value })}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={() => addEntryMutation.mutate()}
                        disabled={addEntryMutation.isPending || newEntry.amount <= 0}
                      >
                        Enregistrer
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                      placeholder="Description de la dépense..."
                    />
                  </div>
                </div>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetEntries?.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.entry_date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{entry.description || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(entry.amount).toLocaleString()} FCFA
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!budgetEntries || budgetEntries.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Aucune dépense enregistrée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Linked Accounting Entries */}
          {accountingEntries && accountingEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Écritures Comptables Liées</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Écriture</TableHead>
                      <TableHead>Compte</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountingEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.entry_number}</TableCell>
                        <TableCell>
                          {entry.account?.account_number} - {entry.account?.account_name}
                        </TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>
                          <Badge className={entry.entry_type === 'Débit' ? 'bg-red-500' : 'bg-green-500'}>
                            {entry.entry_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(entry.amount).toLocaleString()} FCFA
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
