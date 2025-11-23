import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Briefcase, TrendingUp, FileText, Handshake, Image } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Activity {
  id: string;
  title: string;
  type: 'event' | 'training' | 'partnership' | 'project' | 'connection' | 'opportunity' | 'media' | 'imputation';
  date: string;
  direction?: string;
  details?: string;
}

export default function ActivitiesArchive() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities-archive'],
    queryFn: async () => {
      const allActivities: Activity[] = [];

      // Fetch events
      const { data: events } = await supabase
        .from('events')
        .select('id, title, event_type, location, start_date, direction_id')
        .order('start_date', { ascending: false });
      
      const { data: directions } = await supabase
        .from('directions')
        .select('id, name');

      const directionsMap = directions?.reduce((acc, dir) => {
        acc[dir.id] = dir.name;
        return acc;
      }, {} as Record<string, string>) || {};
      
      events?.forEach(event => {
        allActivities.push({
          id: event.id,
          title: event.title,
          type: 'event',
          date: event.start_date,
          direction: event.direction_id ? directionsMap[event.direction_id] : undefined,
          details: `${event.event_type} - ${event.location || 'Lieu non spécifié'}`
        });
      });

      // Fetch trainings
      const { data: trainings } = await supabase
        .from('trainings')
        .select('id, title, training_type, location, start_date, direction_id')
        .order('start_date', { ascending: false });
      
      trainings?.forEach(training => {
        allActivities.push({
          id: training.id,
          title: training.title,
          type: 'training',
          date: training.start_date,
          direction: training.direction_id ? directionsMap[training.direction_id] : undefined,
          details: `${training.training_type} - ${training.location || 'Lieu non spécifié'}`
        });
      });

      // Fetch partnerships
      const { data: partnerships } = await supabase
        .from('partnerships')
        .select('id, partner_name, partner_type, status, start_date, created_at, direction_id')
        .order('start_date', { ascending: false });
      
      partnerships?.forEach(partnership => {
        allActivities.push({
          id: partnership.id,
          title: `Partenariat: ${partnership.partner_name}`,
          type: 'partnership',
          date: partnership.start_date || partnership.created_at,
          direction: partnership.direction_id ? directionsMap[partnership.direction_id] : undefined,
          details: `${partnership.partner_type || 'Type non spécifié'} - ${partnership.status || ''}`
        });
      });

      // Fetch projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, status, start_date, created_at, direction_id')
        .order('start_date', { ascending: false });
      
      projects?.forEach(project => {
        allActivities.push({
          id: project.id,
          title: project.name,
          type: 'project',
          date: project.start_date || project.created_at,
          direction: project.direction_id ? directionsMap[project.direction_id] : undefined,
          details: project.status || 'Statut non spécifié'
        });
      });

      // Fetch business connections
      const { data: connections } = await supabase
        .from('business_connections')
        .select('id, pme_name, partner_name, destination_country, sector, connection_date, direction_id')
        .order('connection_date', { ascending: false });
      
      connections?.forEach(connection => {
        allActivities.push({
          id: connection.id,
          title: `Connexion: ${connection.pme_name} - ${connection.partner_name}`,
          type: 'connection',
          date: connection.connection_date,
          direction: connection.direction_id ? directionsMap[connection.direction_id] : undefined,
          details: `${connection.destination_country} - ${connection.sector}`
        });
      });

      // Fetch export opportunities
      const { data: opportunities } = await supabase
        .from('export_opportunities')
        .select('id, title, destination_country, sector, created_at, direction_id')
        .order('created_at', { ascending: false });
      
      opportunities?.forEach(opportunity => {
        allActivities.push({
          id: opportunity.id,
          title: opportunity.title,
          type: 'opportunity',
          date: opportunity.created_at,
          direction: opportunity.direction_id ? directionsMap[opportunity.direction_id] : undefined,
          details: `${opportunity.destination_country} - ${opportunity.sector}`
        });
      });

      // Fetch media content
      const { data: media } = await supabase
        .from('media_content')
        .select('id, title, media_type, statut_workflow, date_evenement, created_at, direction_id')
        .order('date_evenement', { ascending: false });
      
      media?.forEach(m => {
        allActivities.push({
          id: m.id,
          title: m.title,
          type: 'media',
          date: m.date_evenement || m.created_at,
          direction: m.direction_id ? directionsMap[m.direction_id] : undefined,
          details: `${m.media_type} - ${m.statut_workflow || ''}`
        });
      });

      // Fetch imputations
      const { data: imputations } = await supabase
        .from('imputations')
        .select('id, objet, provenance, etat, date_reception, direction_id')
        .order('date_reception', { ascending: false });
      
      imputations?.forEach(imputation => {
        allActivities.push({
          id: imputation.id,
          title: imputation.objet,
          type: 'imputation',
          date: imputation.date_reception,
          direction: imputation.direction_id ? directionsMap[imputation.direction_id] : undefined,
          details: `${imputation.provenance} - ${imputation.etat}`
        });
      });

      return allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  });

  // Group activities by year
  const activitiesByYear = activities?.reduce((acc, activity) => {
    const year = new Date(activity.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(activity);
    return acc;
  }, {} as Record<number, Activity[]>);

  const years = activitiesByYear ? Object.keys(activitiesByYear).sort((a, b) => Number(b) - Number(a)) : [];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'training': return <Users className="h-4 w-4" />;
      case 'partnership': return <Handshake className="h-4 w-4" />;
      case 'project': return <Briefcase className="h-4 w-4" />;
      case 'connection': return <TrendingUp className="h-4 w-4" />;
      case 'opportunity': return <TrendingUp className="h-4 w-4" />;
      case 'media': return <Image className="h-4 w-4" />;
      case 'imputation': return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'event': return 'default';
      case 'training': return 'secondary';
      case 'partnership': return 'outline';
      case 'project': return 'default';
      case 'connection': return 'secondary';
      case 'opportunity': return 'default';
      case 'media': return 'outline';
      case 'imputation': return 'secondary';
    }
  };

  const getActivityLabel = (type: Activity['type']) => {
    switch (type) {
      case 'event': return 'Événement';
      case 'training': return 'Formation';
      case 'partnership': return 'Partenariat';
      case 'project': return 'Projet';
      case 'connection': return 'Connexion Business';
      case 'opportunity': return 'Opportunité';
      case 'media': return 'Média';
      case 'imputation': return 'Imputation';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des activités...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Archive des Activités</h1>
        <p className="text-muted-foreground mt-2">
          Classification chronologique de toutes les activités de la plateforme
        </p>
      </div>

      <Tabs defaultValue={years[0]} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-2">
          {years.map(year => (
            <TabsTrigger key={year} value={year} className="min-w-[100px]">
              Année {year}
              <Badge variant="secondary" className="ml-2">
                {activitiesByYear?.[Number(year)]?.length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {years.map(year => (
          <TabsContent key={year} value={year} className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Activités de l'année {year}</h2>
              
              <div className="space-y-3">
                {activitiesByYear?.[Number(year)]?.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-medium leading-none">{activity.title}</h3>
                          {activity.details && (
                            <p className="text-sm text-muted-foreground">{activity.details}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={getActivityColor(activity.type)}>
                            {getActivityLabel(activity.type)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(activity.date), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                        {activity.direction && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {activity.direction}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
