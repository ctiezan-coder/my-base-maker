import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ProjectDetailsDialog } from "./ProjectDetailsDialog";

interface ProjectListProps {
  projects: any[];
  isLoading: boolean;
  onEdit: (project: any) => void;
  canManage?: boolean;
}

const statusColors = {
  "planifié": "secondary",
  "en cours": "default",
  "terminé": "outline",
  "suspendu": "destructive",
} as const;

export function ProjectList({ projects, isLoading, onEdit, canManage = true }: ProjectListProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (project: any) => {
    setSelectedProject(project);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun projet trouvé
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom du projet</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(project)}>
                <TableCell className="font-medium">
                  {project.name}
                  {project.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {project.description}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {project.start_date && format(new Date(project.start_date), "dd/MM/yyyy", { locale: fr })}
                    {project.end_date && ` - ${format(new Date(project.end_date), "dd/MM/yyyy", { locale: fr })}`}
                  </div>
                </TableCell>
                <TableCell>
                  {project.budget ? (
                    <span className="font-mono text-sm">
                      {new Intl.NumberFormat('fr-FR').format(project.budget)} FCFA
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[project.status as keyof typeof statusColors] || "default"}>
                    {project.status || "Non défini"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(project)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {canManage && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(project)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProjectDetailsDialog
        project={selectedProject}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        canManage={canManage}
      />
    </>
  );
}
