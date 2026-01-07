import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { TrendingUp, Globe, Target, Users, Briefcase, DollarSign, BarChart3, PieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from "recharts";

interface ExportPerformanceTabProps {
  canManage: boolean;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

export function ExportPerformanceTab({ canManage }: ExportPerformanceTabProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  // Fetch opportunities stats
  const { data: opportunitiesStats } = useQuery({
    queryKey: ["export-opportunities-stats", selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;
      
      const { data, error } = await supabase
        .from("export_opportunities")
        .select("status, estimated_value, sector, region, destination_country")
        .gte("created_at", startDate)
        .lte("created_at", endDate);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch connections stats
  const { data: connectionsStats } = useQuery({
    queryKey: ["business-connections-stats", selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;
      
      const { data, error } = await supabase
        .from("business_connections")
        .select("status, contract_value, sector, destination_country")
        .gte("connection_date", startDate)
        .lte("connection_date", endDate);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch trade missions stats
  const { data: missionsStats } = useQuery({
    queryKey: ["trade-missions-stats", selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;
      
      const { data, error } = await supabase
        .from("trade_missions")
        .select("status, results_contacts, results_leads, results_contracts, results_value, destination_country")
        .gte("start_date", startDate)
        .lte("start_date", endDate);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch buyers stats
  const { data: buyersStats } = useQuery({
    queryKey: ["international-buyers-stats", selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;
      
      const { data, error } = await supabase
        .from("international_buyers")
        .select("status, country, sector")
        .gte("created_at", startDate)
        .lte("created_at", endDate);
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate KPIs
  const opportunities = opportunitiesStats || [];
  const connections = connectionsStats || [];
  const missions = missionsStats || [];
  const buyers = buyersStats || [];

  const kpis = {
    opportunitiesTotal: opportunities.length,
    opportunitiesInProgress: opportunities.filter(o => o.status === "EN_COURS").length,
    opportunitiesClosed: opportunities.filter(o => o.status === "FERMÉ").length,
    totalOpportunityValue: opportunities.reduce((sum, o) => sum + (o.estimated_value || 0), 0),
    
    connectionsTotal: connections.length,
    connectionsSuccessful: connections.filter(c => c.status === "Contrat signé").length,
    totalContractValue: connections.reduce((sum, c) => sum + (c.contract_value || 0), 0),
    conversionRate: connections.length > 0 
      ? ((connections.filter(c => c.status === "Contrat signé").length / connections.length) * 100).toFixed(1)
      : 0,
    
    missionsTotal: missions.length,
    missionContacts: missions.reduce((sum, m) => sum + (m.results_contacts || 0), 0),
    missionLeads: missions.reduce((sum, m) => sum + (m.results_leads || 0), 0),
    missionContracts: missions.reduce((sum, m) => sum + (m.results_contracts || 0), 0),
    missionValue: missions.reduce((sum, m) => sum + (m.results_value || 0), 0),
    
    buyersTotal: buyers.length,
    buyersActive: buyers.filter(b => b.status === "partenaire_actif").length,
  };

  // Prepare chart data
  const sectorData = opportunities.reduce((acc, o) => {
    if (o.sector) {
      acc[o.sector] = (acc[o.sector] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sectorChartData = Object.entries(sectorData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const regionData = opportunities.reduce((acc, o) => {
    if (o.region) {
      acc[o.region] = (acc[o.region] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const regionChartData = Object.entries(regionData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const topCountries = opportunities.reduce((acc, o) => {
    if (o.destination_country) {
      acc[o.destination_country] = (acc[o.destination_country] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCountriesData = Object.entries(topCountries)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Performance Export {selectedYear}</h2>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[currentYear, currentYear - 1, currentYear - 2].map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Opportunités</p>
                <p className="text-3xl font-bold">{kpis.opportunitiesTotal}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpis.opportunitiesInProgress} en cours
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connexions B2B</p>
                <p className="text-3xl font-bold">{kpis.connectionsTotal}</p>
                <p className="text-xs text-green-600 mt-1">
                  {kpis.connectionsSuccessful} réussies ({kpis.conversionRate}%)
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valeur contrats</p>
                <p className="text-3xl font-bold">
                  {(kpis.totalContractValue / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-muted-foreground mt-1">EUR</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acheteurs</p>
                <p className="text-3xl font-bold">{kpis.buyersTotal}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpis.buyersActive} actifs
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missions KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Résultats des missions commerciales
          </CardTitle>
          <CardDescription>{kpis.missionsTotal} missions réalisées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{kpis.missionContacts}</div>
              <p className="text-sm text-muted-foreground">Contacts B2B</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{kpis.missionLeads}</div>
              <p className="text-sm text-muted-foreground">Leads générés</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{kpis.missionContracts}</div>
              <p className="text-sm text-muted-foreground">Contrats signés</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg col-span-2">
              <div className="text-2xl font-bold">{kpis.missionValue.toLocaleString()} €</div>
              <p className="text-sm text-muted-foreground">Valeur des contrats</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top 10 Marchés cibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCountriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCountriesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" name="Opportunités" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucune donnée</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Répartition par région
            </CardTitle>
          </CardHeader>
          <CardContent>
            {regionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={regionChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {regionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucune donnée</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Secteurs les plus actifs</CardTitle>
          </CardHeader>
          <CardContent>
            {sectorChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectorChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" name="Opportunités" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucune donnée</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de conversion global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{kpis.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Connexions B2B → Contrats signés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valeur moyenne par contrat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {kpis.connectionsSuccessful > 0 
                ? Math.round(kpis.totalContractValue / kpis.connectionsSuccessful).toLocaleString() 
                : 0} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur {kpis.connectionsSuccessful} contrats signés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ROI Missions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {kpis.missionsTotal > 0 
                ? (kpis.missionContracts / kpis.missionsTotal).toFixed(1)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Contrats par mission en moyenne
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
