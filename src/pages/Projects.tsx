import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, FolderKanban } from "lucide-react";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { ProjectList } from "@/components/projects/ProjectList";
import { useUserDirection } from "@/hooks/useUserDirection";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";

export default function Projects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const { data: userDirection } = useUserDirection();
  const { canAccess: canManageProjects } = useCanAccessModule("projects", "manager");

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ["projects", userDirection?.direction_id],
    queryFn: async () => {
      // RLS policies will filter based on user's permissions
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userDirection?.direction_id,
  });

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
            Projets d'Accompagnement
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion et suivi des projets en cours
          </p>
        </div>
        {canManageProjects && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau projet
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Projets en cours</h3>
        </CardHeader>
        <CardContent>
          <ProjectList
            projects={projects || []}
            isLoading={isLoading}
            onEdit={handleEdit}
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
