import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FolderKanban, Search } from "lucide-react";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { ProjectList } from "@/components/projects/ProjectList";
import { useUserDirection } from "@/hooks/useUserDirection";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";

export default function Projects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const { data: userDirection } = useUserDirection();
  const { canAccess: canManageProjects } = useCanAccessModule("projects", "manager");

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ["projects", userDirection?.direction_id],
    queryFn: async () => {
      // Filtrer les projets par la direction de l'utilisateur
      const { data, error } = await supabase
        .from("projects")
        .select("*, directions(name)")
        .eq("direction_id", userDirection?.direction_id)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
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

  // Extract unique years from projects
  const availableYears = Array.from(
    new Set(
      projects?.map((proj) => {
        const date = proj.start_date || proj.created_at;
        return new Date(date).getFullYear();
      }) || []
    )
  ).sort((a, b) => b - a);

  const filteredProjects = projects?.filter((project) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" ||
      project.name.toLowerCase().includes(searchLower) ||
      (project.description?.toLowerCase().includes(searchLower) || false) ||
      (project.status?.toLowerCase().includes(searchLower) || false) ||
      (project.dfe_number?.toLowerCase().includes(searchLower) || false) ||
      (project.rccm_number?.toLowerCase().includes(searchLower) || false);

    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    
    const matchesDirection =
      filterDirection === "all" || project.direction_id === filterDirection;

    const projectDate = project.start_date || project.created_at;
    const matchesYear =
      filterYear === "all" ||
      new Date(projectDate).getFullYear().toString() === filterYear;

    return matchesSearch && matchesStatus && matchesDirection && matchesYear;
  }) || [];

  const handleEdit = (project: any) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedProject(null);
    setDialogOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderKanban className="w-8 h-8 text-primary" />
            Projets de ma Direction
          </h1>
          <p className="text-muted-foreground mt-1">
            Projets d'accompagnement liés aux événements export
          </p>
        </div>
        {canManageProjects && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau projet
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, description, statut..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="planifié">Planifié</SelectItem>
                <SelectItem value="en cours">En cours</SelectItem>
                <SelectItem value="terminé">Terminé</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Projets en cours ({filteredProjects.length})
          </h3>
        </CardHeader>
        <CardContent>
          <ProjectList
            projects={filteredProjects}
            isLoading={isLoading}
            onEdit={handleEdit}
            canManage={canManageProjects}
          />
        </CardContent>
      </Card>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={selectedProject}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
