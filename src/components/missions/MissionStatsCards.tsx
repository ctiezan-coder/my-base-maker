import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plane, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Globe,
  MapPin,
  Wallet
} from "lucide-react";
import { MissionStats } from "@/types/mission";

interface MissionStatsCardsProps {
  stats: MissionStats;
}

export function MissionStatsCards({ stats }: MissionStatsCardsProps) {
  const cards = [
    {
      title: "Total Missions",
      value: stats.total,
      icon: Plane,
      color: "text-primary",
      description: `${stats.nationales} nationales, ${stats.internationales} internationales`
    },
    {
      title: "En Validation",
      value: stats.enValidation,
      icon: Clock,
      color: "text-yellow-500",
      description: "En attente d'approbation"
    },
    {
      title: "Approuvées",
      value: stats.approuvees,
      icon: FileCheck,
      color: "text-blue-500",
      description: "Prêtes à démarrer"
    },
    {
      title: "En Cours",
      value: stats.enCours,
      icon: Globe,
      color: "text-green-500",
      description: "Missions actives"
    },
    {
      title: "Terminées",
      value: stats.terminees,
      icon: CheckCircle2,
      color: "text-gray-500",
      description: "Missions accomplies"
    },
    {
      title: "En Attente Rapport",
      value: stats.enAttenteRapport,
      icon: FileText,
      color: "text-orange-500",
      description: "Rapports à soumettre"
    },
    {
      title: "En Liquidation",
      value: stats.enLiquidation,
      icon: Wallet,
      color: "text-purple-500",
      description: "Frais à régulariser"
    },
    {
      title: "Budget Total",
      value: `${(stats.budgetTotal / 1000000).toFixed(1)}M`,
      icon: Wallet,
      color: "text-emerald-500",
      description: `Consommé: ${(stats.budgetConsomme / 1000000).toFixed(1)}M FCFA`
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground truncate">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
