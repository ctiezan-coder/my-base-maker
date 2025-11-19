import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Package, TrendingUp, Building2, Send } from "lucide-react";
import { ExportOpportunity } from "@/types/market-development";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CompanyApplications } from "./CompanyApplications";

interface OpportunityCardProps {
  opportunity: ExportOpportunity;
  onSendToOperators?: (id: string, title: string, sector: string) => void;
  showApplications?: boolean;
}

export const OpportunityCard = ({ 
  opportunity, 
  onSendToOperators,
  showApplications = false 
}: OpportunityCardProps) => {
  const [showApps, setShowApps] = useState(false);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "URGENT":
        return "destructive";
      case "NOUVEAU":
        return "default";
      case "RECOMMANDÉ":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col gap-4">
        {/* Header section with title and score */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {opportunity.status && (
                <Badge variant={getStatusColor(opportunity.status)}>
                  {opportunity.status}
                </Badge>
              )}
              <Badge variant="outline">{opportunity.region}</Badge>
            </div>
            <h3 className="text-xl font-semibold mb-2 break-words">{opportunity.title}</h3>
            <p className="text-sm text-muted-foreground break-words">
              {opportunity.sector} • Valeur estimée:{" "}
              {opportunity.estimated_value.toLocaleString()} {opportunity.currency}
            </p>
          </div>
          {opportunity.compatibility_score && (
            <div className="flex flex-col items-center shrink-0 min-w-[80px]">
              <TrendingUp className="h-5 w-5 text-green-600 mb-1" />
              <span className="text-2xl font-bold text-green-600">
                {opportunity.compatibility_score}%
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">Compatibilité</span>
            </div>
          )}
        </div>

        {/* Info grid section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="text-sm font-medium break-words">
                {opportunity.destination_country}
                {opportunity.destination_city && `, ${opportunity.destination_city}`}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Échéance</p>
              <p className="text-sm font-medium break-words">
                {format(new Date(opportunity.deadline), "dd MMMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Package className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="text-sm font-medium break-words">{opportunity.volume}</p>
            </div>
          </div>
        </div>

        {/* Description section */}
        <p className="text-sm text-muted-foreground break-words">
          {opportunity.description}
        </p>

        {/* Requirements section */}
        {opportunity.requirements && opportunity.requirements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {opportunity.requirements.map((req, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {req}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions section */}
        <div className="flex flex-col sm:flex-row gap-2">
          {showApplications && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApps(!showApps)}
              className="flex-1"
            >
              <Building2 className="mr-2 h-4 w-4" />
              {showApps ? "Masquer" : "Voir"} candidatures
            </Button>
          )}
          {onSendToOperators && (
            <Button
              onClick={() => onSendToOperators(opportunity.id, opportunity.title, opportunity.sector)}
              className="flex-1"
            >
              <Send className="mr-2 h-4 w-4" />
              Envoyer à opérateurs
            </Button>
          )}
        </div>
      </div>

      {showApps && showApplications && (
        <div className="mt-4 pt-4 border-t">
          <CompanyApplications opportunityId={opportunity.id} />
        </div>
      )}
    </Card>
  );
};
