import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit, MoreHorizontal, Send, FileText, Wallet, Trash2, Globe, MapPin } from "lucide-react";
import { MissionOrder } from "@/types/mission";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MissionTableProps {
  missions: MissionOrder[];
  onView: (mission: MissionOrder) => void;
  onEdit: (mission: MissionOrder) => void;
  onSubmit?: (mission: MissionOrder) => void;
  onReport?: (mission: MissionOrder) => void;
  onLiquidate?: (mission: MissionOrder) => void;
  onDelete?: (mission: MissionOrder) => void;
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; label: string }> = {
    'Brouillon': { color: 'bg-gray-500', label: 'Brouillon' },
    'Soumise': { color: 'bg-blue-400', label: 'Soumise' },
    'En validation N1': { color: 'bg-yellow-500', label: 'Valid. N1' },
    'En validation DAF': { color: 'bg-yellow-600', label: 'Valid. DAF' },
    'En validation DG': { color: 'bg-yellow-700', label: 'Valid. DG' },
    'Approuvée': { color: 'bg-blue-600', label: 'Approuvée' },
    'Rejetée': { color: 'bg-red-500', label: 'Rejetée' },
    'Annulée': { color: 'bg-red-700', label: 'Annulée' },
    'Planifiée': { color: 'bg-indigo-500', label: 'Planifiée' },
    'En cours': { color: 'bg-green-500', label: 'En cours' },
    'Terminée': { color: 'bg-gray-600', label: 'Terminée' },
    'En attente rapport': { color: 'bg-orange-500', label: 'Att. Rapport' },
    'Rapport soumis': { color: 'bg-teal-500', label: 'Rapport OK' },
    'En liquidation': { color: 'bg-purple-500', label: 'Liquidation' },
    'Liquidée': { color: 'bg-purple-700', label: 'Liquidée' },
    'Soldée': { color: 'bg-emerald-600', label: 'Soldée' },
  };
  return configs[status] || { color: 'bg-gray-500', label: status };
};

const getUrgencyBadge = (urgency?: string) => {
  if (!urgency || urgency === 'Normale') return null;
  const color = urgency === 'Très urgente' ? 'bg-red-600' : 'bg-orange-500';
  return <Badge className={`${color} text-xs ml-1`}>{urgency === 'Très urgente' ? '!!!' : '!!'}</Badge>;
};

export function MissionTable({
  missions,
  onView,
  onEdit,
  onSubmit,
  onReport,
  onLiquidate,
  onDelete
}: MissionTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Mission</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Employé</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Période</TableHead>
            <TableHead>Durée</TableHead>
            <TableHead className="text-right">Budget</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missions.map((mission) => {
            const statusConfig = getStatusConfig(mission.extended_status || mission.status);
            return (
              <TableRow key={mission.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(mission)}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {mission.mission_number}
                    {getUrgencyBadge(mission.urgency_level)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {mission.mission_type === 'Internationale' ? (
                      <Globe className="h-4 w-4 text-blue-500" />
                    ) : (
                      <MapPin className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm">{mission.mission_type || 'Nationale'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {mission.employee?.first_name} {mission.employee?.last_name}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{mission.destination}</span>
                    {mission.destination_country && mission.destination_country !== mission.destination && (
                      <span className="text-xs text-muted-foreground">{mission.destination_country}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(mission.start_date), 'dd/MM/yyyy', { locale: fr })}
                    <span className="text-muted-foreground"> - </span>
                    {format(new Date(mission.end_date), 'dd/MM/yyyy', { locale: fr })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {mission.duration_days} j
                    {mission.working_days && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({mission.working_days}jo)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {mission.estimated_budget ? (
                    <div className="text-sm">
                      {mission.estimated_budget.toLocaleString()} 
                      <span className="text-xs text-muted-foreground ml-1">{mission.currency || 'FCFA'}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(mission)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </DropdownMenuItem>
                      {(mission.extended_status === 'Brouillon' || mission.extended_status === 'Rejetée') && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit(mission)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          {onSubmit && (
                            <DropdownMenuItem onClick={() => onSubmit(mission)}>
                              <Send className="h-4 w-4 mr-2" />
                              Soumettre
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      {mission.extended_status === 'En attente rapport' && onReport && (
                        <DropdownMenuItem onClick={() => onReport(mission)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Rédiger rapport
                        </DropdownMenuItem>
                      )}
                      {['Rapport soumis', 'Terminée'].includes(mission.extended_status || '') && onLiquidate && (
                        <DropdownMenuItem onClick={() => onLiquidate(mission)}>
                          <Wallet className="h-4 w-4 mr-2" />
                          Liquider
                        </DropdownMenuItem>
                      )}
                      {mission.extended_status === 'Brouillon' && onDelete && (
                        <DropdownMenuItem onClick={() => onDelete(mission)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
          {missions.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                Aucune mission trouvée
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
