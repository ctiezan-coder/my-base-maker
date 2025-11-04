import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OpportunityCard } from "@/components/market/OpportunityCard";
import { MarketCard } from "@/components/market/MarketCard";
import { ConnectionsTable } from "@/components/market/ConnectionsTable";
import { OpportunityDialog } from "@/components/market/OpportunityDialog";
import { ApplicationDialog } from "@/components/market/ApplicationDialog";
import { ExportOpportunity, PotentialMarket, BusinessConnection, MarketRegion } from "@/types/market-development";

export default function MarketDevelopment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ExportOpportunity | undefined>();
  const [selectedOpportunityForApplication, setSelectedOpportunityForApplication] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Fetch opportunities
  const { data: opportunities = [], isLoading: loadingOpportunities, refetch: refetchOpportunities } = useQuery({
    queryKey: ["export-opportunities", searchTerm, sectorFilter, regionFilter],
    queryFn: async () => {
      let query = supabase
        .from("export_opportunities")
        .select("*")
        .order("deadline", { ascending: true });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      if (sectorFilter !== "all") {
        query = query.eq("sector", sectorFilter);
      }
      if (regionFilter !== "all") {
        query = query.eq("region", regionFilter as MarketRegion);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ExportOpportunity[];
    },
  });

  // Fetch potential markets
  const { data: markets = [], isLoading: loadingMarkets } = useQuery({
    queryKey: ["potential-markets", regionFilter],
    queryFn: async () => {
      let query = supabase
        .from("potential_markets")
        .select("*")
        .order("market_potential", { ascending: false });

      if (regionFilter !== "all") {
        query = query.eq("region", regionFilter as MarketRegion);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PotentialMarket[];
    },
  });

  // Fetch business connections
  const { data: connections = [], isLoading: loadingConnections } = useQuery({
    queryKey: ["business-connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_connections")
        .select("*")
        .order("connection_date", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as BusinessConnection[];
    },
  });

  // Calculate stats
  const totalConnections = connections.length;
  const signedContracts = connections.filter(c => c.status === "Contrat signé").length;
  const totalValue = connections.reduce((sum, c) => sum + Number(c.contract_value), 0);
  const conversionRate = totalConnections > 0 ? ((signedContracts / totalConnections) * 100).toFixed(0) : 0;

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOpportunity(undefined);
    refetchOpportunities();
  };

  const handleEdit = (opportunity: ExportOpportunity) => {
    setSelectedOpportunity(opportunity);
    setDialogOpen(true);
  };

  const handleApply = (opportunityId: string) => {
    const opportunity = opportunities.find(o => o.id === opportunityId);
    if (opportunity) {
      setSelectedOpportunityForApplication({
        id: opportunity.id,
        title: opportunity.title,
      });
      setApplicationDialogOpen(true);
    }
  };

  const handleCloseApplicationDialog = () => {
    setApplicationDialogOpen(false);
    setSelectedOpportunityForApplication(null);
    refetchOpportunities();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Développement des Marchés Export</h1>
                <p className="text-muted-foreground mt-2">
                  Accompagnement des PME à l'international
                </p>
              </div>
            </div>

            <Tabs defaultValue="opportunities" className="space-y-6">
              <TabsList>
                <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
                <TabsTrigger value="markets">Marchés Potentiels</TabsTrigger>
                <TabsTrigger value="connections">Mises en Relation</TabsTrigger>
              </TabsList>

              <TabsContent value="opportunities" className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher une opportunité..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={sectorFilter} onValueChange={setSectorFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Tous les secteurs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les secteurs</SelectItem>
                      <SelectItem value="Agroalimentaire">Agroalimentaire</SelectItem>
                      <SelectItem value="Cosmétiques">Cosmétiques</SelectItem>
                      <SelectItem value="Textile">Textile</SelectItem>
                      <SelectItem value="Technologies">Technologies</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Toutes les régions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les régions</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="ZLECAf">ZLECAf</SelectItem>
                      <SelectItem value="Asie">Asie</SelectItem>
                      <SelectItem value="Moyen-Orient">Moyen-Orient</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle opportunité
                  </Button>
                </div>

                {loadingOpportunities ? (
                  <p>Chargement...</p>
                ) : opportunities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune opportunité trouvée
                  </p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {opportunities.map((opportunity) => (
                      <OpportunityCard
                        key={opportunity.id}
                        opportunity={opportunity}
                        onApply={handleApply}
                        showApplications={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="markets" className="space-y-6">
                <div className="flex justify-between items-center">
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Toutes les régions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les régions</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="Afrique">Afrique</SelectItem>
                      <SelectItem value="ZLECAf">ZLECAf</SelectItem>
                      <SelectItem value="Asie">Asie</SelectItem>
                      <SelectItem value="Moyen-Orient">Moyen-Orient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loadingMarkets ? (
                  <p>Chargement...</p>
                ) : markets.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun marché trouvé
                  </p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {markets.map((market) => (
                      <MarketCard
                        key={market.id}
                        market={market}
                        onExplore={(id) => console.log("Explore", id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="connections" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Mises en Relation
                    </h3>
                    <p className="text-3xl font-bold">{totalConnections}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Taux de Conversion
                    </h3>
                    <p className="text-3xl font-bold text-green-600">{conversionRate}%</p>
                    <p className="text-sm text-muted-foreground">Contrats signés</p>
                  </div>
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Valeur Générée
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {(totalValue / 1000000).toFixed(1)} M€
                    </p>
                    <p className="text-sm text-muted-foreground">Contrats totaux</p>
                  </div>
                </div>

                {loadingConnections ? (
                  <p>Chargement...</p>
                ) : (
                  <ConnectionsTable connections={connections} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <OpportunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        opportunity={selectedOpportunity}
        onClose={handleCloseDialog}
      />

      {selectedOpportunityForApplication && (
        <ApplicationDialog
          open={applicationDialogOpen}
          onOpenChange={setApplicationDialogOpen}
          opportunityId={selectedOpportunityForApplication.id}
          opportunityTitle={selectedOpportunityForApplication.title}
          onClose={handleCloseApplicationDialog}
        />
      )}
    </div>
  );
}
