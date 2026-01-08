import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MissionOrder } from "@/types/mission";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Plane, 
  Hotel, 
  Car, 
  User,
  FileText,
  Shield,
  Syringe,
  Phone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface MissionLogisticsTabProps {
  mission: MissionOrder;
}

export function MissionLogisticsTab({ mission }: MissionLogisticsTabProps) {
  const visaStatusColors: Record<string, string> = {
    'Non requis': 'bg-gray-500',
    'En cours': 'bg-yellow-500',
    'Obtenu': 'bg-green-500',
    'Refusé': 'bg-red-500',
    'Expiré': 'bg-orange-500',
  };

  const isPassportExpiringSoon = mission.passport_expiry && 
    new Date(mission.passport_expiry) < new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      {/* Transport aérien */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plane className="h-5 w-5" />
            Transport Aérien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Compagnie</p>
              <p className="font-medium">{mission.airline || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">N° de vol</p>
              <p className="font-medium">{mission.flight_number || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Classe</p>
              <p className="font-medium">{mission.flight_class || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PNR</p>
              <p className="font-medium font-mono">{mission.pnr_reference || '-'}</p>
            </div>
          </div>
          {(mission.flight_departure_time || mission.flight_arrival_time) && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Départ</p>
                <p className="font-medium">
                  {mission.flight_departure_time 
                    ? format(new Date(mission.flight_departure_time), 'dd/MM/yyyy HH:mm', { locale: fr })
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Arrivée</p>
                <p className="font-medium">
                  {mission.flight_arrival_time 
                    ? format(new Date(mission.flight_arrival_time), 'dd/MM/yyyy HH:mm', { locale: fr })
                    : '-'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hébergement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hotel className="h-5 w-5" />
            Hébergement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Hôtel</p>
              <p className="font-medium">{mission.hotel_name || '-'}</p>
              {mission.hotel_address && (
                <p className="text-sm text-muted-foreground">{mission.hotel_address}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confirmation</p>
              <p className="font-medium font-mono">{mission.hotel_confirmation_ref || '-'}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Check-in</p>
              <p className="font-medium">
                {mission.hotel_check_in 
                  ? format(new Date(mission.hotel_check_in), 'dd/MM/yyyy', { locale: fr })
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-out</p>
              <p className="font-medium">
                {mission.hotel_check_out 
                  ? format(new Date(mission.hotel_check_out), 'dd/MM/yyyy', { locale: fr })
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nuits</p>
              <p className="font-medium">{mission.hotel_nights || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Véhicule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5" />
            Transport Local
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Type de véhicule</p>
              <p className="font-medium">{mission.rental_vehicle_type || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Agence de location</p>
              <p className="font-medium">{mission.rental_agency || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chauffeur</p>
              <p className="font-medium">{mission.driver_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Téléphone chauffeur</p>
              <p className="font-medium">{mission.driver_phone || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visa et documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Visa et Documents de Voyage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Visa requis</p>
              <div className="flex items-center gap-2">
                {mission.visa_required ? (
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-500" />
                )}
                <span className="font-medium">{mission.visa_required ? 'Oui' : 'Non'}</span>
              </div>
            </div>
            {mission.visa_required && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Type de visa</p>
                  <p className="font-medium">{mission.visa_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut visa</p>
                  <Badge className={visaStatusColors[mission.visa_status || 'Non requis']}>
                    {mission.visa_status || 'Non requis'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">N° visa</p>
                  <p className="font-medium font-mono">{mission.visa_number || '-'}</p>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Validité passeport</p>
              <div className="flex items-center gap-2">
                {isPassportExpiringSoon && (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
                <p className={`font-medium ${isPassportExpiringSoon ? 'text-orange-500' : ''}`}>
                  {mission.passport_expiry 
                    ? format(new Date(mission.passport_expiry), 'dd/MM/yyyy', { locale: fr })
                    : '-'}
                </p>
              </div>
              {isPassportExpiringSoon && (
                <p className="text-xs text-orange-500">Expire bientôt !</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Carnet de vaccination</p>
              <div className="flex items-center gap-2">
                {mission.vaccination_card_valid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">{mission.vaccination_card_valid ? 'Valide' : 'Non valide'}</span>
              </div>
            </div>
            {mission.vaccinations_required && mission.vaccinations_required.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Vaccinations requises</p>
                <div className="flex flex-wrap gap-1">
                  {mission.vaccinations_required.map((vax, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      <Syringe className="h-3 w-3 mr-1" />
                      {vax}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assurance voyage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Assurance Voyage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Compagnie d'assurance</p>
              <p className="font-medium">{mission.travel_insurance_company || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">N° de police</p>
              <p className="font-medium font-mono">{mission.travel_insurance_number || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts sur place */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5" />
            Contacts sur Place
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Contact local</p>
              <p className="font-medium">{mission.local_contact_name || '-'}</p>
              {mission.local_contact_phone && (
                <p className="text-sm text-muted-foreground">{mission.local_contact_phone}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Numéro d'urgence</p>
              <p className="font-medium">{mission.emergency_contact_local || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
