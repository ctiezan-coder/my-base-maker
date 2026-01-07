import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar, Award, Globe, Facebook, Linkedin, Twitter, Instagram } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ExtendedCompany } from "@/types/company-extended";

interface CompanyIdentityTabProps {
  company: ExtendedCompany;
}

export function CompanyIdentityTab({ company }: CompanyIdentityTabProps) {
  const getLegalStatusColor = (status?: string) => {
    switch (status) {
      case 'Actif':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'En cessation':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Liquidation':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Suspendu':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Identification */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Identification de l'Entreprise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Raison sociale</p>
              <p className="font-medium">{company.company_name}</p>
            </div>
            {company.trade_name && (
              <div>
                <p className="text-sm text-muted-foreground">Nom commercial</p>
                <p className="font-medium">{company.trade_name}</p>
              </div>
            )}
            {company.sigle && (
              <div>
                <p className="text-sm text-muted-foreground">Sigle</p>
                <p className="font-medium">{company.sigle}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Forme juridique</p>
              <p className="font-medium">{company.legal_form || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut juridique</p>
              <Badge className={getLegalStatusColor(company.legal_status)}>
                {company.legal_status || 'Actif'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taille entreprise</p>
              <p className="font-medium">{company.company_size || 'Non renseigné'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Immatriculation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-primary" />
            Immatriculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">N° RCCM</p>
              <p className="font-medium font-mono">{company.rccm_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Compte Contribuable (DFE)</p>
              <p className="font-medium font-mono">{company.dfe_number}</p>
            </div>
            {company.creation_date && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date de création</p>
                  <p className="font-medium">
                    {format(new Date(company.creation_date), "dd MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>
            )}
            {company.registration_date_aciex && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Enregistrement ACIEX</p>
                  <p className="font-medium">
                    {format(new Date(company.registration_date_aciex), "dd MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Localisation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Coordonnées et Localisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Siège social</p>
                <p className="font-medium">{company.headquarters_location}</p>
              </div>
              {company.postal_address && (
                <div>
                  <p className="text-sm text-muted-foreground">Adresse postale</p>
                  <p className="font-medium">{company.postal_address}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {company.city && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ville</p>
                    <p className="font-medium">{company.city}</p>
                  </div>
                )}
                {company.commune && (
                  <div>
                    <p className="text-sm text-muted-foreground">Commune</p>
                    <p className="font-medium">{company.commune}</p>
                  </div>
                )}
                {company.region && (
                  <div>
                    <p className="text-sm text-muted-foreground">Région</p>
                    <p className="font-medium">{company.region}</p>
                  </div>
                )}
                {company.postal_code && (
                  <div>
                    <p className="text-sm text-muted-foreground">Code postal</p>
                    <p className="font-medium">{company.postal_code}</p>
                  </div>
                )}
              </div>
              {(company.gps_latitude && company.gps_longitude) && (
                <div>
                  <p className="text-sm text-muted-foreground">Coordonnées GPS</p>
                  <p className="font-medium font-mono text-sm">
                    {company.gps_latitude}, {company.gps_longitude}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {company.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{company.phone}</p>
                </div>
              )}
              {company.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${company.email}`} className="font-medium text-primary hover:underline">
                    {company.email}
                  </a>
                </div>
              )}
              {company.website && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Site web</p>
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              )}
              
              {/* Réseaux sociaux */}
              {(company.facebook_url || company.linkedin_url || company.twitter_url || company.instagram_url) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Réseaux sociaux</p>
                  <div className="flex gap-3">
                    {company.facebook_url && (
                      <a 
                        href={company.facebook_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                      >
                        <Facebook className="h-5 w-5 text-blue-600" />
                      </a>
                    )}
                    {company.linkedin_url && (
                      <a 
                        href={company.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                      >
                        <Linkedin className="h-5 w-5 text-blue-700" />
                      </a>
                    )}
                    {company.twitter_url && (
                      <a 
                        href={company.twitter_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                      >
                        <Twitter className="h-5 w-5 text-sky-500" />
                      </a>
                    )}
                    {company.instagram_url && (
                      <a 
                        href={company.instagram_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                      >
                        <Instagram className="h-5 w-5 text-pink-600" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
