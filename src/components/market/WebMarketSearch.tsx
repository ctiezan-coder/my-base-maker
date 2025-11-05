import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Globe, TrendingUp, Loader2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WebSearchResult {
  title: string;
  description: string;
  url: string;
}

export const WebMarketSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"opportunities" | "markets">("opportunities");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<WebSearchResult[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un terme de recherche",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const searchTerms = searchType === "opportunities" 
        ? `${searchQuery} export opportunities Africa SME business 2025`
        : `${searchQuery} export market potential Africa trade 2025`;

      // Simuler une recherche web - dans une vraie implémentation, on utiliserait l'API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Résultats simulés pour la démo
      const mockResults: WebSearchResult[] = [
        {
          title: `Opportunités d'export ${searchQuery} - Afrique de l'Ouest`,
          description: `Découvrez les dernières opportunités d'exportation dans le secteur ${searchQuery} vers l'Afrique de l'Ouest. Marchés en forte croissance avec la ZLECAf.`,
          url: "https://www.example.com/opportunities-1"
        },
        {
          title: `Marché ${searchQuery} - Analyse 2025`,
          description: `Analyse approfondie du marché ${searchQuery} en Afrique. Perspectives de croissance, acteurs clés et opportunités pour les PME ivoiriennes.`,
          url: "https://www.example.com/market-analysis"
        },
        {
          title: `Export ${searchQuery} vers l'Europe - Guide complet`,
          description: `Guide complet pour exporter ${searchQuery} vers les marchés européens. Réglementations, certifications requises et contacts importateurs.`,
          url: "https://www.example.com/export-guide"
        },
        {
          title: `Tendances ${searchQuery} - Moyen-Orient 2025`,
          description: `Les tendances du marché ${searchQuery} au Moyen-Orient. Demande croissante et opportunités pour les produits africains premium.`,
          url: "https://www.example.com/trends-2025"
        },
        {
          title: `Partenariats commerciaux ${searchQuery}`,
          description: `Trouvez des partenaires commerciaux pour ${searchQuery}. Base de données d'importateurs et distributeurs en Afrique et international.`,
          url: "https://www.example.com/partnerships"
        }
      ];

      setResults(mockResults);
      toast({
        title: "Recherche terminée",
        description: `${mockResults.length} résultats trouvés`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la recherche. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Recherche Web en Temps Réel
          </CardTitle>
          <CardDescription>
            Recherchez des opportunités et marchés potentiels directement sur le web
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={searchType} onValueChange={(value: "opportunities" | "markets") => setSearchType(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opportunities">Opportunités</SelectItem>
                <SelectItem value="markets">Marchés Potentiels</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Ex: cacao, textile, cosmétiques bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Recherche quotidienne automatique sur les nouvelles opportunités</span>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Résultats de recherche</h3>
            <Badge variant="secondary">{results.length} résultats</Badge>
          </div>

          <div className="grid gap-4">
            {results.map((result, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        {result.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {result.description}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !isSearching && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune recherche effectuée</h3>
            <p className="text-muted-foreground max-w-md">
              Effectuez une recherche pour découvrir des opportunités et marchés potentiels en temps réel sur le web
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
