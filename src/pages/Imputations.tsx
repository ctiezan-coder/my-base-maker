import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserDirection } from "@/hooks/useUserDirection";
import { useIsDirectionGenerale } from "@/hooks/useDirectionAccess";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImputationDialog } from "@/components/imputations/ImputationDialog";
import { ImputationTable } from "@/components/imputations/ImputationTable";
import { Plus, Search, Download, FileText, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { Imputation } from "@/types/imputation";

export default function Imputations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEtat, setFilterEtat] = useState<string>("all");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [selectedImputation, setSelectedImputation] = useState<Imputation | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: userDirection } = useUserDirection();
  const { data: isDG } = useIsDirectionGenerale();
  const { data: userRole } = useUserRole();
  const canManageImputations = isDG || userRole === 'admin';

  const { data: imputations = [], isLoading } = useQuery({
    queryKey: ['imputations', userDirection?.direction_id],
    queryFn: async () => {
      // RLS policies will filter based on user's permissions
      const { data, error } = await supabase
        .from('imputations')
        .select('*')
        .order('date_reception', { ascending: false });

      if (error) throw error;
      return data as Imputation[];
    },
    enabled: !!userDirection?.direction_id,
  });

  const { data: directions } = useQuery({
    queryKey: ['directions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('directions')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Real-time notifications for new imputations and status changes
  useEffect(() => {
    const channel = supabase
      .channel('imputations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'imputations'
        },
        (payload) => {
          const newImputation = payload.new as Imputation;
          toast({
            title: "Nouvelle imputation",
            description: `Une nouvelle imputation de "${newImputation.provenance}" a été créée.`,
          });
          queryClient.invalidateQueries({ queryKey: ['imputations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'imputations'
        },
        (payload) => {
          const updatedImputation = payload.new as Imputation;
          const oldImputation = payload.old as Imputation;
          
          if (updatedImputation.etat !== oldImputation.etat) {
            toast({
              title: "État mis à jour",
              description: `L'imputation "${updatedImputation.objet}" est maintenant "${updatedImputation.etat}".`,
            });
          }
          queryClient.invalidateQueries({ queryKey: ['imputations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, queryClient]);

  // Extract unique years from imputations
  const availableYears = Array.from(
    new Set(
      imputations.map((imp) => new Date(imp.date_reception).getFullYear())
    )
  ).sort((a, b) => b - a);

  const filteredImputations = imputations.filter((imputation) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" ||
      imputation.provenance.toLowerCase().includes(searchLower) ||
      imputation.objet.toLowerCase().includes(searchLower) ||
      imputation.imputation.toLowerCase().includes(searchLower) ||
      imputation.etat.toLowerCase().includes(searchLower) ||
      (imputation.observations?.toLowerCase().includes(searchLower) || false) ||
      imputation.date_reception.includes(searchTerm) ||
      (imputation.date_imputation?.includes(searchTerm) || false) ||
      (imputation.date_realisation?.includes(searchTerm) || false);

    const matchesEtat = filterEtat === "all" || imputation.etat === filterEtat;
    
    const matchesDirection =
      filterDirection === "all" || imputation.direction_id === filterDirection;

    const matchesYear =
      filterYear === "all" ||
      new Date(imputation.date_reception).getFullYear().toString() === filterYear;

    return matchesSearch && matchesEtat && matchesDirection && matchesYear;
  });

  const stats = {
    total: imputations.length,
    enAttente: imputations.filter((i) => i.etat === "En attente").length,
    enCours: imputations.filter((i) => i.etat === "En cours").length,
    terminees: imputations.filter((i) => i.etat === "Terminé").length,
  };

  const handleEdit = (imputation: Imputation) => {
    setSelectedImputation(imputation);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedImputation(null);
    setDialogOpen(true);
  };

  const exportToCSV = () => {
    const headers = [
      "Date réception",
      "Provenance",
      "Objet",
      "Imputation",
      "Date imputation",
      "Date réalisation",
      "Observations",
      "État",
    ];

    const rows = filteredImputations.map((imp) => [
      imp.date_reception,
      imp.provenance,
      imp.objet,
      imp.imputation,
      imp.date_imputation || "",
      imp.date_realisation || "",
      imp.observations || "",
      imp.etat,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `imputations_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Imputations</h1>
          <p className="text-muted-foreground">
            Suivi des documents entrants et de leur traitement
          </p>
        </div>
        {canManageImputations && (
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Imputation
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enAttente}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enCours}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.terminees}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par provenance, objet ou direction..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={filterEtat} onValueChange={setFilterEtat}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tous les états" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les états</SelectItem>
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Terminé">Terminé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDirection} onValueChange={setFilterDirection}>
              <SelectTrigger className="w-full md:w-[200px]">
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

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Toutes années" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes années</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Exporter CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <ImputationTable
            imputations={filteredImputations}
            onEdit={handleEdit}
            canManage={canManageImputations}
          />
        </CardContent>
      </Card>

      {/* Dialog */}
      <ImputationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        imputation={selectedImputation}
      />
    </div>
  );
}
