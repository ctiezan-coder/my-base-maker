import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, TrendingUp, AlertTriangle } from "lucide-react";
import { PotentialMarket } from "@/types/market-development";

interface MarketCardProps {
  market: PotentialMarket;
}

export const MarketCard = ({ market }: MarketCardProps) => {
  const getPotentialColor = (potential: string) => {
    switch (potential.toLowerCase()) {
      case "très élevé":
        return "text-green-600";
      case "élevé":
        return "text-blue-600";
      case "croissant":
        return "text-orange-600";
      case "émergent":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case "Faible":
        return "default";
      case "Modéré":
        return "secondary";
      case "Élevé":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">{market.country}</h3>
          </div>
          <Badge variant="outline" className="mb-2">
            {market.region}
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Potentiel de marché</p>
          <p className={`text-lg font-bold ${getPotentialColor(market.market_potential)}`}>
            {market.market_potential}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {market.demand_description && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Demande
            </p>
            <p className="text-sm">{market.demand_description}</p>
          </div>
        )}

        {market.key_products && market.key_products.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Produits clés
            </p>
            <p className="text-sm">{market.key_products.join(", ")}</p>
          </div>
        )}

        {market.requirements && market.requirements.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Exigences
            </p>
            <p className="text-sm">{market.requirements.join(", ")}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pt-4 border-t">
        {market.risk_level && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            <Badge variant={getRiskColor(market.risk_level)}>
              {market.risk_level}
            </Badge>
          </div>
        )}
        {market.growth_rate && (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">+{market.growth_rate}%</span>
          </div>
        )}
      </div>
    </Card>
  );
};
