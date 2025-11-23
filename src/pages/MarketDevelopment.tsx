import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCanAccessModule } from "@/hooks/useCanAccessModule";
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
import { SendToOperatorsDialog } from "@/components/market/SendToOperatorsDialog";
import { WebMarketSearch } from "@/components/market/WebMarketSearch";
import { MarketDataRefresh } from "@/components/market/MarketDataRefresh";
import { OpportunitiesMap } from "@/components/market/OpportunitiesMap";
import { ExportOpportunity, PotentialMarket, BusinessConnection, MarketRegion } from "@/types/market-development";

export default function MarketDevelopment() {
  const { toast } = useToast();
  const { canAccess: canManageMarket } = useCanAccessModule("market_development", "manager");
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("edit");
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [sendToOperatorsDialogOpen, setSendToOperatorsDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ExportOpportunity | undefined>();
  const [selectedOpportunityForApplication, setSelectedOpportunityForApplication] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [selectedOpportunityForOperators, setSelectedOpportunityForOperators] = useState<{
    id: string;
    title: string;
    sector: string;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch opportunities (excluding closed ones)
  const { data: opportunities = [], isLoading: loadingOpportunities, refetch: refetchOpportunities } = useQuery({
    queryKey: ["export-opportunities", searchTerm, sectorFilter, regionFilter],
    queryFn: async () => {
      let query = supabase
        .from("export_opportunities")
        .select("*")
        .neq("status", "FERMÉ")
        .order("deadline", { ascending: true });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      if (sectorFilter !== "all") {
        query = query.ilike("sector", sectorFilter);
      }
      if (regionFilter !== "all") {
        query = query.eq("region", regionFilter as MarketRegion);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ExportOpportunity[];
    },
  });

  // Fetch available sectors from opportunities
  const { data: availableOpportunitySectors = [] } = useQuery({
    queryKey: ["unique-opportunity-sectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("export_opportunities")
        .select("sector")
        .not("sector", "is", null);
      
      if (error) throw error;
      
      const uniqueSectors = Array.from(
        new Set(data.map(o => o.sector).filter(Boolean))
      ).sort();
      
      return uniqueSectors;
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

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOpportunity(undefined);
    refetchOpportunities();
  };

  const handleEdit = (opportunity: ExportOpportunity) => {
    setSelectedOpportunity(opportunity);
    setDialogMode("edit");
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

  const handleSendToOperators = (opportunityId: string, title: string, sector: string) => {
    setSelectedOpportunityForOperators({
      id: opportunityId,
      title,
      sector,
    });
    setSendToOperatorsDialogOpen(true);
  };

  const handleCloseSendToOperatorsDialog = () => {
    setSendToOperatorsDialogOpen(false);
    setSelectedOpportunityForOperators(null);
  };

  const handleUpdateMarketData = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('update-market-data');
      
      if (error) throw error;

      toast({
        title: "Mise à jour réussie",
        description: "Les données de marché ont été actualisées avec succès",
      });

      // Rafraîchir les données
      refetchOpportunities();
    } catch (error) {
      console.error('Error updating market data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les données de marché",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Développement des Marchés Export</h1>
          <p className="text-muted-foreground mt-2">
            Accompagnement des PME à l'international • Mise à jour automatique 24h/24
          </p>
        </div>
        <Button
          onClick={handleUpdateMarketData}
          disabled={isUpdating || !canManageMarket}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Mise à jour...' : 'Actualiser les données'}
        </Button>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
          <TabsTrigger value="markets">Marchés Potentiels</TabsTrigger>
          <TabsTrigger value="connections">Mises en Relation</TabsTrigger>
          <TabsTrigger value="web-search">Recherche Web</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-6">
          <OpportunitiesMap 
            opportunities={opportunities}
            canManage={canManageMarket}
            onOpportunityClick={(opportunity) => {
              setSelectedOpportunity(opportunity);
              setDialogMode("view");
              setDialogOpen(true);
            }}
          />
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
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          {loadingConnections ? (
            <p>Chargement...</p>
          ) : (
            <ConnectionsTable connections={connections} />
          )}
        </TabsContent>

        <TabsContent value="web-search" className="space-y-6">
          <WebMarketSearch />
        </TabsContent>
      </Tabs>

      <OpportunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        opportunity={selectedOpportunity}
        onClose={handleCloseDialog}
        mode={dialogMode}
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

      {selectedOpportunityForOperators && (
        <SendToOperatorsDialog
          open={sendToOperatorsDialogOpen}
          onOpenChange={setSendToOperatorsDialogOpen}
          opportunityId={selectedOpportunityForOperators.id}
          opportunityTitle={selectedOpportunityForOperators.title}
          opportunitySector={selectedOpportunityForOperators.sector}
        />
      )}
    </div>
  );
}
