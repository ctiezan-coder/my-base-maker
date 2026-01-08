import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Building2, Users, Calendar, Briefcase, Target, TrendingUp, Globe, Handshake, FileText, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface KpiCardProps {
  title: string;
  value: number | string;
  target?: number;
  unit?: string;
  icon: React.ReactNode;
  description?: string;
  trend?: number;
}

function KpiCard({ title, value, target, unit, icon, description, trend }: KpiCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const progress = target ? Math.min((numericValue / target) * 100, 100) : null;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {target && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Objectif: {target.toLocaleString('fr-FR')} {unit}</span>
              <span>{progress?.toFixed(0)}%</span>
            </div>
            <Progress value={progress || 0} className="h-2" />
          </div>
        )}
        {trend !== undefined && (
          <div className={`flex items-center text-xs mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {trend >= 0 ? '+' : ''}{trend}% vs période précédente
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Kpis() {
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("year");

  const { data: directions } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directions")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch companies count
  const { data: companiesData } = useQuery({
    queryKey: ["kpi-companies", directionFilter],
    queryFn: async () => {
      let query = supabase.from("companies").select("id, accompaniment_status, export_turnover", { count: 'exact' });
      if (directionFilter !== "all") {
        query = query.eq("direction_id", directionFilter);
      }
      const { data, count, error } = await query;
      if (error) throw error;
      
      const activeAccompaniment = data?.filter(c => c.accompaniment_status === 'en cours').length || 0;
      const totalExportTurnover = data?.reduce((sum, c) => sum + (c.export_turnover || 0), 0) || 0;
      
      return { total: count || 0, activeAccompaniment, totalExportTurnover };
    },
  });

  // Fetch projects stats
  const { data: projectsData } = useQuery({
    queryKey: ["kpi-projects", directionFilter],
    queryFn: async () => {
      let query = supabase.from("projects").select("id, status, budget, progress_percentage");
      if (directionFilter !== "all") {
        query = query.eq("direction_id", directionFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      const total = data?.length || 0;
      const inProgress = data?.filter(p => p.status === 'en cours').length || 0;
      const completed = data?.filter(p => p.status === 'terminé').length || 0;
      const totalBudget = data?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
      const avgProgress = total > 0 ? data?.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / total : 0;
      
      return { total, inProgress, completed, totalBudget, avgProgress };
    },
  });

  // Fetch events stats
  const { data: eventsData } = useQuery({
    queryKey: ["kpi-events", directionFilter],
    queryFn: async () => {
      let query = supabase.from("events").select("id, status, total_participants_actual, budget_estimated");
      if (directionFilter !== "all") {
        query = query.eq("direction_id", directionFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      const total = data?.length || 0;
      const upcoming = data?.filter(e => e.status === 'planifié' || e.status === 'confirmé').length || 0;
      const totalParticipants = data?.reduce((sum, e) => sum + (e.total_participants_actual || 0), 0) || 0;
      const totalBudget = data?.reduce((sum, e) => sum + (e.budget_estimated || 0), 0) || 0;
      
      return { total, upcoming, totalParticipants, totalBudget };
    },
  });

  // Fetch partnerships stats
  const { data: partnershipsData } = useQuery({
    queryKey: ["kpi-partnerships", directionFilter],
    queryFn: async () => {
      let query = supabase.from("partnerships").select("id, status, budget, lifecycle_stage");
      if (directionFilter !== "all") {
        query = query.eq("direction_id", directionFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      const total = data?.length || 0;
      const active = data?.filter(p => p.status === 'actif' || p.status === 'signé').length || 0;
      const totalBudget = data?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
      
      return { total, active, totalBudget };
    },
  });

  // Fetch trainings stats
  const { data: trainingsData } = useQuery({
    queryKey: ["kpi-trainings", directionFilter],
    queryFn: async () => {
      let query = supabase.from("trainings").select("id, training_type");
      if (directionFilter !== "all") {
        query = query.eq("direction_id", directionFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      const total = data?.length || 0;
      
      return { total, completed: 0, totalParticipants: 0 };
    },
  });

  // Fetch business connections stats
  const { data: connectionsData } = useQuery({
    queryKey: ["kpi-connections", directionFilter],
    queryFn: async () => {
      let query = supabase.from("business_connections").select("id, status, contract_value, jobs_created");
      if (directionFilter !== "all") {
        query = query.eq("direction_id", directionFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      const total = data?.length || 0;
      const signed = data?.filter(c => c.status === 'Contrat signé' || c.status === 'Terminé').length || 0;
      const totalContractValue = data?.reduce((sum, c) => sum + (c.contract_value || 0), 0) || 0;
      const totalJobsCreated = data?.reduce((sum, c) => sum + (c.jobs_created || 0), 0) || 0;
      
      return { total, signed, totalContractValue, totalJobsCreated };
    },
  });

  // Fetch export opportunities stats
  const { data: opportunitiesData } = useQuery({
    queryKey: ["kpi-opportunities", directionFilter],
    queryFn: async () => {
      const { data, error } = await supabase.from("export_opportunities").select("id, status, estimated_value");
      if (error) throw error;
      
      const total = data?.length || 0;
      const active = data?.filter(o => o.status === 'EN_COURS' || o.status === 'NOUVEAU').length || 0;
      const totalEstimatedValue = data?.reduce((sum, o) => sum + (o.estimated_value || 0), 0) || 0;
      
      return { total, active, totalEstimatedValue };
    },
  });

  // Fetch budgets stats
  const { data: budgetsData } = useQuery({
    queryKey: ["kpi-budgets", directionFilter],
    queryFn: async () => {
      let query = supabase.from("budgets").select("id, allocated_amount, consumed_amount, remaining_amount");
      if (directionFilter !== "all") {
        query = query.eq("direction_id", directionFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      const totalAllocated = data?.reduce((sum, b) => sum + (b.allocated_amount || 0), 0) || 0;
      const totalConsumed = data?.reduce((sum, b) => sum + (b.consumed_amount || 0), 0) || 0;
      const executionRate = totalAllocated > 0 ? (totalConsumed / totalAllocated) * 100 : 0;
      
      return { totalAllocated, totalConsumed, executionRate };
    },
  });

  // Fetch missions stats
  const { data: missionsData } = useQuery({
    queryKey: ["kpi-missions", directionFilter],
    queryFn: async () => {
      let query = supabase.from("mission_orders").select("id, status, estimated_budget");
      if (directionFilter !== "all") {
        query = query.eq("direction_id", directionFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      const total = data?.length || 0;
      const completed = data?.filter(m => m.status === 'Terminée').length || 0;
      const totalCost = data?.reduce((sum, m) => sum + (m.estimated_budget || 0), 0) || 0;
      
      return { total, completed, totalCost };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Tableau de Bord KPIs
          </h1>
          <p className="text-muted-foreground mt-1">
            Indicateurs de performance calculés à partir des données de l'application
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>
          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Toutes les directions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les directions</SelectItem>
              {directions?.map((direction) => (
                <SelectItem key={direction.id} value={direction.id}>
                  {direction.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Entreprises */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Entreprises & Accompagnement
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Entreprises enregistrées"
            value={companiesData?.total || 0}
            icon={<Building2 className="w-4 h-4" />}
            description="Total des entreprises dans la base"
          />
          <KpiCard
            title="Accompagnements actifs"
            value={companiesData?.activeAccompaniment || 0}
            icon={<Users className="w-4 h-4" />}
            description="Entreprises en cours d'accompagnement"
          />
          <KpiCard
            title="CA Export total"
            value={companiesData?.totalExportTurnover || 0}
            unit="FCFA"
            icon={<Globe className="w-4 h-4" />}
            description="Chiffre d'affaires export cumulé"
          />
          <KpiCard
            title="Taux d'accompagnement"
            value={companiesData?.total ? ((companiesData?.activeAccompaniment / companiesData?.total) * 100).toFixed(1) : 0}
            unit="%"
            icon={<Target className="w-4 h-4" />}
            description="% d'entreprises accompagnées"
          />
        </div>
      </div>

      {/* Projets */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Projets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total projets"
            value={projectsData?.total || 0}
            icon={<Briefcase className="w-4 h-4" />}
            description="Nombre total de projets"
          />
          <KpiCard
            title="Projets en cours"
            value={projectsData?.inProgress || 0}
            icon={<TrendingUp className="w-4 h-4" />}
            description="Projets actuellement actifs"
          />
          <KpiCard
            title="Projets terminés"
            value={projectsData?.completed || 0}
            icon={<Target className="w-4 h-4" />}
            description="Projets complétés"
          />
          <KpiCard
            title="Budget projets"
            value={projectsData?.totalBudget || 0}
            unit="FCFA"
            icon={<DollarSign className="w-4 h-4" />}
            description="Budget total alloué aux projets"
          />
        </div>
      </div>

      {/* Événements */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Événements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total événements"
            value={eventsData?.total || 0}
            icon={<Calendar className="w-4 h-4" />}
            description="Nombre total d'événements"
          />
          <KpiCard
            title="Événements à venir"
            value={eventsData?.upcoming || 0}
            icon={<Calendar className="w-4 h-4" />}
            description="Événements planifiés/confirmés"
          />
          <KpiCard
            title="Participants totaux"
            value={eventsData?.totalParticipants || 0}
            icon={<Users className="w-4 h-4" />}
            description="Nombre total de participants"
          />
          <KpiCard
            title="Budget événements"
            value={eventsData?.totalBudget || 0}
            unit="FCFA"
            icon={<DollarSign className="w-4 h-4" />}
            description="Budget total des événements"
          />
        </div>
      </div>

      {/* Partenariats */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Handshake className="w-5 h-5" />
          Partenariats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total partenariats"
            value={partnershipsData?.total || 0}
            icon={<Handshake className="w-4 h-4" />}
            description="Nombre total de partenariats"
          />
          <KpiCard
            title="Partenariats actifs"
            value={partnershipsData?.active || 0}
            icon={<TrendingUp className="w-4 h-4" />}
            description="Partenariats actifs/signés"
          />
          <KpiCard
            title="Budget partenariats"
            value={partnershipsData?.totalBudget || 0}
            unit="FCFA"
            icon={<DollarSign className="w-4 h-4" />}
            description="Budget total des partenariats"
          />
          <KpiCard
            title="Taux d'activation"
            value={partnershipsData?.total ? ((partnershipsData?.active / partnershipsData?.total) * 100).toFixed(1) : 0}
            unit="%"
            icon={<Target className="w-4 h-4" />}
            description="% de partenariats actifs"
          />
        </div>
      </div>

      {/* Mises en relation commerciales */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Mises en Relation Commerciales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total connexions"
            value={connectionsData?.total || 0}
            icon={<Globe className="w-4 h-4" />}
            description="Nombre de mises en relation"
          />
          <KpiCard
            title="Contrats signés"
            value={connectionsData?.signed || 0}
            icon={<FileText className="w-4 h-4" />}
            description="Connexions converties en contrats"
          />
          <KpiCard
            title="Valeur contrats"
            value={connectionsData?.totalContractValue || 0}
            unit="FCFA"
            icon={<DollarSign className="w-4 h-4" />}
            description="Valeur totale des contrats"
          />
          <KpiCard
            title="Emplois créés"
            value={connectionsData?.totalJobsCreated || 0}
            icon={<Users className="w-4 h-4" />}
            description="Impact emploi direct"
          />
        </div>
      </div>

      {/* Opportunités export */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Opportunités Export
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Opportunités identifiées"
            value={opportunitiesData?.total || 0}
            icon={<Target className="w-4 h-4" />}
            description="Total des opportunités"
          />
          <KpiCard
            title="Opportunités actives"
            value={opportunitiesData?.active || 0}
            icon={<TrendingUp className="w-4 h-4" />}
            description="Opportunités en cours"
          />
          <KpiCard
            title="Valeur estimée"
            value={opportunitiesData?.totalEstimatedValue || 0}
            unit="FCFA"
            icon={<DollarSign className="w-4 h-4" />}
            description="Potentiel commercial estimé"
          />
        </div>
      </div>

      {/* Formations */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Formations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Total formations"
            value={trainingsData?.total || 0}
            icon={<Users className="w-4 h-4" />}
            description="Nombre de formations"
          />
          <KpiCard
            title="Formations terminées"
            value={trainingsData?.completed || 0}
            icon={<Target className="w-4 h-4" />}
            description="Formations complétées"
          />
          <KpiCard
            title="Personnes formées"
            value={trainingsData?.totalParticipants || 0}
            icon={<Users className="w-4 h-4" />}
            description="Total des participants"
          />
        </div>
      </div>

      {/* Budgets */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Exécution Budgétaire
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Budget alloué"
            value={budgetsData?.totalAllocated || 0}
            unit="FCFA"
            icon={<DollarSign className="w-4 h-4" />}
            description="Total des allocations"
          />
          <KpiCard
            title="Budget consommé"
            value={budgetsData?.totalConsumed || 0}
            unit="FCFA"
            icon={<DollarSign className="w-4 h-4" />}
            description="Dépenses réalisées"
          />
          <KpiCard
            title="Taux d'exécution"
            value={(budgetsData?.executionRate || 0).toFixed(1)}
            unit="%"
            target={100}
            icon={<Target className="w-4 h-4" />}
            description="Progression de l'exécution"
          />
        </div>
      </div>

      {/* Missions */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Missions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Total missions"
            value={missionsData?.total || 0}
            icon={<Briefcase className="w-4 h-4" />}
            description="Nombre d'ordres de mission"
          />
          <KpiCard
            title="Missions terminées"
            value={missionsData?.completed || 0}
            icon={<Target className="w-4 h-4" />}
            description="Missions complétées"
          />
          <KpiCard
            title="Coût total missions"
            value={missionsData?.totalCost || 0}
            unit="FCFA"
            icon={<DollarSign className="w-4 h-4" />}
            description="Coût estimé total"
          />
        </div>
      </div>
    </div>
  );
}
