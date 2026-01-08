import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MissionOrder, MissionItinerary, MissionProgramDay } from "@/types/mission";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  User, 
  Building2, 
  Calendar, 
  MapPin, 
  Target, 
  Clock,
  AlertTriangle,
  Route,
  CalendarDays
} from "lucide-react";

interface MissionInfoTabProps {
  mission: MissionOrder;
  itineraries: MissionItinerary[];
  program: MissionProgramDay[];
}

export function MissionInfoTab({ mission, itineraries, program }: MissionInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Informations du demandeur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Informations du Demandeur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Employé</p>
              <p className="font-medium">
                {mission.employee?.first_name} {mission.employee?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Matricule</p>
              <p className="font-medium">{mission.requester_matricule || mission.employee?.employee_number || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Direction</p>
              <p className="font-medium">{mission.direction?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Poste</p>
              <p className="font-medium">{mission.requester_position || mission.employee?.position || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objet et justification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Objet de la Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Objet</p>
            <p className="font-medium">{mission.purpose}</p>
          </div>
          {mission.justification && (
            <div>
              <p className="text-sm text-muted-foreground">Justification</p>
              <p>{mission.justification}</p>
            </div>
          )}
          {mission.expected_results && (
            <div>
              <p className="text-sm text-muted-foreground">Résultats attendus</p>
              <p>{mission.expected_results}</p>
            </div>
          )}
          <div className="flex gap-4">
            {mission.project?.name && (
              <div>
                <p className="text-sm text-muted-foreground">Projet lié</p>
                <Badge variant="outline">{mission.project.name}</Badge>
              </div>
            )}
            {mission.urgency_level && mission.urgency_level !== 'Normale' && (
              <div>
                <p className="text-sm text-muted-foreground">Urgence</p>
                <Badge className={mission.urgency_level === 'Très urgente' ? 'bg-red-500' : 'bg-orange-500'}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {mission.urgency_level}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dates et durée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Dates et Durée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date de demande</p>
              <p className="font-medium">
                {mission.request_date 
                  ? format(new Date(mission.request_date), 'dd/MM/yyyy', { locale: fr })
                  : format(new Date(mission.created_at), 'dd/MM/yyyy', { locale: fr })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Départ</p>
              <p className="font-medium">
                {format(new Date(mission.start_date), 'dd/MM/yyyy', { locale: fr })}
                {mission.departure_time && <span className="text-sm text-muted-foreground ml-1">à {mission.departure_time}</span>}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Retour</p>
              <p className="font-medium">
                {format(new Date(mission.end_date), 'dd/MM/yyyy', { locale: fr })}
                {mission.return_time && <span className="text-sm text-muted-foreground ml-1">à {mission.return_time}</span>}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durée totale</p>
              <p className="font-medium">{mission.duration_days} jours</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jours ouvrables</p>
              <p className="font-medium">
                {mission.working_days || '-'} jo
                {mission.weekend_days && mission.weekend_days > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">+ {mission.weekend_days} we</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destination */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Destination
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Destination principale</p>
              <p className="font-medium">{mission.destination}</p>
            </div>
            {mission.destination_country && (
              <div>
                <p className="text-sm text-muted-foreground">Pays</p>
                <p className="font-medium">{mission.destination_country}</p>
              </div>
            )}
            {mission.destination_cities && mission.destination_cities.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Villes</p>
                <div className="flex flex-wrap gap-1">
                  {mission.destination_cities.map((city, i) => (
                    <Badge key={i} variant="secondary">{city}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          {mission.places_to_visit && mission.places_to_visit.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Lieux à visiter</p>
              <div className="flex flex-wrap gap-1">
                {mission.places_to_visit.map((place, i) => (
                  <Badge key={i} variant="outline">{place}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Itinéraire */}
      {itineraries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Route className="h-5 w-5" />
              Itinéraire Détaillé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {itineraries.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    {step.step_order}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{step.departure_location}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{step.arrival_location}</span>
                    </div>
                    {step.departure_date && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(step.departure_date), 'dd/MM/yyyy', { locale: fr })}
                        {step.arrival_date && ` - ${format(new Date(step.arrival_date), 'dd/MM/yyyy', { locale: fr })}`}
                      </p>
                    )}
                    {step.transport_mode && (
                      <Badge variant="secondary" className="mt-1">{step.transport_mode}</Badge>
                    )}
                    {step.notes && <p className="text-sm mt-1">{step.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Programme */}
      {program.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5" />
              Programme Jour par Jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {program.map((day) => (
                <div key={day.id} className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Jour {day.day_number}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(day.day_date), 'EEEE dd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  {day.activities && day.activities.length > 0 && (
                    <div className="space-y-1">
                      {day.activities.map((activity: any, i: number) => (
                        <p key={i} className="text-sm">• {activity.title || activity}</p>
                      ))}
                    </div>
                  )}
                  {day.meetings && day.meetings.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground uppercase">Réunions</p>
                      {day.meetings.map((meeting: any, i: number) => (
                        <p key={i} className="text-sm">📅 {meeting.time || ''} - {meeting.title || meeting}</p>
                      ))}
                    </div>
                  )}
                  {day.notes && <p className="text-sm text-muted-foreground mt-2">{day.notes}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
