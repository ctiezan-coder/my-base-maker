import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Image as ImageIcon, Video } from "lucide-react";
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

interface MediaGridProps {
  mediaItems: any[];
  isLoading: boolean;
  onEdit: (media: any) => void;
  onDelete: (media: any) => void;
}

export function MediaGrid({ mediaItems, isLoading, onEdit, onDelete }: MediaGridProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<any>(null);

  const handleDeleteClick = (media: any) => {
    setMediaToDelete(media);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (mediaToDelete) {
      onDelete(mediaToDelete);
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
    }
  };

  const getMediaIcon = (type: string) => {
    return type === "Vidéo" ? Video : ImageIcon;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun média trouvé
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mediaItems.map((media) => {
          const MediaIcon = getMediaIcon(media.media_type);
          return (
            <Card key={media.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MediaIcon className="w-5 h-5" />
                      {media.title}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-2">
                      {media.media_type}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(media)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(media)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {media.file_url && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    {media.media_type === "Image" ? (
                      <img
                        src={media.file_url}
                        alt={media.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                )}
                {media.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {media.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {format(new Date(media.created_at), "dd MMM yyyy", { locale: fr })}
                  </span>
                  {media.file_size && (
                    <span>{(media.file_size / 1024 / 1024).toFixed(2)} MB</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le média "{mediaToDelete?.title}" ? Cette action est irréversible.
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
