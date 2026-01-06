import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, GraduationCap, TrendingUp, Target, Building2, MapPin, Mail, Phone, Globe, User, Briefcase, Award, Package, Ship } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface CompanyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
}

export function CompanyDetailsDialog({ 
  open, 
  onOpenChange, 
  companyId,
  companyName 
}: CompanyDetailsDialogProps) {
  // Fetch company details
  const { data: company } = useQuery({
    queryKey: ["company-details", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: open && !!companyId,
  });

  // Fetch events the company participated in using the event_participants table
  const { data: events } = useQuery({
    queryKey: ["company-events", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_participants")
        .select(`
          *,
          events (*)
        `)
        .eq("company_id", companyId)
        .order("registration_date", { ascending: false });
      
      if (error) throw error;
      return data
        ?.filter(ep => ep.events)
        ?.map(ep => ({
          ...ep.events,
          participation_status: ep.status,
          registration_date: ep.registration_date,
          participation_notes: ep.notes
        })) || [];
    },
    enabled: open && !!companyId,
  });

  // Fetch training registrations
  const { data: trainings } = useQuery({
    queryKey: ["company-trainings", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_registrations")
        .select("*")
        .eq("company_id", companyId)
        .order("registration_date", { ascending: false });
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      // Fetch training details separately
      const trainingIds = data.map(r => r.training_id);
      const { data: trainingData } = await supabase
        .from("trainings")
        .select("id, title, training_type, start_date, end_date")
        .in("id", trainingIds);
      
      // Merge training data with registrations
      return data.map(reg => ({
        ...reg,
        training: trainingData?.find(t => t.id === reg.training_id)
      }));
    },
    enabled: open && !!companyId,
  });

  // Fetch market opportunities based on exported products and sector
  const { data: opportunities } = useQuery({
    queryKey: ["company-opportunities", companyId, company?.activity_sector],
    queryFn: async () => {
      if (!company?.activity_sector) return [];
      
      const { data, error } = await supabase
        .from("export_opportunities")
        .select("*")
        .ilike("sector", `%${company.activity_sector}%`)
        .neq("status", "FERMÉ")
        .order("deadline", { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!companyId && !!company?.activity_sector,
  });

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    "Confirmée": "default",
    "En attente": "secondary",
    "Présent": "default",
    "Absent": "destructive",
  };

  const getAccompanimentStatusColor = (status: string | null) => {
    switch (status) {
      case "En accompagnement":
        return "bg-primary/10 text-primary border-primary/20";
      case "Accompagnement terminé":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Non accompagné":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            {companyName}
          </DialogTitle>
          {company?.trade_name && (
            <p className="text-muted-foreground">{company.trade_name}</p>
          )}
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Siège social</p>
                        <p className="font-medium">{company?.headquarters_location || "Non renseigné"}</p>
                        {company?.city && <p className="text-sm">{company.city}</p>}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Secteur d'activité</p>
                        <p className="font-medium">{company?.activity_sector || "Non renseigné"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Forme juridique</p>
                        <p className="font-medium">{company?.legal_form || "Non renseigné"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Taille de l'entreprise</p>
                        <p className="font-medium">{company?.company_size || "Non renseigné"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Award className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">N° DFE</p>
                        <p className="font-medium">{company?.dfe_number || "Non renseigné"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Award className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">N° RCCM</p>
                        <p className="font-medium">{company?.rccm_number || "Non renseigné"}</p>
                      </div>
                    </div>
                    {company?.creation_date && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date de création</p>
                          <p className="font-medium">{format(new Date(company.creation_date), "dd MMMM yyyy", { locale: fr })}</p>
                        </div>
                      </div>
                    )}
                    {company?.annual_turnover && (
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Chiffre d'affaires annuel</p>
                          <p className="font-medium">{company.annual_turnover.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contacts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-accent" />
                  Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Représentant légal */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Représentant légal</p>
                    <div className="space-y-2">
                      {company?.legal_representative_name && (
                        <p className="font-medium">{company.legal_representative_name}</p>
                      )}
                      {company?.legal_representative_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${company.legal_representative_email}`} className="hover:underline">{company.legal_representative_email}</a>
                        </div>
                      )}
                      {company?.legal_representative_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{company.legal_representative_phone}</span>
                        </div>
                      )}
                      {!company?.legal_representative_name && !company?.legal_representative_email && !company?.legal_representative_phone && (
                        <p className="text-sm text-muted-foreground">Non renseigné</p>
                      )}
                    </div>
                  </div>
                  {/* Responsable export */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Responsable export</p>
                    <div className="space-y-2">
                      {company?.export_manager_name && (
                        <p className="font-medium">{company.export_manager_name}</p>
                      )}
                      {company?.export_manager_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${company.export_manager_email}`} className="hover:underline">{company.export_manager_email}</a>
                        </div>
                      )}
                      {company?.export_manager_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{company.export_manager_phone}</span>
                        </div>
                      )}
                      {!company?.export_manager_name && !company?.export_manager_email && !company?.export_manager_phone && (
                        <p className="text-sm text-muted-foreground">Non renseigné</p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Coordonnées entreprise */}
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {company?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${company.email}`} className="hover:underline">{company.email}</a>
                    </div>
                  )}
                  {company?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company?.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{company.website}</a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activité export */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ship className="h-5 w-5 text-secondary" />
                  Activité export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Produits / Services</p>
                    <p className="text-sm">{company?.products_services || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Produits exportés</p>
                    <p className="text-sm">{company?.exported_products || "Non renseigné"}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Marchés actuels</p>
                    <div className="flex flex-wrap gap-1">
                      {company?.current_export_markets && company.current_export_markets.length > 0 ? (
                        company.current_export_markets.map((market, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{market}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucun marché actuel</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Marchés cibles</p>
                    <div className="flex flex-wrap gap-1">
                      {company?.target_export_markets && company.target_export_markets.length > 0 ? (
                        company.target_export_markets.map((market, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{market}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucun marché cible</p>
                      )}
                    </div>
                  </div>
                </div>
                {company?.certifications && company.certifications.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-1">
                        {company.certifications.map((cert, i) => (
                          <Badge key={i} className="text-xs bg-green-500/10 text-green-600 border-green-500/20">{cert}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Accompagnement */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Accompagnement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Statut d'accompagnement</p>
                    <Badge className={`${getAccompanimentStatusColor(company?.accompaniment_status)} px-3 py-1`}>
                      {company?.accompaniment_status || "Non défini"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Type d'accompagnement souhaité</p>
                    <Badge variant="outline" className="px-3 py-1">
                      {company?.support_needed || "Non défini"}
                    </Badge>
                  </div>
                </div>
                {company?.aciex_interaction_history && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Historique des interactions</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">{company.aciex_interaction_history}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Événements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-secondary" />
                  Événements ({events?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events && events.length > 0 ? (
                  <div className="space-y-3">
                    {events.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex justify-between items-start p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.event_type}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(event.start_date), "dd MMM yyyy", { locale: fr })}
                          </p>
                        </div>
                        <Badge variant="outline">{event.location}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Aucun événement enregistré</p>
                )}
              </CardContent>
            </Card>

            {/* Formations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5 text-accent" />
                  Formations ({trainings?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trainings && trainings.length > 0 ? (
                  <div className="space-y-3">
                    {trainings.map((reg) => (
                      <div key={reg.id} className="flex justify-between items-start p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium">{reg.training?.title}</p>
                          <p className="text-sm text-muted-foreground">{reg.training?.training_type}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Inscrit le {format(new Date(reg.registration_date), "dd MMM yyyy", { locale: fr })}
                          </p>
                        </div>
                        <Badge variant={statusColors[reg.status || ""] || "outline"}>
                          {reg.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Aucune formation enregistrée</p>
                )}
              </CardContent>
            </Card>

            {/* Opportunités de marché */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Opportunités de marchés ({opportunities?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {opportunities && opportunities.length > 0 ? (
                  <div className="space-y-3">
                    {opportunities.map((opp) => (
                      <div key={opp.id} className="p-3 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{opp.title}</p>
                          <Badge variant={
                            opp.status === "URGENT" ? "destructive" : 
                            opp.status === "RECOMMANDÉ" ? "default" : 
                            "secondary"
                          }>
                            {opp.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{opp.description}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>📍 {opp.destination_country}</span>
                          <Separator orientation="vertical" className="h-4" />
                          <span>💰 {opp.estimated_value.toLocaleString()} {opp.currency}</span>
                          <Separator orientation="vertical" className="h-4" />
                          <span>📅 {format(new Date(opp.deadline), "dd MMM yyyy", { locale: fr })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Aucune opportunité correspondant au secteur d'activité
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
