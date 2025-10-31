import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Mail, Phone, Trash2, Building2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface TrainerTableProps {
  trainers: any[];
  isLoading: boolean;
  onEdit: (trainer: any) => void;
  onDelete: (trainer: any) => void;
}

export function TrainerTable({ trainers, isLoading, onEdit, onDelete }: TrainerTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<any>(null);

  const handleDeleteClick = (trainer: any) => {
    setTrainerToDelete(trainer);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (trainerToDelete) {
      onDelete(trainerToDelete);
      setDeleteDialogOpen(false);
      setTrainerToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trainers || trainers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun formateur trouvé
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom complet</TableHead>
              <TableHead>Spécialisation</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainers.map((trainer) => (
              <TableRow key={trainer.id}>
                <TableCell className="font-medium">{trainer.full_name}</TableCell>
                <TableCell>
                  {trainer.specialization && (
                    <Badge variant="secondary">{trainer.specialization}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {trainer.organization && (
                    <div className="flex items-center gap-1 text-sm">
                      <Building2 className="w-3 h-3" />
                      {trainer.organization}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {trainer.email && (
                      <div className="flex items-center gap-1 text-xs">
                        <Mail className="w-3 h-3" />
                        {trainer.email}
                      </div>
                    )}
                    {trainer.phone && (
                      <div className="flex items-center gap-1 text-xs">
                        <Phone className="w-3 h-3" />
                        {trainer.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(trainer)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(trainer)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le formateur "{trainerToDelete?.full_name}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
