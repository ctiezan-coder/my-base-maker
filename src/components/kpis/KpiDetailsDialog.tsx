import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KpiTracking } from "@/types/kpi";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface KpiDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpi: KpiTracking | null;
}

export function KpiDetailsDialog({ open, onOpenChange, kpi }: KpiDetailsDialogProps) {
  if (!kpi) return null;

  const getPerformanceIndicator = (value: number, target?: number | null) => {
    if (!target) return <Minus className="w-5 h-5 text-muted-foreground" />;
    
    const percentage = (value / target) * 100;
    if (percentage >= 100) {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else if (percentage >= 80) {
      return <TrendingUp className="w-5 h-5 text-yellow-600" />;
    } else {
      return <TrendingDown className="w-5 h-5 text-red-600" />;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{kpi.kpi_name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Période</label>
              <p className="text-lg font-semibold">
                {format(new Date(kpi.period), "MMMM yyyy", { locale: fr })}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Statut</label>
              <div>{getPerformanceBadge(kpi.kpi_value, kpi.target_value)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Valeur actuelle</label>
              <div className="flex items-center gap-3">
                {getPerformanceIndicator(kpi.kpi_value, kpi.target_value)}
                <p className="text-2xl font-bold">
                  {kpi.kpi_value.toLocaleString('fr-FR')}
                  {kpi.unit && ` ${kpi.unit}`}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Valeur cible</label>
              <p className="text-2xl font-bold">
                {kpi.target_value ? (
                  <>
                    {kpi.target_value.toLocaleString('fr-FR')}
                    {kpi.unit && ` ${kpi.unit}`}
                  </>
                ) : (
                  <span className="text-muted-foreground">Non définie</span>
                )}
              </p>
            </div>
          </div>

          {kpi.target_value && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Progression</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{((kpi.kpi_value / kpi.target_value) * 100).toFixed(1)}%</span>
                  <span className="text-muted-foreground">
                    {kpi.kpi_value.toLocaleString('fr-FR')} / {kpi.target_value.toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      (kpi.kpi_value / kpi.target_value) * 100 >= 100
                        ? "bg-green-600"
                        : (kpi.kpi_value / kpi.target_value) * 100 >= 80
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                    style={{
                      width: `${Math.min((kpi.kpi_value / kpi.target_value) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {kpi.notes && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Détails</label>
              <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm">
                {kpi.notes}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
