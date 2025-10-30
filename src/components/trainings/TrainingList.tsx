import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TrainingListProps {
  trainings: any[];
  isLoading: boolean;
  onEdit: (training: any) => void;
}

export function TrainingList({ trainings, isLoading, onEdit }: TrainingListProps) {
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Lieu</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trainings.map((training) => (
            <TableRow key={training.id}>
              <TableCell className="font-medium">{training.title}</TableCell>
              <TableCell>
                <Badge variant="outline">{training.training_type}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(training.start_date), "dd MMM yyyy", { locale: fr })}
                </div>
              </TableCell>
              <TableCell>
                {training.location && (
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="w-3 h-3" />
                    {training.location}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {training.current_participants || 0} / {training.max_participants || "∞"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onEdit(training)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
