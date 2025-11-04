import { Card } from "@/components/ui/card";
import { TrendingUp, Globe, Users, Link2 } from "lucide-react";

interface MarketStatsCardsProps {
  pmeCount: number;
  exportValue: number;
  activeMarkets: number;
  connections: number;
}

export const MarketStatsCards = ({
  pmeCount,
  exportValue,
  activeMarkets,
  connections,
}: MarketStatsCardsProps) => {
  const stats = [
    {
      title: "PME Accompagnées",
      value: `${pmeCount}+`,
      subtitle: "↑ 23% cette année",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Valeur Exportations",
      value: `${exportValue} Mds $`,
      subtitle: "Afrique 2023",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Marchés Actifs",
      value: activeMarkets,
      subtitle: "ZLECAf",
      icon: Globe,
      color: "text-blue-600",
    },
    {
      title: "Mises en Relation",
      value: connections.toLocaleString(),
      subtitle: "En 2025",
      icon: Link2,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </h3>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
