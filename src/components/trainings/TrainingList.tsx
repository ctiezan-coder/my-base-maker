import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Calendar, MapPin, ChevronDown, ChevronUp, Users, Mail, Phone, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TrainingListProps {
  trainings: any[];
  isLoading: boolean;
  onEdit: (training: any) => void;
  canManage?: boolean;
}

function ParticipantsList({ trainingId }: { trainingId: string }) {
  const { data: registrations, isLoading } = useQuery({
    queryKey: ["training-registrations", trainingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_registrations")
        .select("*")
        .eq("training_id", trainingId)
        .order("registration_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Chargement des participants...
      </div>
    );
  }

  if (!registrations || registrations.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Aucun participant inscrit
      </div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4 mt-2">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Users className="w-4 h-4" />
        {registrations.length} participant(s) inscrit(s)
      </h4>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Nom</TableHead>
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Téléphone</TableHead>
              <TableHead className="text-xs">Statut</TableHead>
              <TableHead className="text-xs">Présence</TableHead>
              <TableHead className="text-xs">Date inscription</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell className="text-sm font-medium">{reg.participant_name}</TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    {reg.participant_email}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {reg.participant_phone ? (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      {reg.participant_phone}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={reg.status === 'Confirmée' ? 'default' : 'secondary'} className="text-xs">
                    {reg.status || 'En attente'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {reg.attended ? (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {reg.registration_date
                    ? format(new Date(reg.registration_date), "dd MMM yyyy", { locale: fr })
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function TrainingList({ trainings, isLoading, onEdit, canManage = true }: TrainingListProps) {
  const [expandedTraining, setExpandedTraining] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trainings || trainings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune formation trouvée
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {trainings.map((training) => {
        const isExpanded = expandedTraining === training.id;
        return (
          <Collapsible
            key={training.id}
            open={isExpanded}
            onOpenChange={() => setExpandedTraining(isExpanded ? null : training.id)}
          >
            <div className="rounded-lg border">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{training.title}</div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <Badge variant="outline" className="text-xs">{training.training_type}</Badge>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(training.start_date), "dd MMM yyyy", { locale: fr })}
                      </span>
                      {training.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {training.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {training.training_trainers?.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {training.training_trainers.map((tt: any) => tt.trainers?.full_name).filter(Boolean).join(", ")}
                      </span>
                    )}
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {training.current_participants || 0} / {training.max_participants || "∞"}
                    </Badge>
                    {canManage && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(training)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <ParticipantsList trainingId={training.id} />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}
