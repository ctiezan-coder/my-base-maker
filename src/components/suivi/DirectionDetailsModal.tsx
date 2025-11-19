import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Calendar, FileText, RefreshCw } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import type { Imputation } from "@/types/imputation";
import { useState, useEffect } from "react";
import { AddTrackingDialog } from "./AddTrackingDialog";
import { ChangeProjectStatusDialog } from "./ChangeProjectStatusDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface DirectionDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  directionId: string;
  directionName: string;
}

export function DirectionDetailsModal({
  open,
  onOpenChange,
  directionId,
  directionName,
}: DirectionDetailsModalProps) {
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch partnerships
  const { data: partnerships = [] } = useQuery({
    queryKey: ["partnerships-modal", directionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnerships")
        .select("*")
        .eq("direction_id", directionId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open && !!directionId,
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["projects-modal", directionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("direction_id", directionId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open && !!directionId,
  });

  // Fetch imputations
  const { data: imputations = [] } = useQuery({
    queryKey: ["imputations-modal", directionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("imputations")
        .select("*")
        .eq("direction_id", directionId)
        .order("date_reception", { ascending: false });
      if (error) throw error;
      return data as Imputation[];
    },
    enabled: open && !!directionId,
  });

  // Fetch project tracking
  const { data: trackings = [] } = useQuery({
    queryKey: ["project-tracking-modal", directionId],
    queryFn: async () => {
      if (projects.length === 0) return [];
      const projectIds = projects.map((p) => p.id);

      const { data, error } = await supabase
        .from("project_tracking")
        .select("*, projects(name)")
        .in("project_id", projectIds)
        .order("tracking_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open && !!directionId && projects.length > 0,
  });

  // Real-time updates
  useEffect(() => {
    if (!open || !directionId) return;

    const partnershipsChannel = supabase
      .channel(`partnerships-${directionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "partnerships",
          filter: `direction_id=eq.${directionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["partnerships-modal", directionId] });
          toast.success("Partenariats mis à jour");
        }
      )
      .subscribe();

    const projectsChannel = supabase
      .channel(`projects-${directionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: `direction_id=eq.${directionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["projects-modal", directionId] });
          toast.success("Projets mis à jour");
        }
      )
      .subscribe();

    const imputationsChannel = supabase
      .channel(`imputations-${directionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "imputations",
          filter: `direction_id=eq.${directionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["imputations-modal", directionId] });
          toast.success("Imputations mises à jour");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(partnershipsChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(imputationsChannel);
    };
  }, [open, directionId, queryClient]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["partnerships-modal", directionId] }),
      queryClient.invalidateQueries({ queryKey: ["projects-modal", directionId] }),
      queryClient.invalidateQueries({ queryKey: ["imputations-modal", directionId] }),
      queryClient.invalidateQueries({ queryKey: ["project-tracking-modal", directionId] }),
    ]);
    toast.success("Données rafraîchies");
    setIsRefreshing(false);
  };

  const calculateDuration = (imputation: Imputation): number | null => {
    if (!imputation.date_realisation) return null;
    const start = parseISO(imputation.date_reception);
    const end = parseISO(imputation.date_realisation);
    return differenceInDays(end, start);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{directionName}</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Rafraîchir
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
            <div className="space-y-6">
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
                  <CardTitle>Imputations ({imputations.length})</CardTitle>
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
                        {imputations.map((imp) => {
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
                        {imputations.length === 0 && (
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
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Nested Dialogs */}
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
    </>
  );
}
