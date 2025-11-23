import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Imputation } from "@/types/imputation";

interface ImputationTableProps {
  imputations: Imputation[];
  onEdit: (imputation: Imputation) => void;
}

export function ImputationTable({ imputations, onEdit }: ImputationTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Récupérer les profils utilisateurs pour afficher les noms
  const { data: profiles } = useQuery({
    queryKey: ['profiles-for-imputations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name');
      if (error) throw error;
      return data;
    },
  });

  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return "-";
    const profile = profiles?.find(p => p.user_id === userId);
    return profile?.full_name || "-";
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('imputations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imputations'] });
      toast({
        title: "Succès",
        description: "Imputation supprimée avec succès",
      });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy", { locale: fr });
  };

  const getStatusBadge = (etat: string) => {
    const variants = {
      "En attente": "secondary",
      "En cours": "default",
      "Terminé": "success",
    };
    return (
      <Badge variant={variants[etat as keyof typeof variants] as any}>
        {etat}
      </Badge>
    );
  };

  if (imputations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Aucune imputation trouvée</p>
        <p className="text-sm">Ajoutez votre première imputation pour commencer</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date réception</TableHead>
              <TableHead>Provenance</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Imputation</TableHead>
              <TableHead>Personne assignée</TableHead>
              <TableHead>Date imputation</TableHead>
              <TableHead>Date réalisation</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imputations.map((imputation) => (
              <TableRow key={imputation.id}>
                <TableCell>{formatDate(imputation.date_reception)}</TableCell>
                <TableCell>{imputation.provenance}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {imputation.objet}
                </TableCell>
                <TableCell>{imputation.imputation}</TableCell>
                <TableCell>{getUserName(imputation.assigned_to)}</TableCell>
                <TableCell>{formatDate(imputation.date_imputation)}</TableCell>
                <TableCell>{formatDate(imputation.date_realisation)}</TableCell>
                <TableCell>{getStatusBadge(imputation.etat)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(imputation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(imputation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette imputation ? Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
