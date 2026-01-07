import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PartnershipFinancesTabProps {
  partnershipId: string;
  budget?: number;
  partnerContribution?: number;
  canManage: boolean;
}

const TRANSACTION_TYPES = [
  { value: "decaissement", label: "Décaissement", icon: ArrowUpRight },
  { value: "reception", label: "Réception", icon: ArrowDownLeft },
  { value: "remboursement", label: "Remboursement", icon: TrendingDown }
];

export function PartnershipFinancesTab({ 
  partnershipId, 
  budget = 0, 
  partnerContribution = 0,
  canManage 
}: PartnershipFinancesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    transaction_type: "",
    amount: "",
    transaction_date: new Date().toISOString().split("T")[0],
    description: "",
    source: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["partnership-finances", partnershipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnership_finances")
        .select("*")
        .eq("partnership_id", partnershipId)
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("partnership_finances")
        .insert([{
          partnership_id: partnershipId,
          ...data,
          amount: parseFloat(data.amount)
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnership-finances", partnershipId] });
      toast({ title: "Transaction enregistrée" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  });

  const resetForm = () => {
    setFormData({
      transaction_type: "",
      amount: "",
      transaction_date: new Date().toISOString().split("T")[0],
      description: "",
      source: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  // Calculate totals
  const totalBudget = budget + partnerContribution;
  const totalSpent = transactions
    .filter(t => t.transaction_type === "decaissement")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalReceived = transactions
    .filter(t => t.transaction_type === "reception")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const remaining = totalBudget - totalSpent + totalReceived;
  const usagePercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget total</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("fr-FR").format(totalBudget)} <span className="text-sm font-normal">FCFA</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ACIEX: {new Intl.NumberFormat("fr-FR").format(budget)} | Partenaire: {new Intl.NumberFormat("fr-FR").format(partnerContribution)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dépensé</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold text-destructive">
              {new Intl.NumberFormat("fr-FR").format(totalSpent)} <span className="text-sm font-normal">FCFA</span>
            </div>
            <Progress value={usagePercent} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reçu</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("fr-FR").format(totalReceived)} <span className="text-sm font-normal">FCFA</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Solde</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {new Intl.NumberFormat("fr-FR").format(remaining)} <span className="text-sm font-normal">FCFA</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {usagePercent.toFixed(1)}% du budget utilisé
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Button */}
      {canManage && (
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enregistrer une transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      value={formData.transaction_type}
                      onValueChange={(v) => setFormData({ ...formData, transaction_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSACTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.transaction_date}
                      onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

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
                  <Label>Source/Destination</Label>
                  <Input
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="Ex: Compte partenariat, Fournisseur X..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    Enregistrer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucune transaction enregistrée
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const txType = TRANSACTION_TYPES.find(t => t.value === tx.transaction_type);
                const Icon = txType?.icon || Wallet;
                const isDebit = tx.transaction_type === "decaissement";
                
                return (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {format(new Date(tx.transaction_date), "dd/MM/yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isDebit ? "destructive" : "default"} className="gap-1">
                        <Icon className="w-3 h-3" />
                        {txType?.label || tx.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{tx.description || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{tx.source || "-"}</TableCell>
                    <TableCell className={`text-right font-medium ${isDebit ? 'text-destructive' : 'text-green-600'}`}>
                      {isDebit ? "-" : "+"}
                      {new Intl.NumberFormat("fr-FR").format(tx.amount)} FCFA
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
