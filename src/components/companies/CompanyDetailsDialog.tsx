import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, GraduationCap, Handshake, TrendingUp, Target } from "lucide-react";
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
        .select("support_needed, exported_products, activity_sector")
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

  // Fetch partnerships related to this company
  const { data: partnerships } = useQuery({
    queryKey: ["company-partnerships", companyId],
    queryFn: async () => {
      // Check if partnerships might be linked via projects or directly
      const { data, error } = await supabase
        .from("partnerships")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Détails de l'opérateur</DialogTitle>
          <p className="text-muted-foreground">{companyName}</p>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Accompaniment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Type d'accompagnement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-base px-4 py-2">
                  {company?.support_needed || "Non défini"}
                </Badge>
              </CardContent>
            </Card>

            {/* Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Événements ({events?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events && events.length > 0 ? (
                  <div className="space-y-3">
                    {events.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex justify-between items-start p-3 border rounded-lg">
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
                  <p className="text-muted-foreground">Aucun événement enregistré</p>
                )}
              </CardContent>
            </Card>

            {/* Trainings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Formations ({trainings?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trainings && trainings.length > 0 ? (
                  <div className="space-y-3">
                    {trainings.map((reg) => (
                      <div key={reg.id} className="flex justify-between items-start p-3 border rounded-lg">
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
                  <p className="text-muted-foreground">Aucune formation enregistrée</p>
                )}
              </CardContent>
            </Card>

            {/* Partnerships */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5" />
                  Partenariats ({partnerships?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partnerships && partnerships.length > 0 ? (
                  <div className="space-y-3">
                    {partnerships.slice(0, 5).map((partnership) => (
                      <div key={partnership.id} className="flex justify-between items-start p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{partnership.partner_name}</p>
                          <p className="text-sm text-muted-foreground">{partnership.partner_type}</p>
                          {partnership.start_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Depuis {format(new Date(partnership.start_date), "dd MMM yyyy", { locale: fr })}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">{partnership.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun partenariat enregistré</p>
                )}
              </CardContent>
            </Card>

            {/* Market Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Opportunités de marchés ({opportunities?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {opportunities && opportunities.length > 0 ? (
                  <div className="space-y-3">
                    {opportunities.map((opp) => (
                      <div key={opp.id} className="p-3 border rounded-lg space-y-2">
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
                  <p className="text-muted-foreground">
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
