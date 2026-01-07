import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Building2, 
  Calendar, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Target, 
  Users, 
  Wallet, 
  FileText, 
  Bell, 
  TrendingUp,
  Pencil,
  FolderKanban
} from "lucide-react";
import { PartnershipActivitiesTab } from "./tabs/PartnershipActivitiesTab";
import { PartnershipDocumentsTab } from "./tabs/PartnershipDocumentsTab";
import { PartnershipMeetingsTab } from "./tabs/PartnershipMeetingsTab";
import { PartnershipFinancesTab } from "./tabs/PartnershipFinancesTab";
import { PartnershipAlertsTab } from "./tabs/PartnershipAlertsTab";
import { PartnershipEvaluationTab } from "./tabs/PartnershipEvaluationTab";

interface PartnershipDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnership: any;
  onEdit: () => void;
  canManage: boolean;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "actif": "default",
  "en négociation": "secondary",
  "prospection": "outline",
  "signé": "default",
  "suspendu": "destructive",
  "expiré": "destructive",
  "renouvelé": "default",
  "résilié": "destructive",
};

const lifecycleLabels: Record<string, string> = {
  "identification": "Identification",
  "negociation": "Négociation",
  "signature": "Signature",
  "mise_en_oeuvre": "Mise en œuvre",
  "suivi": "Suivi",
  "renouvellement": "Renouvellement",
  "cloture": "Clôture",
};

export function PartnershipDetailsDialog({ 
  open, 
  onOpenChange, 
  partnership, 
  onEdit,
  canManage 
}: PartnershipDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: linkedProjects = [] } = useQuery({
    queryKey: ["partnership-projects-details", partnership?.id],
    queryFn: async () => {
      if (!partnership?.id) return [];
      const { data, error } = await supabase
        .from("partnership_projects")
        .select("project_id, projects(id, name, status)")
        .eq("partnership_id", partnership.id);
      if (error) throw error;
      return data;
    },
    enabled: !!partnership?.id,
  });

  const { data: direction } = useQuery({
    queryKey: ["direction", partnership?.direction_id],
    queryFn: async () => {
      if (!partnership?.direction_id) return null;
      const { data, error } = await supabase
        .from("directions")
        .select("name")
        .eq("id", partnership.direction_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!partnership?.direction_id,
  });

  if (!partnership) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {partnership.partner_name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={statusColors[partnership.status] || "default"}>
                  {partnership.status || "Non défini"}
                </Badge>
                {partnership.lifecycle_stage && (
                  <Badge variant="outline">
                    {lifecycleLabels[partnership.lifecycle_stage] || partnership.lifecycle_stage}
                  </Badge>
                )}
                {partnership.reference_code && (
                  <Badge variant="secondary">{partnership.reference_code}</Badge>
                )}
              </div>
            </div>
            {canManage && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="activities">Activités</TabsTrigger>
            <TabsTrigger value="meetings">Réunions</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
            <TabsTrigger value="evaluation">Évaluation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Partner Info */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Informations du partenaire
                </h4>
                <div className="space-y-2 text-sm">
                  {partnership.partner_type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type de partenariat:</span>
                      <span>{partnership.partner_type}</span>
                    </div>
                  )}
                  {partnership.organization_type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type d'organisation:</span>
                      <span>{partnership.organization_type}</span>
                    </div>
                  )}
                  {partnership.partner_country && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pays:</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {partnership.partner_country}
                      </span>
                    </div>
                  )}
                  {partnership.partner_sector && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Secteur:</span>
                      <span>{partnership.partner_sector}</span>
                    </div>
                  )}
                  {partnership.partner_website && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Site web:</span>
                      <a 
                        href={partnership.partner_website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="w-3 h-3" />
                        Visiter
                      </a>
                    </div>
                  )}
                  {direction?.name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Direction:</span>
                      <span>{direction.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dates clés
                </h4>
                <div className="space-y-2 text-sm">
                  {partnership.signature_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Signature:</span>
                      <span>{format(new Date(partnership.signature_date), "dd MMM yyyy", { locale: fr })}</span>
                    </div>
                  )}
                  {partnership.start_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Début:</span>
                      <span>{format(new Date(partnership.start_date), "dd MMM yyyy", { locale: fr })}</span>
                    </div>
                  )}
                  {partnership.end_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Échéance:</span>
                      <span>{format(new Date(partnership.end_date), "dd MMM yyyy", { locale: fr })}</span>
                    </div>
                  )}
                  {partnership.renewal_conditions && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renouvellement:</span>
                      <span>{partnership.renewal_conditions}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {partnership.description && (
              <div className="space-y-2">
                <h4 className="font-semibold">Description</h4>
                <p className="text-sm text-muted-foreground">{partnership.description}</p>
              </div>
            )}

            {/* Domains */}
            {partnership.domains && partnership.domains.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Domaines d'intervention</h4>
                <div className="flex flex-wrap gap-2">
                  {partnership.domains.map((domain: string) => (
                    <Badge key={domain} variant="outline">{domain}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Contact Partenaire
                </h4>
                {partnership.contact_person && (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{partnership.contact_person}</p>
                    {partnership.contact_email && (
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {partnership.contact_email}
                      </p>
                    )}
                    {partnership.contact_phone && (
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {partnership.contact_phone}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Point focal ACIEX
                </h4>
                {partnership.aciex_focal_point && (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{partnership.aciex_focal_point}</p>
                    {partnership.aciex_focal_email && (
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {partnership.aciex_focal_email}
                      </p>
                    )}
                    {partnership.aciex_focal_phone && (
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {partnership.aciex_focal_phone}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Objectives */}
            {partnership.strategic_objectives && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Objectifs stratégiques
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {partnership.strategic_objectives}
                </p>
              </div>
            )}

            {/* Linked Projects */}
            {linkedProjects.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <FolderKanban className="w-4 h-4" />
                  Projets liés
                </h4>
                <div className="flex flex-wrap gap-2">
                  {linkedProjects.map((link: any) => (
                    <Badge key={link.project_id} variant="secondary">
                      {link.projects?.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            {(partnership.budget || partnership.partner_contribution) && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Aspects financiers
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {partnership.budget && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget ACIEX:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("fr-FR").format(partnership.budget)} FCFA
                      </span>
                    </div>
                  )}
                  {partnership.partner_contribution && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contribution partenaire:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("fr-FR").format(partnership.partner_contribution)} FCFA
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activities">
            <PartnershipActivitiesTab 
              partnershipId={partnership.id} 
              canManage={canManage} 
            />
          </TabsContent>

          <TabsContent value="meetings">
            <PartnershipMeetingsTab 
              partnershipId={partnership.id} 
              canManage={canManage} 
            />
          </TabsContent>

          <TabsContent value="documents">
            <PartnershipDocumentsTab 
              partnershipId={partnership.id} 
              canManage={canManage} 
            />
          </TabsContent>

          <TabsContent value="finances">
            <PartnershipFinancesTab 
              partnershipId={partnership.id}
              budget={partnership.budget}
              partnerContribution={partnership.partner_contribution}
              canManage={canManage} 
            />
          </TabsContent>

          <TabsContent value="alerts">
            <PartnershipAlertsTab 
              partnershipId={partnership.id} 
              canManage={canManage} 
            />
          </TabsContent>

          <TabsContent value="evaluation">
            <PartnershipEvaluationTab 
              partnership={partnership}
              canManage={canManage} 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
