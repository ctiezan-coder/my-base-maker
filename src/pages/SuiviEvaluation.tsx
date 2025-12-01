import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Search,
  Calendar,
} from "lucide-react";
import { useUserDirection } from "@/hooks/useUserDirection";
import { useUserRole } from "@/hooks/useUserRole";
import type { Imputation } from "@/types/imputation";
import { format, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { DirectionDetailsModal } from "@/components/suivi/DirectionDetailsModal";

export default function SuiviEvaluation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEtat, setFilterEtat] = useState<string>("all");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [filterPeriodStart, setFilterPeriodStart] = useState("");
  const [filterPeriodEnd, setFilterPeriodEnd] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDirectionId, setSelectedDirectionId] = useState<string>("");
  const [selectedDirectionName, setSelectedDirectionName] = useState<string>("");
  const queryClient = useQueryClient();

  // Get user's direction
  const { data: userDirection } = useUserDirection();
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === "admin";

  // Fetch all imputations from all directions
  const { data: imputations = [], isLoading } = useQuery({
    queryKey: ["imputations-evaluation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("imputations")
        .select("*")
        .order("date_reception", { ascending: false });
      
      if (error) throw error;
      return data as Imputation[];
    },
  });

  // Fetch directions
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

  const handleDirectionClick = (directionId: string, directionName: string) => {
    setSelectedDirectionId(directionId);
    setSelectedDirectionName(directionName);
    setModalOpen(true);
  };

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("imputations-evaluation")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "imputations",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["imputations-evaluation"],
          });
          toast.success("Données mises à jour");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Calculate processing duration
  const calculateDuration = (imputation: Imputation): number | null => {
    if (!imputation.date_realisation) return null;
    
    const start = parseISO(imputation.date_reception);
    const end = parseISO(imputation.date_realisation);
    return differenceInDays(end, start);
  };

  // Filter imputations
  const filteredImputations = imputations.filter((imputation) => {
    const matchesSearch =
      imputation.provenance.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imputation.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imputation.imputation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEtat = filterEtat === "all" || imputation.etat === filterEtat;

    const matchesDirection =
      filterDirection === "all" || imputation.direction_id === filterDirection;

    let matchesPeriod = true;
    if (filterPeriodStart) {
      matchesPeriod =
        matchesPeriod &&
        imputation.date_reception >= filterPeriodStart;
    }
    if (filterPeriodEnd) {
      matchesPeriod =
        matchesPeriod &&
        imputation.date_reception <= filterPeriodEnd;
    }

    return matchesSearch && matchesEtat && matchesDirection && matchesPeriod;
  });

  // Calculate statistics
  const stats = {
    total: filteredImputations.length,
    enAttente: filteredImputations.filter((i) => i.etat === "En attente").length,
    enCours: filteredImputations.filter((i) => i.etat === "En cours").length,
    terminees: filteredImputations.filter((i) => i.etat === "Terminé").length,
    avgDuration: (() => {
      const completed = filteredImputations.filter(
        (i) => i.etat === "Terminé" && i.date_realisation
      );
      if (completed.length === 0) return 0;
      const totalDays = completed.reduce((sum, imp) => {
        const duration = calculateDuration(imp);
        return sum + (duration || 0);
      }, 0);
      return Math.round(totalDays / completed.length);
    })(),
  };

  // Statistics by direction
  const statsByDirection = directions?.map((direction) => {
    const dirImputations = filteredImputations.filter(
      (i) => i.direction_id === direction.id
    );
    return {
      name: direction.name,
      total: dirImputations.length,
      enAttente: dirImputations.filter((i) => i.etat === "En attente").length,
      enCours: dirImputations.filter((i) => i.etat === "En cours").length,
      terminees: dirImputations.filter((i) => i.etat === "Terminé").length,
    };
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Direction",
      "Date réception",
      "Provenance",
      "Objet",
      "Imputation",
      "Date imputation",
      "Date réalisation",
      "Durée (jours)",
      "Observations",
      "État",
    ];

    const rows = filteredImputations.map((imp) => {
      const direction = directions?.find((d) => d.id === imp.direction_id);
      const duration = calculateDuration(imp);
      return [
        direction?.name || "N/A",
        imp.date_reception,
        imp.provenance,
        imp.objet,
        imp.imputation,
        imp.date_imputation || "",
        imp.date_realisation || "",
        duration !== null ? duration.toString() : "",
        imp.observations || "",
        imp.etat,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `suivi_evaluation_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    toast.success("Export CSV réussi");
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Suivi et Évaluation
          </h1>
          <p className="text-muted-foreground">
            Tableau de bord et analyse des imputations en temps réel
          </p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Global Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Imputations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enAttente}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? Math.round((stats.enAttente / stats.total) * 100)
                : 0}
              % du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enCours}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? Math.round((stats.enCours / stats.total) * 100)
                : 0}
              % du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.terminees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? Math.round((stats.terminees / stats.total) * 100)
                : 0}
              % du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Durée moyenne
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration}</div>
            <p className="text-xs text-muted-foreground">Jours de traitement</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={filterDirection} onValueChange={setFilterDirection}>
              <SelectTrigger>
                <SelectValue placeholder="Direction" />
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

            <Select value={filterEtat} onValueChange={setFilterEtat}>
              <SelectTrigger>
                <SelectValue placeholder="État" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les états</SelectItem>
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Terminé">Terminé</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="Date début"
                  value={filterPeriodStart}
                  onChange={(e) => setFilterPeriodStart(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Input
                type="date"
                placeholder="Date fin"
                value={filterPeriodEnd}
                onChange={(e) => setFilterPeriodEnd(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics by Direction */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques par Direction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {statsByDirection?.map((stat, index) => {
                const direction = directions?.find((d) => d.name === stat.name);
                // Assign colors and icons based on direction
                const colors = [
                  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "text-blue-500" },
                  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", icon: "text-purple-500" },
                  { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: "text-green-500" },
                  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: "text-orange-500" },
                  { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", icon: "text-pink-500" },
                  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", icon: "text-indigo-500" },
                  { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", icon: "text-teal-500" },
                  { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", icon: "text-cyan-500" },
                ];
                const colorScheme = colors[index % colors.length];

                return (
                  <div
                    key={stat.name}
                    onClick={() => {
                      if (direction) {
                        handleDirectionClick(direction.id, direction.name);
                      }
                    }}
                    className={`${colorScheme.bg} ${colorScheme.border} border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 relative overflow-hidden`}
                  >
                    {/* Background decoration */}
                    <div className={`absolute top-0 right-0 w-24 h-24 ${colorScheme.icon} opacity-10 -mr-8 -mt-8`}>
                      <BarChart3 className="w-full h-full" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon and Title */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`${colorScheme.icon} p-3 bg-white rounded-lg shadow-sm`}>
                          <BarChart3 className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${colorScheme.text}`}>
                            {stat.total}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stats.total > 0
                              ? Math.round((stat.total / stats.total) * 100)
                              : 0}
                            %
                          </div>
                        </div>
                      </div>

                      {/* Direction Name */}
                      <h3 className={`font-semibold text-sm mb-3 ${colorScheme.text} line-clamp-2 min-h-[2.5rem]`}>
                        {stat.name}
                      </h3>

                      {/* Statistics */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-yellow-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            En attente
                          </span>
                          <span className="font-semibold">{stat.enAttente}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-orange-600 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            En cours
                          </span>
                          <span className="font-semibold">{stat.enCours}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Terminées
                          </span>
                          <span className="font-semibold">{stat.terminees}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {stat.total > 0 && (
                        <div className="mt-4 pt-4 border-t border-white">
                          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-white">
                            {stat.enAttente > 0 && (
                              <div
                                className="bg-yellow-400"
                                style={{
                                  width: `${(stat.enAttente / stat.total) * 100}%`,
                                }}
                              />
                            )}
                            {stat.enCours > 0 && (
                              <div
                                className="bg-orange-400"
                                style={{
                                  width: `${(stat.enCours / stat.total) * 100}%`,
                                }}
                              />
                            )}
                            {stat.terminees > 0 && (
                              <div
                                className="bg-green-400"
                                style={{
                                  width: `${(stat.terminees / stat.total) * 100}%`,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vue Détaillée ({filteredImputations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Direction</th>
                  <th className="text-left p-2">Provenance</th>
                  <th className="text-left p-2">Objet</th>
                  <th className="text-left p-2">Imputation</th>
                  <th className="text-left p-2">Durée</th>
                  <th className="text-left p-2">État</th>
                </tr>
              </thead>
              <tbody>
                {filteredImputations.map((imp) => {
                  const direction = directions?.find(
                    (d) => d.id === imp.direction_id
                  );
                  const duration = calculateDuration(imp);
                  return (
                    <tr key={imp.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 text-sm">
                        {format(parseISO(imp.date_reception), "dd/MM/yyyy", {
                          locale: fr,
                        })}
                      </td>
                      <td className="p-2 text-sm">{direction?.name || "N/A"}</td>
                      <td className="p-2 text-sm">{imp.provenance}</td>
                      <td className="p-2 text-sm">{imp.objet}</td>
                      <td className="p-2 text-sm">{imp.imputation}</td>
                      <td className="p-2 text-sm">
                        {duration !== null ? `${duration} jours` : "-"}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            imp.etat === "Terminé"
                              ? "bg-green-100 text-green-800"
                              : imp.etat === "En cours"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {imp.etat}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Direction Details Modal */}
      <DirectionDetailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        directionId={selectedDirectionId}
        directionName={selectedDirectionName}
      />
    </div>
  );
}
