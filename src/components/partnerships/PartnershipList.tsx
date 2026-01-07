import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Mail, Phone, FolderKanban, Eye, Globe, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PartnershipListProps {
  partnerships: any[];
  isLoading: boolean;
  onView: (partnership: any) => void;
  onEdit: (partnership: any) => void;
  canManage?: boolean;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "actif": "default",
  "en négociation": "secondary",
  "prospection": "outline",
  "signé": "default",
  "suspendu": "destructive",
  "expiré": "destructive",
  "renouvelé": "default",
  "résilié": "destructive",
};

const lifecycleLabels: Record<string, string> = {
  "identification": "Identification",
  "negociation": "Négociation",
  "signature": "Signature",
  "mise_en_oeuvre": "Mise en œuvre",
  "suivi": "Suivi",
  "renouvellement": "Renouvellement",
  "cloture": "Clôture",
};

export function PartnershipList({ partnerships, isLoading, onView, onEdit, canManage = true }: PartnershipListProps) {
  const { data: projectsMap = {} } = useQuery({
    queryKey: ["partnership-projects-map"],
    queryFn: async () => {
      const { data: links, error: linksError } = await supabase
        .from("partnership_projects")
        .select("partnership_id, project_id");
      
      if (linksError) throw linksError;
      const projectIds = [...new Set(links.map(l => l.project_id))];
      if (projectIds.length === 0) return {};

      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, name")
        .in("id", projectIds);
      
      if (projectsError) throw projectsError;
      const projectsById = Object.fromEntries(projects.map(p => [p.id, p.name]));
      
      const map: Record<string, string[]> = {};
      links.forEach(link => {
        if (!map[link.partnership_id]) map[link.partnership_id] = [];
        map[link.partnership_id].push(projectsById[link.project_id]);
      });
      return map;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!partnerships || partnerships.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun partenariat trouvé
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Partenaire</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Pays/Secteur</TableHead>
            <TableHead>Projets</TableHead>
            <TableHead>Période</TableHead>
            <TableHead>Étape</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partnerships.map((partnership) => (
            <TableRow key={partnership.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(partnership)}>
              <TableCell className="font-medium">
                <div>
                  {partnership.partner_name}
                  {partnership.reference_code && (
                    <p className="text-xs text-muted-foreground">{partnership.reference_code}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{partnership.partner_type || "Non spécifié"}</Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {partnership.partner_country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {partnership.partner_country}
                    </div>
                  )}
                  {partnership.partner_sector && (
                    <span className="text-muted-foreground text-xs">{partnership.partner_sector}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {projectsMap[partnership.id]?.length > 0 ? (
                  <div className="flex items-center gap-1 text-sm">
                    <FolderKanban className="w-3 h-3" />
                    <span className="text-muted-foreground">
                      {projectsMap[partnership.id].length} projet{projectsMap[partnership.id].length > 1 ? 's' : ''}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-sm">
                {partnership.start_date && format(new Date(partnership.start_date), "MMM yyyy", { locale: fr })}
                {partnership.end_date && ` - ${format(new Date(partnership.end_date), "MMM yyyy", { locale: fr })}`}
              </TableCell>
              <TableCell>
                {partnership.lifecycle_stage && (
                  <Badge variant="secondary" className="text-xs">
                    {lifecycleLabels[partnership.lifecycle_stage] || partnership.lifecycle_stage}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[partnership.status] || "default"}>
                  {partnership.status || "Non défini"}
                </Badge>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onView(partnership)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  {canManage && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(partnership)}>
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
  );
}
