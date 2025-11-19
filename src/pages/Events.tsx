import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Calendar, Filter, Grid3x3, List } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDialog } from "@/components/events/EventDialog";
import { EventList } from "@/components/events/EventList";
import { EventsStatsCards } from "@/components/events/EventsStatsCards";
import { EventSearchDialog } from "@/components/events/EventSearchDialog";
import { useToast } from "@/hooks/use-toast";

export default function Events() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: directions } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directions")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: allEvents, isLoading, refetch } = useQuery({
    queryKey: ["events", search, typeFilter, directionFilter, dateFilter],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*, directions(name)")
        .order("start_date", { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,event_type.ilike.%${search}%,location.ilike.%${search}%`);
      }
      
      if (typeFilter !== "all") {
        query = query.eq("event_type", typeFilter);
      }
      
      if (directionFilter !== "all") {
        query = query.eq("direction_id", directionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filtrer par date côté client
      let filteredData = data;
      const now = new Date();
      
      if (dateFilter === "upcoming") {
        filteredData = data.filter(e => new Date(e.start_date) > now);
      } else if (dateFilter === "past") {
        filteredData = data.filter(e => new Date(e.end_date || e.start_date) < now);
      } else if (dateFilter === "ongoing") {
        filteredData = data.filter(e => 
          new Date(e.start_date) <= now && 
          (!e.end_date || new Date(e.end_date) >= now)
        );
      }
      
      return filteredData;
    },
  });

  const events = allEvents || [];

  const handleEdit = (event: any) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
    setDialogOpen(false);
    refetch();
  };

  const handleDelete = async (event: any) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (error) throw error;

      toast({ title: "Événement supprimé avec succès" });
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            Événements
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion des événements et calendrier
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setSearchDialogOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Recherche Auto
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel événement
          </Button>
        </div>
      </div>

      <EventsStatsCards events={events} />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher un événement..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type d'événement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="formation">Formation</SelectItem>
                  <SelectItem value="conférence">Conférence</SelectItem>
                  <SelectItem value="atelier">Atelier</SelectItem>
                  <SelectItem value="réunion">Réunion</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>

              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les directions</SelectItem>
                  {directions?.map((dir) => (
                    <SelectItem key={dir.id} value={dir.id}>
                      {dir.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les dates</SelectItem>
                  <SelectItem value="upcoming">À venir</SelectItem>
                  <SelectItem value="ongoing">En cours</SelectItem>
                  <SelectItem value="past">Passés</SelectItem>
                </SelectContent>
              </Select>

              {(typeFilter !== "all" || directionFilter !== "all" || dateFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTypeFilter("all");
                    setDirectionFilter("all");
                    setDateFilter("all");
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EventList
            events={events}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            viewMode={viewMode}
          />
        </CardContent>
      </Card>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent}
        onClose={handleCloseDialog}
      />

      <EventSearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        onEventAdded={refetch}
      />
    </div>
  );
}
