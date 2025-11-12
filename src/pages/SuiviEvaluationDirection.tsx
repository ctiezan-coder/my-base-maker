import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Plus,
  Edit,
  Calendar as CalendarIcon,
  FileText,
} from "lucide-react";
import { useUserDirection } from "@/hooks/useUserDirection";
import { useUserRole } from "@/hooks/useUserRole";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { AddTrackingDialog } from "@/components/suivi/AddTrackingDialog";
import { ChangeProjectStatusDialog } from "@/components/suivi/ChangeProjectStatusDialog";

export default function SuiviEvaluationDirection() {
  const { data: userDirection } = useUserDirection();
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === "admin";

  const [selectedDirection, setSelectedDirection] = useState<string>("");
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

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

  // Auto-select first direction or user's direction
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
    queryKey: ["partnerships", selectedDirection],
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
    queryKey: ["projects", selectedDirection],
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

  // Fetch imputations for selected direction
  const { data: imputations = [] } = useQuery({
    queryKey: ["imputations", selectedDirection],
    queryFn: async () => {
      if (!selectedDirection) return [];
      const { data, error } = await supabase
        .from("imputations")
        .select("*")
        .eq("direction_id", selectedDirection)
        .order("date_reception", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDirection,
  });

  // Fetch project tracking for selected direction
  const { data: trackings = [] } = useQuery({
    queryKey: ["project-tracking", selectedDirection],
    queryFn: async () => {
      if (!selectedDirection) return [];
      const projectIds = projects.map((p) => p.id);
      if (projectIds.length === 0) return [];

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

  const selectedDirectionName =
    directions?.find((d) => d.id === selectedDirection)?.name || "";

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Suivi par Direction
          </h1>
          <p className="text-muted-foreground">
            Vue détaillée des activités par direction
          </p>
        </div>
      </div>

      {/* Direction Tabs */}
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

        {directions?.map((direction) => (
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
                          <tr key={partnership.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{partnership.partner_name}</td>
                            <td className="p-2">{partnership.partner_type}</td>
                            <td className="p-2">
                              {partnership.start_date
                                ? format(parseISO(partnership.start_date), "dd/MM/yyyy", {
                                    locale: fr,
                                  })
                                : "-"}
                            </td>
                            <td className="p-2">{partnership.status}</td>
                          </tr>
                        ))}
                        {partnerships.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-muted-foreground">
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
                          <tr key={project.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{project.name}</td>
                            <td className="p-2">
                              {project.budget ? `${project.budget} CFA` : "-"}
                            </td>
                            <td className="p-2">
                              {project.end_date
                                ? format(parseISO(project.end_date), "dd/MM/yyyy", {
                                    locale: fr,
                                  })
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
                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
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
                  <CardTitle>Imputations Budgétaires ({imputations.length})</CardTitle>
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
                          <th className="text-left p-2">État</th>
                        </tr>
                      </thead>
                      <tbody>
                        {imputations.map((imputation) => (
                          <tr key={imputation.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 text-sm">
                              {format(parseISO(imputation.date_reception), "dd/MM/yyyy", {
                                locale: fr,
                              })}
                            </td>
                            <td className="p-2 text-sm">{imputation.provenance}</td>
                            <td className="p-2 text-sm">{imputation.objet}</td>
                            <td className="p-2 text-sm">{imputation.imputation}</td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  imputation.etat === "Terminé"
                                    ? "bg-green-100 text-green-800"
                                    : imputation.etat === "En cours"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {imputation.etat}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {imputations.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
                              Aucune imputation
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tracking History */}
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
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
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
                                {format(parseISO(tracking.tracking_date), "dd/MM/yyyy", {
                                  locale: fr,
                                })}
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
        ))}
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
