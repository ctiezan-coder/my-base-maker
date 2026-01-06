import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Plus, AlertTriangle, Clock, Calendar as CalendarIcon, Bell } from "lucide-react";
import { format, differenceInDays, isSameDay, isAfter, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { EventDialog } from "@/components/events/EventDialog";
import { useUserRole } from "@/hooks/useUserRole";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  event_type: string;
  direction_id: string;
  max_participants: number | null;
  created_at: string;
  directions?: {
    name: string;
  };
}

type UrgencyLevel = "critical" | "urgent" | "soon" | "normal";

const getUrgencyLevel = (startDate: string): UrgencyLevel => {
  const today = startOfDay(new Date());
  const eventDate = startOfDay(new Date(startDate));
  const daysUntil = differenceInDays(eventDate, today);

  if (daysUntil < 0) return "normal"; // Passé
  if (daysUntil <= 2) return "critical"; // 0-2 jours
  if (daysUntil <= 7) return "urgent"; // 3-7 jours
  if (daysUntil <= 14) return "soon"; // 8-14 jours
  return "normal";
};

const urgencyConfig = {
  critical: {
    label: "Critique",
    color: "bg-destructive text-destructive-foreground",
    borderColor: "border-destructive",
    bgColor: "bg-destructive/10",
    icon: AlertTriangle,
  },
  urgent: {
    label: "Urgent",
    color: "bg-ci-orange text-white",
    borderColor: "border-ci-orange",
    bgColor: "bg-ci-orange/10",
    icon: Bell,
  },
  soon: {
    label: "Proche",
    color: "bg-yellow-500 text-white",
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-500/10",
    icon: Clock,
  },
  normal: {
    label: "Normal",
    color: "bg-ci-green text-white",
    borderColor: "border-ci-green",
    bgColor: "bg-ci-green/10",
    icon: CalendarIcon,
  },
};

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [alertsShown, setAlertsShown] = useState(false);

  const { data: userRole } = useUserRole();
  const canManage = userRole === "admin" || userRole === "manager";

  const { data: events = [], refetch } = useQuery({
    queryKey: ["agenda-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`*, directions(name)`)
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  // Alertes pour les événements urgents
  useEffect(() => {
    if (!alertsShown && events.length > 0) {
      const criticalEvents = events.filter(
        (e) => getUrgencyLevel(e.start_date) === "critical"
      );
      const urgentEvents = events.filter(
        (e) => getUrgencyLevel(e.start_date) === "urgent"
      );

      if (criticalEvents.length > 0) {
        toast.error(
          `⚠️ ${criticalEvents.length} événement(s) critique(s) dans les 48h!`,
          {
            description: criticalEvents.map((e) => e.title).join(", "),
            duration: 10000,
          }
        );
      }

      if (urgentEvents.length > 0) {
        toast.warning(
          `🔔 ${urgentEvents.length} événement(s) urgent(s) cette semaine`,
          {
            description: urgentEvents.map((e) => e.title).join(", "),
            duration: 8000,
          }
        );
      }

      setAlertsShown(true);
    }
  }, [events, alertsShown]);

  // Événements du jour sélectionné
  const eventsOnSelectedDate = selectedDate
    ? events.filter((event) => {
        const eventStart = new Date(event.start_date);
        const eventEnd = new Date(event.end_date);
        return (
          isSameDay(eventStart, selectedDate) ||
          isSameDay(eventEnd, selectedDate) ||
          (isAfter(selectedDate, eventStart) && isBefore(selectedDate, eventEnd))
        );
      })
    : [];

  // Dates avec événements pour le calendrier
  const eventDates = events.map((e) => new Date(e.start_date));

  // Événements critiques et urgents
  const criticalAndUrgentEvents = events.filter((e) => {
    const level = getUrgencyLevel(e.start_date);
    return level === "critical" || level === "urgent";
  });

  const handleCreateEvent = (date?: Date) => {
    setSelectedEvent(null);
    setDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Agenda des Événements
          </h1>
          <p className="text-muted-foreground mt-1">
            Calendrier centralisé des opportunités export
          </p>
        </div>
        {canManage && (
          <Button onClick={() => handleCreateEvent()} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvel Événement
          </Button>
        )}
      </div>

      {/* Alertes Urgentes */}
      {criticalAndUrgentEvents.length > 0 && (
        <div className="space-y-3">
          {criticalAndUrgentEvents
            .filter((e) => getUrgencyLevel(e.start_date) === "critical")
            .slice(0, 3)
            .map((event) => (
              <Alert
                key={event.id}
                variant="destructive"
                className="border-2 animate-pulse"
              >
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-bold">
                  ⚠️ ALERTE CRITIQUE - {event.title}
                </AlertTitle>
                <AlertDescription>
                  Cet événement a lieu le{" "}
                  {format(new Date(event.start_date), "EEEE d MMMM yyyy", {
                    locale: fr,
                  })}
                  . Action immédiate requise!
                  {event.location && ` - Lieu: ${event.location}`}
                </AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Calendrier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={fr}
              className="rounded-md border w-full"
              modifiers={{
                hasEvent: eventDates,
              }}
              modifiersStyles={{
                hasEvent: {
                  backgroundColor: "hsl(var(--primary) / 0.2)",
                  fontWeight: "bold",
                  borderRadius: "50%",
                },
              }}
            />
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                Légende:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(urgencyConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", config.color)} />
                    <span>{config.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Événements du jour */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
                : "Sélectionnez une date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsOnSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun événement prévu ce jour</p>
                {canManage && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleCreateEvent(selectedDate)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un événement
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {eventsOnSelectedDate.map((event) => {
                  const urgency = getUrgencyLevel(event.start_date);
                  const config = urgencyConfig[urgency];
                  const Icon = config.icon;

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                        config.borderColor,
                        config.bgColor
                      )}
                      onClick={() => canManage && handleEditEvent(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-4 h-4" />
                            <h3 className="font-semibold">{event.title}</h3>
                            <Badge className={config.color}>{config.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>
                              📅{" "}
                              {format(new Date(event.start_date), "HH:mm", {
                                locale: fr,
                              })}{" "}
                              -{" "}
                              {format(new Date(event.end_date), "HH:mm", {
                                locale: fr,
                              })}
                            </span>
                            {event.location && <span>📍 {event.location}</span>}
                            <Badge variant="outline">{event.event_type}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Liste des événements à venir triés par urgence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Événements à venir (par urgence)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events
              .filter((e) => new Date(e.start_date) >= new Date())
              .sort((a, b) => {
                const urgencyOrder = { critical: 0, urgent: 1, soon: 2, normal: 3 };
                const aLevel = getUrgencyLevel(a.start_date);
                const bLevel = getUrgencyLevel(b.start_date);
                if (urgencyOrder[aLevel] !== urgencyOrder[bLevel]) {
                  return urgencyOrder[aLevel] - urgencyOrder[bLevel];
                }
                return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
              })
              .slice(0, 9)
              .map((event) => {
                const urgency = getUrgencyLevel(event.start_date);
                const config = urgencyConfig[urgency];
                const Icon = config.icon;
                const daysUntil = differenceInDays(
                  new Date(event.start_date),
                  new Date()
                );

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                      config.borderColor,
                      config.bgColor,
                      urgency === "critical" && "animate-pulse"
                    )}
                    onClick={() => canManage && handleEditEvent(event)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" />
                      <Badge className={config.color}>
                        {daysUntil === 0
                          ? "Aujourd'hui"
                          : daysUntil === 1
                          ? "Demain"
                          : `${daysUntil} jours`}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1 line-clamp-1">{event.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <div>
                        📅{" "}
                        {format(new Date(event.start_date), "d MMM yyyy", {
                          locale: fr,
                        })}
                      </div>
                      {event.location && (
                        <div className="line-clamp-1">📍 {event.location}</div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
