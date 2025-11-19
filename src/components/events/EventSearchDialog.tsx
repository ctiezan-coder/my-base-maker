import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Calendar, MapPin, Loader2, CheckCircle, Globe } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface EventSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventAdded?: () => void;
}

interface ScrapedEvent {
  title: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  source: string;
  source_url: string;
}

export function EventSearchDialog({ open, onOpenChange, onEventAdded }: EventSearchDialogProps) {
  const [searching, setSearching] = useState(false);
  const [events, setEvents] = useState<ScrapedEvent[]>([]);
  const [addingEvents, setAddingEvents] = useState<Set<number>>(new Set());

  const handleSearch = async () => {
    setSearching(true);
    setEvents([]);

    try {
      console.log("Calling scrape-events function...");
      
      const { data, error } = await supabase.functions.invoke('scrape-events', {
        body: {},
      });

      if (error) throw error;

      console.log("Scraping result:", data);

      if (data.success) {
        setEvents(data.events || []);
        toast.success(`${data.summary.totalScraped} événements trouvés`, {
          description: `${data.summary.inserted} nouveaux ajoutés, ${data.summary.duplicates} doublons ignorés`,
        });
      } else {
        throw new Error(data.error || "Échec de la recherche");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Erreur lors de la recherche", {
        description: error.message,
      });
    } finally {
      setSearching(false);
    }
  };

  const handleAddEvent = async (event: ScrapedEvent, index: number) => {
    setAddingEvents(prev => new Set(prev).add(index));

    try {
      const { data: directions } = await supabase
        .from('directions')
        .select('id')
        .limit(1);

      if (!directions || directions.length === 0) {
        throw new Error("Aucune direction trouvée");
      }

      const { error } = await supabase.from('events').insert({
        title: event.title,
        event_type: event.event_type,
        start_date: event.start_date,
        end_date: event.end_date,
        location: event.location,
        description: event.description,
        direction_id: directions[0].id,
      });

      if (error) throw error;

      toast.success("Événement ajouté", {
        description: event.title,
      });

      // Retirer l'événement de la liste
      setEvents(prev => prev.filter((_, i) => i !== index));
      onEventAdded?.();
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Erreur lors de l'ajout", {
        description: error.message,
      });
    } finally {
      setAddingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche Automatique d'Événements
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="flex-1"
            >
              {searching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Lancer la recherche
                </>
              )}
            </Button>
          </div>

          {searching && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <p className="font-medium">Analyse des sources en cours...</p>
                  <p className="text-sm text-muted-foreground">
                    Ministère du Commerce, CCI-CI, EventsEye et autres sources
                  </p>
                </div>
              </div>
            </Card>
          )}

          {events.length > 0 && (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {events.map((event, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="font-semibold text-lg">{event.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{event.event_type}</Badge>
                            <Badge variant="outline" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              {event.source}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(event.start_date), 'dd MMMM yyyy', { locale: fr })}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAddEvent(event, index)}
                        disabled={addingEvents.has(index)}
                      >
                        {addingEvents.has(index) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Ajouter
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          {!searching && events.length === 0 && (
            <Card className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Lancez une recherche pour trouver des événements automatiquement
              </p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
