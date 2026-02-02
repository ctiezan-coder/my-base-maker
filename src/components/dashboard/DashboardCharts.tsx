import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { TrendingUp, PieChartIcon, BarChart3, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

const COLORS = {
  primary: "hsl(152, 100%, 22%)",
  secondary: "hsl(32, 94%, 54%)",
  accent: "hsl(187, 100%, 42%)",
  muted: "hsl(150, 10%, 60%)",
};

export function MonthlyActivityChart() {
  const { t, i18n } = useTranslation();
  
  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ["monthly-activity", i18n.language],
    queryFn: async () => {
      const now = new Date();
      const months = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const startDate = date.toISOString().split('T')[0];
        const endDate = nextMonth.toISOString().split('T')[0];
        
        const [companies, trainings, events, projects] = await Promise.all([
          supabase.from("companies").select("id", { count: "exact", head: true })
            .gte("created_at", startDate).lt("created_at", endDate),
          supabase.from("trainings").select("id", { count: "exact", head: true })
            .gte("created_at", startDate).lt("created_at", endDate),
          supabase.from("events").select("id", { count: "exact", head: true })
            .gte("created_at", startDate).lt("created_at", endDate),
          supabase.from("projects").select("id", { count: "exact", head: true })
            .gte("created_at", startDate).lt("created_at", endDate),
        ]);
        
        const locale = i18n.language === 'en' ? 'en-US' : 'fr-FR';
        const monthName = date.toLocaleDateString(locale, { month: 'short' });
        
        months.push({
          name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          operateurs: companies.count || 0,
          formations: trainings.count || 0,
          projets: projects.count || 0,
        });
      }
      
      return months;
    },
  });

  if (isLoading) {
    return (
      <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {t('index.monthlyActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          {t('index.monthlyActivity')}
        </CardTitle>
        <CardDescription>{t('index.evolutionYearly')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorOperateurs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFormations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProjets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 40%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 40%)" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 100%)', 
                border: '1px solid hsl(150, 10%, 88%)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} 
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="operateurs" 
              name={t('index.operators')}
              stroke={COLORS.secondary} 
              fillOpacity={1} 
              fill="url(#colorOperateurs)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="formations" 
              name={t('index.trainingsLegend')}
              stroke={COLORS.primary} 
              fillOpacity={1} 
              fill="url(#colorFormations)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="projets" 
              name={t('index.projectsLegend')}
              stroke={COLORS.accent} 
              fillOpacity={1} 
              fill="url(#colorProjets)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SectorDistributionChart() {
  const { t } = useTranslation();
  
  const { data: sectorData, isLoading } = useQuery({
    queryKey: ["sector-distribution"],
    queryFn: async () => {
      const { data } = await supabase
        .from("companies")
        .select("activity_sector");
      
      if (!data) return [];
      
      const sectorCounts: Record<string, number> = {};
      data.forEach((company) => {
        const sector = company.activity_sector || t('index.undefined');
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
      });
      
      return Object.entries(sectorCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
    },
  });

  const pieColors = [COLORS.primary, COLORS.secondary, COLORS.accent, "#8884d8", "#82ca9d", "#ffc658"];

  if (isLoading) {
    return (
      <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-accent" />
            {t('index.sectorDistribution')}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent/20 rounded-full animate-spin border-t-accent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/10 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4 text-accent" />
          </div>
          {t('index.sectorDistribution')}
        </CardTitle>
        <CardDescription>{t('index.sectorSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={sectorData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={{ stroke: 'hsl(150, 10%, 60%)' }}
            >
              {sectorData?.map((_, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 100%)', 
                border: '1px solid hsl(150, 10%, 88%)',
                borderRadius: '8px'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function OpportunitiesChart() {
  const { t } = useTranslation();
  
  const { data: opportunityData, isLoading } = useQuery({
    queryKey: ["opportunities-by-region"],
    queryFn: async () => {
      const { data } = await supabase
        .from("export_opportunities")
        .select("region, estimated_value, status");
      
      if (!data) return [];
      
      const regionData: Record<string, { count: number; value: number }> = {};
      data.forEach((opp) => {
        if (!regionData[opp.region]) {
          regionData[opp.region] = { count: 0, value: 0 };
        }
        regionData[opp.region].count++;
        regionData[opp.region].value += opp.estimated_value || 0;
      });
      
      return Object.entries(regionData)
        .map(([region, data]) => ({
          region,
          opportunites: data.count,
          valeur: Math.round(data.value / 1000000),
        }))
        .sort((a, b) => b.opportunites - a.opportunites);
    },
  });

  if (isLoading) {
    return (
      <Card className="border-secondary/10 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-secondary" />
            {t('index.opportunitiesByRegion')}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-secondary/20 rounded-full animate-spin border-t-secondary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-secondary/10 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-accent" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-secondary" />
          </div>
          {t('index.opportunitiesByRegion')}
        </CardTitle>
        <CardDescription>{t('index.opportunitiesValue')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={opportunityData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(150, 10%, 40%)" />
            <YAxis dataKey="region" type="category" tick={{ fontSize: 11 }} width={100} stroke="hsl(150, 10%, 40%)" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 100%)', 
                border: '1px solid hsl(150, 10%, 88%)',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Bar dataKey="opportunites" name={t('index.opportunitiesLegend')} fill={COLORS.secondary} radius={[0, 4, 4, 0]} />
            <Bar dataKey="valeur" name={t('index.valueMFCFA')} fill={COLORS.accent} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ConnectionsEvolutionChart() {
  const { t, i18n } = useTranslation();
  
  const { data: connectionsData, isLoading } = useQuery({
    queryKey: ["connections-evolution", i18n.language],
    queryFn: async () => {
      const { data } = await supabase
        .from("business_connections")
        .select("connection_date, contract_value, status")
        .order("connection_date", { ascending: true });
      
      if (!data || data.length === 0) return [];
      
      const monthlyData: Record<string, { count: number; value: number; successful: number }> = {};
      
      data.forEach((conn) => {
        const date = new Date(conn.connection_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { count: 0, value: 0, successful: 0 };
        }
        monthlyData[monthKey].count++;
        monthlyData[monthKey].value += conn.contract_value || 0;
        if (conn.status === 'Contrat signé' || conn.status === 'Terminé') {
          monthlyData[monthKey].successful++;
        }
      });
      
      const locale = i18n.language === 'en' ? 'en-US' : 'fr-FR';
      
      return Object.entries(monthlyData)
        .map(([month, data]) => {
          const date = new Date(month + '-01');
          return {
            month: date.toLocaleDateString(locale, { month: 'short', year: '2-digit' }),
            connexions: data.count,
            reussies: data.successful,
            valeur: Math.round(data.value / 1000000),
          };
        })
        .slice(-8);
    },
  });

  if (isLoading) {
    return (
      <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t('index.connectionsEvolution')}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          {t('index.connectionsEvolution')}
        </CardTitle>
        <CardDescription>{t('index.connectionsSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={connectionsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(150, 10%, 40%)" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(150, 10%, 40%)" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 100%)', 
                border: '1px solid hsl(150, 10%, 88%)',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="connexions" 
              name={t('index.totalConnections')}
              stroke={COLORS.primary} 
              strokeWidth={3}
              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="reussies" 
              name={t('index.successfulConnections')}
              stroke={COLORS.secondary} 
              strokeWidth={3}
              dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}