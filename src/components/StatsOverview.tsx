import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Database, Users, Target } from "lucide-react";

export const StatsOverview = () => {
  const stats = [
    {
      label: "Gain de Productivité",
      value: "40%",
      icon: TrendingUp,
      description: "Augmentation estimée"
    },
    {
      label: "Directions",
      value: "5",
      icon: Users,
      description: "Centralisées"
    },
    {
      label: "Volume Total",
      value: "~9 Go",
      icon: Database,
      description: "Données gérées"
    },
    {
      label: "Timeline",
      value: "6-12",
      icon: Target,
      description: "Mois de déploiement"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-[var(--shadow-card)] transition-all duration-300"
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm font-medium text-foreground/80">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
