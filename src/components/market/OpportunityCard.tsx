import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Package, TrendingUp } from "lucide-react";
import { ExportOpportunity } from "@/types/market-development";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface OpportunityCardProps {
  opportunity: ExportOpportunity;
  onApply?: (id: string) => void;
}

export const OpportunityCard = ({ opportunity, onApply }: OpportunityCardProps) => {
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
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {opportunity.status && (
              <Badge variant={getStatusColor(opportunity.status)}>
                {opportunity.status}
              </Badge>
            )}
            <Badge variant="outline">{opportunity.region}</Badge>
          </div>
          <h3 className="text-xl font-semibold mb-2">{opportunity.title}</h3>
          <p className="text-sm text-muted-foreground">
            {opportunity.sector} • Valeur estimée:{" "}
            {opportunity.estimated_value.toLocaleString()} {opportunity.currency}
          </p>
        </div>
        {opportunity.compatibility_score && (
          <div className="flex flex-col items-center">
            <TrendingUp className="h-5 w-5 text-green-600 mb-1" />
            <span className="text-2xl font-bold text-green-600">
              {opportunity.compatibility_score}%
            </span>
            <span className="text-xs text-muted-foreground">Compatibilité</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Destination</p>
            <p className="text-sm font-medium">
              {opportunity.destination_country}
              {opportunity.destination_city && `, ${opportunity.destination_city}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Échéance</p>
            <p className="text-sm font-medium">
              {format(new Date(opportunity.deadline), "dd MMMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="text-sm font-medium">{opportunity.volume}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {opportunity.description}
      </p>

      {opportunity.requirements && opportunity.requirements.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {opportunity.requirements.map((req, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {req}
            </Badge>
          ))}
        </div>
      )}

      {onApply && (
        <Button
          onClick={() => onApply(opportunity.id)}
          className="w-full"
        >
          Postuler
        </Button>
      )}
    </Card>
  );
};
