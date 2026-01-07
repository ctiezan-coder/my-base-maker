import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, MapPin, Users } from "lucide-react";
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

interface EventListProps {
  events: any[];
  isLoading: boolean;
  onEdit: (event: any) => void;
  onDelete: (event: any) => void;
  viewMode?: "grid" | "list";
  canManage?: boolean;
}

export function EventList({ events, isLoading, onEdit, onDelete, viewMode = "grid", canManage = true }: EventListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);

  const handleDeleteClick = (event: any) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      onDelete(eventToDelete);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun événement trouvé
      </div>
    );
  }

  const now = new Date();
  const getEventStatus = (event: any) => {
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : startDate;
    
    if (endDate < now) return { label: "Terminé", color: "bg-gray-500" };
    if (startDate <= now && endDate >= now) return { label: "En cours", color: "bg-green-500" };
    return { label: "À venir", color: "bg-blue-500" };
  };

  if (viewMode === "list") {
    return (
      <>
        <div className="space-y-3">
          {events.map((event) => {
            const status = getEventStatus(event);
            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[70px]">
                        <span className="text-2xl font-bold text-primary">
                          {format(new Date(event.start_date), "dd", { locale: fr })}
                        </span>
                        <span className="text-xs uppercase text-muted-foreground">
                          {format(new Date(event.start_date), "MMM", { locale: fr })}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <Badge variant="secondary">{event.event_type}</Badge>
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.max_participants && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{event.max_participants} participants</span>
                            </div>
                          )}
                          {event.direction?.name && (
                            <Badge variant="outline" className="text-xs">
                              {event.direction.name}
                            </Badge>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {canManage && (
                      <div className="flex gap-1 ml-4">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(event)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(event)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {/* ... keep existing AlertDialog ... */}
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const status = getEventStatus(event);
          return (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant="secondary" className="mt-2">
                      {event.event_type}
                    </Badge>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(event)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(event)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {format(new Date(event.start_date), "dd MMM yyyy", { locale: fr })}
                    {event.end_date && ` - ${format(new Date(event.end_date), "dd MMM yyyy", { locale: fr })}`}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.max_participants && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{event.max_participants} participants max</span>
                  </div>
                )}
                {event.direction?.name && (
                  <Badge variant="outline" className="text-xs mt-2">
                    {event.direction.name}
                  </Badge>
                )}
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
              Êtes-vous sûr de vouloir supprimer l'événement "{eventToDelete?.title}" ? Cette action est irréversible.
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
