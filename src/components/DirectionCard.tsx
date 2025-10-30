import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface DirectionCardProps {
  title: string;
  description: string;
  categories: string[];
  priority: "Élevé" | "Très élevé";
  volume?: string;
  icon: LucideIcon;
}

export const DirectionCard = ({ 
  title, 
  description, 
  categories, 
  priority, 
  volume, 
  icon: Icon 
}: DirectionCardProps) => {
  const priorityColors = {
    "Élevé": "bg-accent/10 text-accent border-accent/30",
    "Très élevé": "bg-primary/10 text-primary border-primary/30"
  };

  return (
    <Card className="group hover:shadow-[var(--shadow-elevated)] transition-all duration-300 hover:-translate-y-1 border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </CardTitle>
              <CardDescription className="text-sm mt-1">{description}</CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${priorityColors[priority]} font-medium text-xs border`}
          >
            {priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Catégories clés
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-normal"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
        {volume && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Volume estimé: <span className="font-semibold text-foreground">{volume}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
