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
import { useCanManageProjects } from "@/hooks/useDirectionAccess";
import { useTranslation } from "react-i18next";

export default function Projects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const { data: userDirection } = useUserDirection();
  const { data: canManageProjects } = useCanManageProjects();
  const { t } = useTranslation();

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ["projects-all"],
    queryFn: async () => {
      // Récupérer tous les projets de l'agence (comme le tableau de bord)
      const { data, error } = await supabase
        .from("projects")
        .select("*, directions(name)")
        .order("start_date", { ascending: false });

      if (error) throw error;
      
      return data || [];
    },
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
            {t('projects.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('projects.subtitle')}
          </p>
        </div>
        {canManageProjects && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('projects.addProject')}
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
                  placeholder={t('projects.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('projects.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('projects.allStatuses')}</SelectItem>
                <SelectItem value="planifié">{t('projects.planned')}</SelectItem>
                <SelectItem value="en cours">{t('projects.inProgress')}</SelectItem>
                <SelectItem value="terminé">{t('projects.completed')}</SelectItem>
                <SelectItem value="suspendu">{t('projects.suspended')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDirection} onValueChange={setFilterDirection}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t('projects.allDirections')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('projects.allDirections')}</SelectItem>
                {directions?.map((dir) => (
                  <SelectItem key={dir.id} value={dir.id}>
                    {dir.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>


            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder={t('projects.allYears')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('projects.allYears')}</SelectItem>
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
            {filterStatus === "en cours" ? t('projects.activeProjects') : t('sidebar.projects')} ({filteredProjects.length})
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
