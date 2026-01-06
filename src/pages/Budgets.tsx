import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Eye } from "lucide-react";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";
import { BudgetDialog } from "@/components/budgets/BudgetDialog";
import { BudgetDetailsDialog } from "@/components/budgets/BudgetDetailsDialog";
import { Progress } from "@/components/ui/progress";

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

export default function Budgets() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const { canAccess: isManager } = useCanAccessModule('comptabilite', 'manager');

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data } = await supabase
        .from('budgets')
        .select(`
          *,
          mission:mission_orders(mission_number, destination, purpose),
          employee:employees(first_name, last_name),
          direction:directions(name)
        `)
        .order('created_at', { ascending: false });
      return (data || []) as Budget[];
    }
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Actif': 'bg-green-500',
      'Épuisé': 'bg-red-500',
      'Clôturé': 'bg-gray-500',
      'En attente': 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getConsumptionPercentage = (consumed: number, allocated: number) => {
    if (allocated === 0) return 0;
    return Math.min(100, (consumed / allocated) * 100);
  };

  const stats = {
    total: budgets?.length || 0,
    totalAllocated: budgets?.reduce((sum, b) => sum + Number(b.allocated_amount), 0) || 0,
    totalConsumed: budgets?.reduce((sum, b) => sum + Number(b.consumed_amount), 0) || 0,
    totalRemaining: budgets?.reduce((sum, b) => sum + Number(b.remaining_amount), 0) || 0
  };

  const handleViewDetails = (budget: Budget) => {
    setSelectedBudget(budget);
    setDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Budgets</h1>
          <p className="text-muted-foreground">Suivi budgétaire des missions et comptabilité</p>
        </div>
        {isManager && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Budget
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Alloué</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAllocated.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consommé</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConsumed.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restant</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRemaining.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Budget</TableHead>
                <TableHead>Mission</TableHead>
                <TableHead>Employé</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Alloué</TableHead>
                <TableHead>Consommation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets?.map((budget) => {
                const percentage = getConsumptionPercentage(
                  Number(budget.consumed_amount),
                  Number(budget.allocated_amount)
                );
                return (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">{budget.budget_name}</TableCell>
                    <TableCell>
                      {budget.mission ? (
                        <span className="text-sm">
                          {budget.mission.mission_number} - {budget.mission.destination}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {budget.employee ? (
                        `${budget.employee.first_name} ${budget.employee.last_name}`
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{budget.fiscal_year}</TableCell>
                    <TableCell>{Number(budget.allocated_amount).toLocaleString()} FCFA</TableCell>
                    <TableCell className="min-w-[200px]">
                      <div className="space-y-1">
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Number(budget.consumed_amount).toLocaleString()} FCFA</span>
                          <span>{percentage.toFixed(0)}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(budget.status)}>{budget.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(budget)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {budgets?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Aucun budget
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BudgetDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      
      {selectedBudget && (
        <BudgetDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          budget={selectedBudget}
        />
      )}
    </div>
  );
}
