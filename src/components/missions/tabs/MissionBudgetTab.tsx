import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MissionOrder, MissionExpense } from "@/types/mission";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Wallet, 
  Plane, 
  Hotel, 
  Utensils, 
  FileText, 
  Shield,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle
} from "lucide-react";

interface MissionBudgetTabProps {
  mission: MissionOrder;
  expenses: MissionExpense[];
}

export function MissionBudgetTab({ mission, expenses }: MissionBudgetTabProps) {
  const currency = mission.currency || 'FCFA';
  
  const budgetItems = [
    { label: 'Transport', value: mission.transport_cost, icon: Plane },
    { label: 'Hébergement', value: mission.accommodation_cost, icon: Hotel },
    { label: 'Per diem', value: mission.per_diem_amount, icon: Utensils, days: mission.per_diem_days },
    { label: 'Visa', value: mission.visa_cost, icon: FileText },
    { label: 'Assurance', value: mission.insurance_cost, icon: Shield },
    { label: 'Autres frais', value: mission.other_costs, icon: MoreHorizontal },
  ];

  const totalEstimated = mission.estimated_budget || 0;
  const totalActual = expenses.reduce((acc, e) => acc + e.amount, 0);
  const variance = totalActual - totalEstimated;
  const consumptionRate = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;

  const advanceStatus = mission.advance_status || 'En attente';
  const advanceStatusColors: Record<string, string> = {
    'En attente': 'bg-yellow-500',
    'Approuvée': 'bg-blue-500',
    'Versée': 'bg-green-500',
    'Liquidée': 'bg-gray-500',
  };

  return (
    <div className="space-y-6">
      {/* Résumé budget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget Estimé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalEstimated.toLocaleString()} {currency}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dépenses Réelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalActual.toLocaleString()} {currency}
            </div>
            <Progress value={Math.min(consumptionRate, 100)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{consumptionRate.toFixed(0)}% consommé</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Écart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${variance > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {variance > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {Math.abs(variance).toLocaleString()} {currency}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {variance > 0 ? 'Dépassement' : 'Économie'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Détail budget estimé */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5" />
            Estimation des Coûts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgetItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span>{item.label}</span>
                  {item.days && (
                    <Badge variant="secondary">{item.days} jours</Badge>
                  )}
                </div>
                <span className="font-medium">
                  {item.value ? `${item.value.toLocaleString()} ${currency}` : '-'}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg font-bold">
              <span>Total Estimé</span>
              <span>{totalEstimated.toLocaleString()} {currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avance sur frais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Avance sur Frais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Montant</p>
              <p className="font-medium">
                {mission.advance_amount?.toLocaleString() || '-'} {mission.advance_currency || currency}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <Badge className={advanceStatusColors[advanceStatus]}>{advanceStatus}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mode de versement</p>
              <p className="font-medium">{mission.advance_payment_mode || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date de versement</p>
              <p className="font-medium">
                {mission.advance_payment_date 
                  ? format(new Date(mission.advance_payment_date), 'dd/MM/yyyy', { locale: fr })
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Référence</p>
              <p className="font-medium">{mission.advance_transaction_ref || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imputation budgétaire */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Imputation Budgétaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Direction imputée</p>
              <p className="font-medium">{mission.direction?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projet</p>
              <p className="font-medium">{mission.project?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Centre de coût</p>
              <p className="font-medium">{mission.cost_center || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget disponible</p>
              <div className="flex items-center gap-2">
                {mission.budget_available ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">{mission.budget_available ? 'Oui' : 'Non'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des dépenses */}
      {expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dépenses Réelles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Justificatif</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {expense.expense_date 
                        ? format(new Date(expense.expense_date), 'dd/MM/yyyy', { locale: fr })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.expense_category}</Badge>
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="text-right font-medium">
                      {expense.amount.toLocaleString()} {expense.currency}
                    </TableCell>
                    <TableCell>
                      {expense.receipt_number || (expense.receipt_url ? 'Téléversé' : '-')}
                    </TableCell>
                    <TableCell>
                      <Badge className={expense.is_justified ? 'bg-green-500' : 'bg-yellow-500'}>
                        {expense.justification_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
