import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Download, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentListProps {
  documents: any[];
  isLoading: boolean;
  onEdit: (document: any) => void;
  onDelete: (document: any) => void;
  canManage?: boolean;
}

export function DocumentList({ documents, isLoading, onEdit, onDelete, canManage = false }: DocumentListProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);

  const handleDownload = async (doc: any) => {
    try {
      // Générer une URL signée valide 1 heure
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_url, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le document",
      });
    }
  };

  const handleDeleteClick = (document: any) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete) {
      onDelete(documentToDelete);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case "1": return "destructive";
      case "3": return "default";
      case "5": return "secondary";
      default: return "secondary";
    }
  };

  const getPriorityLabel = (level: string) => {
    switch (level) {
      case "1": return "Urgent";
      case "3": return "Normal";
      case "5": return "Faible";
      default: return "Non défini";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun document trouvé
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {doc.title}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={getPriorityColor(doc.priority_level)}>
                      {getPriorityLabel(doc.priority_level)}
                    </Badge>
                    {doc.document_category && (
                      <Badge variant="outline">{doc.document_category}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {doc.file_url && (
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  {canManage && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(doc)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(doc)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {doc.description && (
                <p className="text-sm text-muted-foreground">{doc.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Créé le {format(new Date(doc.created_at), "dd MMM yyyy", { locale: fr })}
                </span>
                {doc.file_size && (
                  <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le document "{documentToDelete?.title}" ? Cette action est irréversible.
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
