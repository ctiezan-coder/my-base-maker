import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, BarChart3, Filter } from "lucide-react";
import { KpiDialog } from "@/components/kpis/KpiDialog";
import { KpiTable } from "@/components/kpis/KpiTable";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { KpiTracking } from "@/types/kpi";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";

export default function Kpis() {
  const { toast } = useToast();
  const { canAccess: canManageKpis } = useCanAccessModule("kpis", "manager");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KpiTracking | null>(null);
  const [directionFilter, setDirectionFilter] = useState<string>("all");

  const { data: directions } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directions")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: kpis, isLoading, refetch } = useQuery({
    queryKey: ["kpis", search, directionFilter],
    queryFn: async () => {
      let query = supabase
        .from("kpi_tracking")
        .select("*")
        .order("period", { ascending: false })
        .order("kpi_name");

      if (search) {
        query = query.or(`kpi_name.ilike.%${search}%,notes.ilike.%${search}%`);
      }

      if (directionFilter && directionFilter !== "all") {
        query = query.eq("direction_id", directionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as KpiTracking[];
    },
  });

  const handleEdit = (kpi: KpiTracking) => {
    setSelectedKpi(kpi);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedKpi(null);
    setDialogOpen(false);
    refetch();
  };

  const handleDelete = async (kpi: KpiTracking) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le KPI "${kpi.kpi_name}" ?\n\n` +
      `Cette action est irréversible.`
    );
    
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("kpi_tracking")
        .delete()
        .eq("id", kpi.id);

      if (error) throw error;

      toast({ 
        title: "KPI supprimé avec succès",
        description: `${kpi.kpi_name} a été supprimé.`
      });
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      toast({
        variant: "destructive",
        title: "Erreur lors de la suppression",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Suivi des KPIs
          </h1>
          <p className="text-muted-foreground mt-1">
            Tableau de bord des indicateurs de performance clés
          </p>
        </div>
        {canManageKpis && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau KPI
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher par nom ou notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 sm:w-64">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les directions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les directions</SelectItem>
                  {directions?.map((direction) => (
                    <SelectItem key={direction.id} value={direction.id}>
                      {direction.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <KpiTable
            kpis={kpis || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <KpiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        kpi={selectedKpi}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
