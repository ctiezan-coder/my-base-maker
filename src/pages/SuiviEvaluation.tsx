import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Edit,
  FileText,
} from "lucide-react";
import { useUserDirection } from "@/hooks/useUserDirection";
import { useUserRole } from "@/hooks/useUserRole";
import type { Imputation } from "@/types/imputation";
import { format, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { AddTrackingDialog } from "@/components/suivi/AddTrackingDialog";
import { ChangeProjectStatusDialog } from "@/components/suivi/ChangeProjectStatusDialog";

export default function SuiviEvaluation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEtat, setFilterEtat] = useState<string>("all");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [filterPeriodStart, setFilterPeriodStart] = useState("");
  const [filterPeriodEnd, setFilterPeriodEnd] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<string>("");
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const queryClient = useQueryClient();

  // Get user's direction
  const { data: userDirection } = useUserDirection();
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === "admin";

  // Fetch imputations with direction filter
  const { data: imputations = [], isLoading } = useQuery({
    queryKey: ["imputations-evaluation", userDirection?.direction_id, isAdmin],
    queryFn: async () => {
      let query = supabase.from("imputations").select("*");

      // Filter by direction unless user is admin
      if (!isAdmin && userDirection?.direction_id) {
        query = query.eq("direction_id", userDirection.direction_id);
      }

      const { data, error } = await query.order("date_reception", {
        ascending: false,
      });
      if (error) throw error;
      return data as Imputation[];
    },
    enabled: isAdmin || !!userDirection?.direction_id,
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

  // Auto-select first direction
  useEffect(() => {
    if (directions && directions.length > 0 && !selectedDirection) {
      if (!isAdmin && userDirection?.direction_id) {
        setSelectedDirection(userDirection.direction_id);
      } else {
        setSelectedDirection(directions[0].id);
      }
    }
  }, [directions, userDirection, isAdmin, selectedDirection]);

  // Fetch partnerships for selected direction
  const { data: partnerships = [] } = useQuery({
    queryKey: ["partnerships-suivi", selectedDirection],
    queryFn: async () => {
      if (!selectedDirection) return [];
      const { data, error } = await supabase
        .from("partnerships")
        .select("*")
        .eq("direction_id", selectedDirection)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDirection,
  });

  // Fetch projects for selected direction
  const { data: projects = [] } = useQuery({
    queryKey: ["projects-suivi", selectedDirection],
    queryFn: async () => {
      if (!selectedDirection) return [];
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("direction_id", selectedDirection)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDirection,
  });

  // Fetch project tracking for selected direction
  const { data: trackings = [] } = useQuery({
    queryKey: ["project-tracking-suivi", selectedDirection],
    queryFn: async () => {
      if (!selectedDirection || projects.length === 0) return [];
      const projectIds = projects.map((p) => p.id);

      const { data, error } = await supabase
        .from("project_tracking")
        .select("*, projects(name)")
        .in("project_id", projectIds)
        .order("tracking_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDirection && projects.length > 0,
  });

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

            {isAdmin && (
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
            )}

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
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques par Direction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statsByDirection?.map((stat) => (
                <div
                  key={stat.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{stat.name}</h3>
                    <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
                      <span>Total: {stat.total}</span>
                      <span className="text-yellow-600">
                        En attente: {stat.enAttente}
                      </span>
                      <span className="text-orange-600">
                        En cours: {stat.enCours}
                      </span>
                      <span className="text-green-600">
                        Terminées: {stat.terminees}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{stat.total}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.total > 0
                        ? Math.round((stat.total / stats.total) * 100)
                        : 0}
                      % du total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Direction Details Tabs */}
      <Tabs
        value={selectedDirection}
        onValueChange={setSelectedDirection}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {directions?.map((direction) => (
            <TabsTrigger
              key={direction.id}
              value={direction.id}
              className="text-xs"
            >
              {direction.name.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {directions?.map((direction) => {
          const directionImputations = imputations.filter(
            (i) => i.direction_id === direction.id
          );

          return (
            <TabsContent key={direction.id} value={direction.id}>
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">{direction.name}</h2>

                {/* Partnerships Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Partenariats ({partnerships.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Partenaire</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Date début</th>
                            <th className="text-left p-2">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {partnerships.map((partnership) => (
                            <tr
                              key={partnership.id}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="p-2">{partnership.partner_name}</td>
                              <td className="p-2">{partnership.partner_type}</td>
                              <td className="p-2">
                                {partnership.start_date
                                  ? format(
                                      parseISO(partnership.start_date),
                                      "dd/MM/yyyy",
                                      { locale: fr }
                                    )
                                  : "-"}
                              </td>
                              <td className="p-2">{partnership.status}</td>
                            </tr>
                          ))}
                          {partnerships.length === 0 && (
                            <tr>
                              <td
                                colSpan={4}
                                className="p-4 text-center text-muted-foreground"
                              >
                                Aucun partenariat
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Projects Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Projets ({projects.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Nom</th>
                            <th className="text-left p-2">Budget</th>
                            <th className="text-left p-2">Échéance</th>
                            <th className="text-left p-2">Statut</th>
                            <th className="text-left p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.map((project) => (
                            <tr
                              key={project.id}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="p-2">{project.name}</td>
                              <td className="p-2">
                                {project.budget ? `${project.budget} CFA` : "-"}
                              </td>
                              <td className="p-2">
                                {project.end_date
                                  ? format(
                                      parseISO(project.end_date),
                                      "dd/MM/yyyy",
                                      { locale: fr }
                                    )
                                  : "-"}
                              </td>
                              <td className="p-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    project.status === "complété"
                                      ? "bg-green-100 text-green-800"
                                      : project.status === "en cours"
                                      ? "bg-blue-100 text-blue-800"
                                      : project.status === "suspendu"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {project.status}
                                </span>
                              </td>
                              <td className="p-2">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedProject(project);
                                      setTrackingDialogOpen(true);
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Suivi
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedProject(project);
                                      setStatusDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Statut
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {projects.length === 0 && (
                            <tr>
                              <td
                                colSpan={5}
                                className="p-4 text-center text-muted-foreground"
                              >
                                Aucun projet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Imputations Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Imputations ({directionImputations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Date</th>
                            <th className="text-left p-2">Provenance</th>
                            <th className="text-left p-2">Objet</th>
                            <th className="text-left p-2">Imputation</th>
                            <th className="text-left p-2">Durée</th>
                            <th className="text-left p-2">État</th>
                          </tr>
                        </thead>
                        <tbody>
                          {directionImputations.map((imp) => {
                            const duration = calculateDuration(imp);
                            return (
                              <tr
                                key={imp.id}
                                className="border-b hover:bg-muted/50"
                              >
                                <td className="p-2 text-sm">
                                  {format(
                                    parseISO(imp.date_reception),
                                    "dd/MM/yyyy",
                                    { locale: fr }
                                  )}
                                </td>
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
                          {directionImputations.length === 0 && (
                            <tr>
                              <td
                                colSpan={6}
                                className="p-4 text-center text-muted-foreground"
                              >
                                Aucune imputation
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Tracking History */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <FileText className="w-5 h-5 inline mr-2" />
                      Historique des Suivis ({trackings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trackings.map((tracking: any) => (
                        <div
                          key={tracking.id}
                          className="p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {tracking.tracking_type}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  - {tracking.projects?.name}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {tracking.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>
                                  Date:{" "}
                                  {format(
                                    parseISO(tracking.tracking_date),
                                    "dd/MM/yyyy",
                                    { locale: fr }
                                  )}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded ${
                                    tracking.status === "Complété"
                                      ? "bg-green-100 text-green-800"
                                      : tracking.status === "En cours"
                                      ? "bg-blue-100 text-blue-800"
                                      : tracking.status === "Annulé"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {tracking.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {trackings.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">
                          Aucun suivi enregistré
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Dialogs */}
      {selectedProject && (
        <>
          <AddTrackingDialog
            open={trackingDialogOpen}
            onOpenChange={setTrackingDialogOpen}
            projectId={selectedProject.id}
            projectName={selectedProject.name}
          />
          <ChangeProjectStatusDialog
            open={statusDialogOpen}
            onOpenChange={setStatusDialogOpen}
            projectId={selectedProject.id}
            projectName={selectedProject.name}
            currentStatus={selectedProject.status}
          />
        </>
      )}
    </div>
  );
}
