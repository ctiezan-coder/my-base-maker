import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, TrendingUp, Mail, Phone } from "lucide-react";

interface OpportunityMatchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: {
    id: number;
    title: string;
    description: string;
    country: string;
    sector: string;
  } | null;
}

export function OpportunityMatchesDialog({ open, onOpenChange, opportunity }: OpportunityMatchesDialogProps) {
  // Données de démo pour les PME matchées
  const matches = [
    {
      id: 1,
      name: "BioKarité Côte d'Ivoire",
      sector: "Cosmétique • Produits naturels",
      matchScore: 95,
      contact: "Koné Fatou",
      email: "contact@biokarite.ci",
      phone: "+225 07 00 00 00",
      strengths: ["Certification bio", "Production locale", "Qualité premium"]
    },
    {
      id: 2,
      name: "Cacao Excellence CI",
      sector: "Agroalimentaire • Cacao transformé",
      matchScore: 88,
      contact: "Yao Marie",
      email: "info@cacaoexcellence.ci",
      phone: "+225 07 11 11 11",
      strengths: ["Certifications internationales", "Capacité export", "Traçabilité"]
    }
  ];

  if (!opportunity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{opportunity.title}</DialogTitle>
          <DialogDescription>
            {opportunity.description}
          </DialogDescription>
          <div className="flex items-center gap-4 pt-2">
            <Badge variant="secondary">
              <MapPin className="h-3 w-3 mr-1" />
              {opportunity.country}
            </Badge>
            <Badge variant="outline">
              <Building2 className="h-3 w-3 mr-1" />
              {opportunity.sector}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">PME correspondantes ({matches.length})</h3>
            <Button size="sm">Proposer toutes les PME</Button>
          </div>

          <div className="space-y-4">
            {matches.map((match) => (
              <Card key={match.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{match.name}</CardTitle>
                      <CardDescription>{match.sector}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Match {match.matchScore}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-2">Points forts:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.strengths.map((strength, idx) => (
                          <Badge key={idx} variant="secondary">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-sm">
                        <p className="text-muted-foreground">Contact</p>
                        <p className="font-medium">{match.contact}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {match.email}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Téléphone</p>
                        <p className="font-medium flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {match.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        Voir détails PME
                      </Button>
                      <Button size="sm">
                        Proposer cette opportunité
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
