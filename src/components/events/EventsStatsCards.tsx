import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, CheckCircle, Clock } from "lucide-react";

interface EventsStatsCardsProps {
  events: any[];
}

export function EventsStatsCards({ events }: EventsStatsCardsProps) {
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.start_date) > now);
  const pastEvents = events.filter(e => new Date(e.end_date || e.start_date) < now);
  const ongoingEvents = events.filter(e => 
    new Date(e.start_date) <= now && 
    (!e.end_date || new Date(e.end_date) >= now)
  );
  
  const totalParticipants = events.reduce((sum, event) => {
    return sum + (event.max_participants || 0);
  }, 0);

  const stats = [
    {
      title: "Événements à venir",
      value: upcomingEvents.length,
      icon: Clock,
      description: "Prochainement",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "En cours",
      value: ongoingEvents.length,
      icon: Calendar,
      description: "Actuellement",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Terminés",
      value: pastEvents.length,
      icon: CheckCircle,
      description: "Passés",
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      title: "Participants totaux",
      value: totalParticipants,
      icon: Users,
      description: "Capacité totale",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
