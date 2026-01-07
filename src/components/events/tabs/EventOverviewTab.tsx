import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, MapPin, Users, Target, Globe, 
  Link, DollarSign, TrendingUp, Building
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Event, LOCATION_TYPES } from "@/types/event";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EventOverviewTabProps {
  event: Event;
  canManage?: boolean;
  onRefresh: () => void;
}

export function EventOverviewTab({ event, canManage, onRefresh }: EventOverviewTabProps) {
  const { data: participantsCount } = useQuery({
    queryKey: ["event-participants-count", event.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("event_participants")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id);
      return count || 0;
    },
  });

  const { data: budgetItems } = useQuery({
    queryKey: ["event-budget-summary", event.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("event_budget_items")
        .select("estimated_amount, actual_amount")
        .eq("event_id", event.id);
      return data || [];
    },
  });

  const { data: surveys } = useQuery({
    queryKey: ["event-surveys-summary", event.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("event_surveys")
        .select("overall_rating")
        .eq("event_id", event.id);
      return data || [];
    },
  });

  const locationType = LOCATION_TYPES.find(l => l.value === event.location_type);
  
  const totalEstimated = budgetItems?.reduce((sum, item) => sum + (Number(item.estimated_amount) || 0), 0) || 0;
  const totalActual = budgetItems?.reduce((sum, item) => sum + (Number(item.actual_amount) || 0), 0) || 0;
  const budgetProgress = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;

  const avgRating = surveys?.length 
    ? surveys.reduce((sum, s) => sum + (s.overall_rating || 0), 0) / surveys.length 
    : 0;

  const capacityProgress = event.capacity 
    ? ((participantsCount || 0) / event.capacity) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participantsCount || 0}</div>
            {event.capacity && (
              <>
                <p className="text-xs text-muted-foreground">sur {event.capacity} places</p>
                <Progress value={capacityProgress} className="mt-2 h-2" />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActual.toLocaleString()} XOF</div>
            <p className="text-xs text-muted-foreground">sur {totalEstimated.toLocaleString()} XOF prévus</p>
            <Progress value={budgetProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.roi_percentage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {(event.contracts_value || 0).toLocaleString()} XOF contrats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">{surveys?.length || 0} réponses</p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Dates</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.start_date), "EEEE dd MMMM yyyy", { locale: fr })}
                  {event.start_time && ` à ${event.start_time.substring(0, 5)}`}
                  {event.end_date && (
                    <>
                      <br />
                      au {format(new Date(event.end_date), "EEEE dd MMMM yyyy", { locale: fr })}
                      {event.end_time && ` à ${event.end_time.substring(0, 5)}`}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Lieu</p>
                <p className="text-sm text-muted-foreground">
                  {locationType && <Badge variant="secondary" className="mr-2">{locationType.label}</Badge>}
                  {event.venue || event.location}
                  {event.city && `, ${event.city}`}
                  {event.country && ` (${event.country})`}
                </p>
                {event.full_address && (
                  <p className="text-xs text-muted-foreground mt-1">{event.full_address}</p>
                )}
                {event.video_link && (
                  <a 
                    href={event.video_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    <Link className="w-3 h-3" />
                    Lien visioconférence
                  </a>
                )}
              </div>
            </div>

            {event.direction?.name && (
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Direction organisatrice</p>
                  <p className="text-sm text-muted-foreground">{event.direction.name}</p>
                </div>
              </div>
            )}

            {event.sectors && event.sectors.length > 0 && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Secteurs</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {event.sectors.map((sector, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{sector}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description & Objectifs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.description && (
              <div>
                <p className="font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
            
            {event.objectives && (
              <div>
                <p className="font-medium mb-2">Objectifs</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.objectives}</p>
              </div>
            )}

            {event.target_audience && (
              <div>
                <p className="font-medium mb-2">Public cible</p>
                <p className="text-sm text-muted-foreground">{event.target_audience}</p>
              </div>
            )}

            {event.access_instructions && (
              <div>
                <p className="font-medium mb-2">Instructions d'accès</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.access_instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Impact & Results */}
      {(event.leads_generated || event.b2b_meetings || event.contracts_value) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Résultats & Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {event.leads_generated && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{event.leads_generated}</p>
                  <p className="text-sm text-muted-foreground">Leads générés</p>
                </div>
              )}
              {event.b2b_meetings && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{event.b2b_meetings}</p>
                  <p className="text-sm text-muted-foreground">Réunions B2B</p>
                </div>
              )}
              {event.contracts_value && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{event.contracts_value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Valeur contrats (XOF)</p>
                </div>
              )}
              {event.media_coverage_value && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{event.media_coverage_value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Couverture média (XOF)</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
