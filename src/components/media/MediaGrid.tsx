import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Image as ImageIcon, Video, Calendar, Building2, Eye } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserDirection } from "@/hooks/useUserDirection";
import { MediaDetailsDialog } from "./MediaDetailsDialog";

interface MediaGridProps {
  mediaItems: any[];
  isLoading: boolean;
  onEdit: (media: any) => void;
  onDelete: (media: any) => void;
  canManage?: boolean;
}

export function MediaGrid({ mediaItems, isLoading, onEdit, onDelete, canManage = false }: MediaGridProps) {
  const { toast } = useToast();
  const { data: userDirection } = useUserDirection();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedMediaDetails, setSelectedMediaDetails] = useState<any>(null);
  const [directionsMap, setDirectionsMap] = useState<Record<string, string>>({});
  const [communicationDirectionId, setCommunicationDirectionId] = useState<string | null>(null);

  // Récupérer l'ID de la direction Communication
  useEffect(() => {
    const fetchCommunicationDirection = async () => {
      const { data } = await supabase
        .from("directions")
        .select("id")
        .eq("name", "Communication")
        .single();
      
      if (data) {
        setCommunicationDirectionId(data.id);
      }
    };
    
    fetchCommunicationDirection();
  }, []);

  // Vérifier si l'utilisateur est de la direction Communication
  const isServiceCommunication = userDirection?.direction_id === communicationDirectionId;

  useEffect(() => {
    const fetchDirections = async () => {
      const { data, error } = await supabase.from("directions").select("id, name");
      if (!error && data) {
        const map: Record<string, string> = {};
        data.forEach((direction: any) => {
          map[direction.id] = direction.name;
        });
        setDirectionsMap(map);
      }
    };

    fetchDirections();
  }, []);
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


  const handleViewDetails = (media: any) => {
    setSelectedMediaDetails(media);
    setDetailsDialogOpen(true);
  };

  const handleStatusChange = async (mediaId: string, newStatus: "Demande" | "En cours" | "Validé" | "Livré" | "Annulé") => {
    try {
      const { error } = await supabase
        .from("media_content")
        .update({ statut_workflow: newStatus })
        .eq("id", mediaId);

      if (error) throw error;

      toast({ title: "Statut mis à jour avec succès" });
      // Recharger la page pour voir les changements
      window.location.reload();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  const getMediaIcon = (type: string) => {
    return type === "Vidéo" ? Video : ImageIcon;
  };

  const getDateColorClass = (dateEvenement: string | null) => {
    if (!dateEvenement) return "text-muted-foreground";
    
    const eventDate = new Date(dateEvenement);
    const daysUntil = differenceInDays(eventDate, new Date());
    
    if (isPast(eventDate)) {
      return "text-destructive"; // Rouge si passé
    } else if (daysUntil <= 7) {
      return "text-orange-500"; // Orange si dans moins de 7 jours
    } else if (daysUntil <= 30) {
      return "text-yellow-600"; // Jaune si dans moins de 30 jours
    }
    return "text-green-600"; // Vert si plus de 30 jours
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
        {isLoading ? "Chargement..." : "Aucun média trouvé"}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mediaItems.map((media) => {
          const MediaIcon = getMediaIcon(media.media_type);
          const dateColorClass = getDateColorClass(media.date_evenement);
          
          return (
            <Card key={media.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MediaIcon className="w-5 h-5" />
                      {media.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">
                        {media.media_type}
                      </Badge>
                      {media.statut_workflow && (
                        <Badge 
                          variant={
                            media.statut_workflow === "Livré" ? "default" :
                            media.statut_workflow === "En cours" ? "outline" :
                            "secondary"
                          }
                        >
                          {media.statut_workflow}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewDetails(media)}
                      title="Voir le résumé"
                    >
                      <Eye className="w-4 h-4 text-primary" />
                    </Button>
                    {canManage && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(media)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(media)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
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
                
                <div className="space-y-2">
                  {media.direction_id && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {directionsMap[media.direction_id] || "Direction inconnue"}
                      </span>
                    </div>
                  )}
                  
                  {media.date_evenement && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className={`font-medium ${dateColorClass}`}>
                        {format(new Date(media.date_evenement), "dd MMM yyyy", { locale: fr })}
                      </span>
                    </div>
                  )}
                  
                  {/* Affichage du statut pour tous */}
                  <div className="pt-2 border-t">
                    {isServiceCommunication ? (
                      <>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Changer le statut
                        </label>
                        <Select
                          value={media.statut_workflow || "Demande"}
                          onValueChange={(value) => handleStatusChange(media.id, value as "Demande" | "En cours" | "Validé" | "Livré" | "Annulé")}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Demande">Demande</SelectItem>
                            <SelectItem value="En cours">En cours</SelectItem>
                            <SelectItem value="Validé">Validé</SelectItem>
                            <SelectItem value="Livré">Livré</SelectItem>
                            <SelectItem value="Annulé">Annulé</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Statut</span>
                        <Badge variant={media.statut_workflow === "Livré" ? "default" : "secondary"}>
                          {media.statut_workflow || "Demande"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
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

      <MediaDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        media={selectedMediaDetails}
        directionName={selectedMediaDetails ? directionsMap[selectedMediaDetails.direction_id] : undefined}
      />
    </>
  );
}
