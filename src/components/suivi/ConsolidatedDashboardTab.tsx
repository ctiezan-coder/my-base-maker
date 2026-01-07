import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, Users, Briefcase, Calendar, TrendingUp, DollarSign,
  Target, FileText, Building, Handshake, GraduationCap
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function ConsolidatedDashboardTab() {
  // Fetch KPIs
  const { data: kpis = [] } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const { data, error } = await supabase.from("kpi_tracking").select("*").order("period", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Fetch Projects
  const { data: projects = [] } = useQuery({
    queryKey: ["dashboard-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch Companies
  const { data: companies = [] } = useQuery({
    queryKey: ["dashboard-companies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("id, activity_sector, accompaniment_status, annual_turnover");
      if (error) throw error;
      return data;
    },
  });

  // Fetch Trainings
  const { data: trainings = [] } = useQuery({
    queryKey: ["dashboard-trainings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trainings").select("id, status, participants_count");
      if (error) throw error;
      return data;
    },
  });

  // Fetch Events
  const { data: events = [] } = useQuery({
    queryKey: ["dashboard-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("id, event_type, start_date");
      if (error) throw error;
      return data;
    },
  });

  // Fetch Partnerships
  const { data: partnerships = [] } = useQuery({
    queryKey: ["dashboard-partnerships"],
    queryFn: async () => {
      const { data, error } = await supabase.from("partnerships").select("id, status, partnership_type");
      if (error) throw error;
      return data;
    },
  });

  // Fetch Opportunities
  const { data: opportunities = [] } = useQuery({
    queryKey: ["dashboard-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("export_opportunities").select("id, status, estimated_value, sector");
      if (error) throw error;
      return data;
    },
  });

  // Fetch Budgets
  const { data: budgets = [] } = useQuery({
    queryKey: ["dashboard-budgets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("budgets").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Calculate project stats
  const projectStats = {
    total: projects.length,
    inProgress: projects.filter((p: any) => p.status === "in_progress").length,
    completed: projects.filter((p: any) => p.status === "completed").length,
    delayed: projects.filter((p: any) => p.status === "delayed").length,
    avgProgress: projects.length > 0 ? Math.round(projects.reduce((acc: number, p: any) => acc + (p.progress || 0), 0) / projects.length) : 0,
  };

  // Calculate budget stats
  const budgetStats = {
    totalAllocated: budgets.reduce((acc: number, b: any) => acc + (b.allocated_amount || 0), 0),
    totalConsumed: budgets.reduce((acc: number, b: any) => acc + (b.consumed_amount || 0), 0),
    consumptionRate: budgets.reduce((acc: number, b: any) => acc + (b.allocated_amount || 0), 0) > 0
      ? Math.round((budgets.reduce((acc: number, b: any) => acc + (b.consumed_amount || 0), 0) / budgets.reduce((acc: number, b: any) => acc + (b.allocated_amount || 0), 0)) * 100)
      : 0,
  };

  // Calculate opportunity stats
  const opportunityStats = {
    total: opportunities.length,
    active: opportunities.filter((o: any) => o.status === "active").length,
    shared: opportunities.filter((o: any) => o.status === "shared").length,
    concluded: opportunities.filter((o: any) => o.status === "concluded").length,
    totalValue: opportunities.reduce((acc: number, o: any) => acc + (o.estimated_value || 0), 0),
  };

  // Project status chart data
  const projectStatusData = [
    { name: "En cours", value: projectStats.inProgress, color: "#3b82f6" },
    { name: "Terminés", value: projectStats.completed, color: "#22c55e" },
    { name: "En retard", value: projectStats.delayed, color: "#ef4444" },
    { name: "Planifiés", value: projects.filter((p: any) => p.status === "planning").length, color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  // Opportunities by sector
  const opportunitiesBySector = Object.entries(
    opportunities.reduce((acc: Record<string, number>, o: any) => {
      acc[o.sector] = (acc[o.sector] || 0) + 1;
      return acc;
    }, {})
  ).map(([sector, count]) => ({ name: sector, value: count })).slice(0, 6);

  // Company by sector
  const companiesBySector = Object.entries(
    companies.reduce((acc: Record<string, number>, c: any) => {
      const sector = c.activity_sector || "Non défini";
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {})
  ).map(([sector, count]) => ({ name: sector, count })).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{companies.length}</p>
                <p className="text-xs text-muted-foreground">Entreprises</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-muted-foreground">Projets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{opportunities.length}</p>
                <p className="text-xs text-muted-foreground">Opportunités</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{trainings.length}</p>
                <p className="text-xs text-muted-foreground">Formations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pink-500" />
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-xs text-muted-foreground">Événements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-teal-500" />
              <div>
                <p className="text-2xl font-bold">{partnerships.length}</p>
                <p className="text-xs text-muted-foreground">Partenariats</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects and Budget Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Projects Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />Projets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value">
                      {projectStatusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avancement moyen</span>
                  <span className="font-bold">{projectStats.avgProgress}%</span>
                </div>
                <Progress value={projectStats.avgProgress} className="h-2" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>En cours: {projectStats.inProgress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Terminés: {projectStats.completed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>En retard: {projectStats.delayed}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />Budget Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground">Alloué</p>
                  <p className="text-2xl font-bold">{(budgetStats.totalAllocated / 1000000).toFixed(1)}M FCFA</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Consommé</p>
                  <p className="text-xl font-semibold text-orange-600">{(budgetStats.totalConsumed / 1000000).toFixed(1)}M FCFA</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Taux de consommation</span>
                  <span className="font-medium">{budgetStats.consumptionRate}%</span>
                </div>
                <Progress value={budgetStats.consumptionRate} className="h-3" />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Reste: {((budgetStats.totalAllocated - budgetStats.totalConsumed) / 1000000).toFixed(1)}M FCFA
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities and Companies Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />Opportunités Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xl font-bold text-blue-700">{opportunityStats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xl font-bold text-green-700">{opportunityStats.active}</p>
                  <p className="text-xs text-muted-foreground">Actives</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xl font-bold text-purple-700">{opportunityStats.shared}</p>
                  <p className="text-xs text-muted-foreground">Partagées</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xl font-bold text-orange-700">{opportunityStats.concluded}</p>
                  <p className="text-xs text-muted-foreground">Conclues</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Valeur totale estimée</p>
                <p className="text-xl font-bold">{(opportunityStats.totalValue / 1000000).toFixed(1)}M FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies by Sector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />Entreprises par Secteur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={companiesBySector} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />Indicateurs de Performance Récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {kpis.slice(0, 6).map((kpi: any) => {
              const progress = kpi.target_value ? Math.min(100, (kpi.kpi_value / kpi.target_value) * 100) : 0;
              const isAchieved = progress >= 100;
              return (
                <div key={kpi.id} className="border rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground line-clamp-1">{kpi.kpi_name}</p>
                  <p className="text-lg font-bold">{kpi.kpi_value?.toLocaleString('fr-FR')}</p>
                  {kpi.target_value && (
                    <div className="mt-1">
                      <Progress value={progress} className={`h-1 ${isAchieved ? "[&>div]:bg-green-500" : ""}`} />
                      <p className="text-xs text-muted-foreground mt-1">Cible: {kpi.target_value?.toLocaleString('fr-FR')}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
