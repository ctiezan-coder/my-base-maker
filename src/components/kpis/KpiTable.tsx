import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import type { KpiTracking } from "@/types/kpi";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface KpiTableProps {
  kpis: KpiTracking[];
  isLoading: boolean;
  onEdit: (kpi: KpiTracking) => void;
  onDelete: (kpi: KpiTracking) => void;
}

export function KpiTable({ kpis, isLoading, onEdit, onDelete }: KpiTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [kpiToDelete, setKpiToDelete] = useState<KpiTracking | null>(null);

  const handleDeleteClick = (kpi: KpiTracking) => {
    setKpiToDelete(kpi);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (kpiToDelete) {
      onDelete(kpiToDelete);
      setDeleteDialogOpen(false);
      setKpiToDelete(null);
    }
  };

  const getPerformanceIndicator = (value: number, target?: number | null) => {
    if (!target) return <Minus className="w-4 h-4 text-muted-foreground" />;
    
    const percentage = (value / target) * 100;
    if (percentage >= 100) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (percentage >= 80) {
      return <TrendingUp className="w-4 h-4 text-yellow-600" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
  };

  const getPerformanceBadge = (value: number, target?: number | null) => {
    if (!target) return null;
    
    const percentage = (value / target) * 100;
    if (percentage >= 100) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Atteint</Badge>;
    } else if (percentage >= 80) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">En cours</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">À risque</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (kpis.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Aucun KPI trouvé
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>KPI</TableHead>
            <TableHead>Période</TableHead>
            <TableHead className="text-right">Valeur</TableHead>
            <TableHead className="text-right">Cible</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kpis.map((kpi) => (
            <TableRow key={kpi.id}>
              <TableCell className="font-medium">{kpi.kpi_name}</TableCell>
              <TableCell>
                {format(new Date(kpi.period), "MMMM yyyy", { locale: fr })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {getPerformanceIndicator(kpi.kpi_value, kpi.target_value)}
                  <span className="font-semibold">
                    {kpi.kpi_value.toLocaleString('fr-FR')}
                    {kpi.unit && ` ${kpi.unit}`}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {kpi.target_value ? (
                  <>
                    {kpi.target_value.toLocaleString('fr-FR')}
                    {kpi.unit && ` ${kpi.unit}`}
                  </>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {getPerformanceBadge(kpi.kpi_value, kpi.target_value)}
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                {kpi.notes || "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(kpi)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(kpi)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le KPI "{kpiToDelete?.kpi_name}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
