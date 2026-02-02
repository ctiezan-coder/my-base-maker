import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FolderKanban, FileText, GraduationCap, Calendar, Handshake, BarChart3, TrendingUp, Users, Target, Activity, Globe, ArrowRight, Sparkles, LineChart, Award, Briefcase, MapPin, Package, DollarSign, UserCheck } from "lucide-react";
import logo from "@/assets/ci-export-logo.png";
import { MonthlyActivityChart, SectorDistributionChart, OpportunitiesChart, ConnectionsEvolutionChart } from "@/components/dashboard/DashboardCharts";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check user profile and account status
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch dashboard stats with new operator data
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [companies, projects, trainings, events, partnerships, documents, media, activeProjectsData, opportunities, connections] = await Promise.all([
        supabase.from("companies").select("id, accompaniment_status, export_maturity_level, certifications, activity_sector", { count: "exact" }),
        supabase.from("projects").select("id, name"),
        supabase.from("trainings").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("partnerships").select("id", { count: "exact", head: true }),
        supabase.from("documents").select("id", { count: "exact", head: true }),
        supabase.from("media_content").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id, name").eq("status", "en cours"),
        supabase.from("export_opportunities").select("id, estimated_value", { count: "exact" }),
        supabase.from("business_connections").select("id, contract_value, status"),
      ]);

      // Filtrer les vrais projets (exclure ceux préfixés "Événement:" ou "Formation:")
      const realProjects = projects.data?.filter(p => 
        !p.name.startsWith("Événement:") && !p.name.startsWith("Formation:")
      ) || [];
      
      const realActiveProjects = activeProjectsData.data?.filter(p => 
        !p.name.startsWith("Événement:") && !p.name.startsWith("Formation:")
      ) || [];

      // Operator stats
      const companiesData = companies.data || [];
      const activeAccompaniment = companiesData.filter(c => c.accompaniment_status === 'en_cours').length;
      const certifiedCompanies = companiesData.filter(c => c.certifications && c.certifications.length > 0).length;
      
      // Maturity levels
      const maturityLevels = {
        debutant: companiesData.filter(c => c.export_maturity_level === 'debutant').length,
        intermediaire: companiesData.filter(c => c.export_maturity_level === 'intermediaire').length,
        confirme: companiesData.filter(c => c.export_maturity_level === 'confirme').length,
        expert: companiesData.filter(c => c.export_maturity_level === 'expert').length,
      };

      // Sectors distribution
      const sectorCounts: Record<string, number> = {};
      companiesData.forEach(c => {
        if (c.activity_sector) {
          sectorCounts[c.activity_sector] = (sectorCounts[c.activity_sector] || 0) + 1;
        }
      });
      const topSectors = Object.entries(sectorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Connections stats
      const connectionsData = connections.data || [];
      const successfulConnections = connectionsData.filter(c => c.status === 'Contrat signé').length;
      const totalContractValue = connectionsData.reduce((sum, c) => sum + (c.contract_value || 0), 0);

      // Opportunities stats
      const opportunitiesData = opportunities.data || [];
      const totalOpportunityValue = opportunitiesData.reduce((sum, o) => sum + (o.estimated_value || 0), 0);

      return {
        companies: companies.count || companiesData.length,
        projects: realProjects.length,
        trainings: trainings.count || 0,
        events: events.count || 0,
        partnerships: partnerships.count || 0,
        documents: documents.count || 0,
        media: media.count || 0,
        activeProjects: realActiveProjects.length,
        opportunities: opportunities.count || opportunitiesData.length,
        connections: connectionsData.length,
        // New stats
        activeAccompaniment,
        certifiedCompanies,
        maturityLevels,
        topSectors,
        successfulConnections,
        totalContractValue,
        totalOpportunityValue,
      };
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !profileLoading) {
      if (!user) {
        navigate('/auth');
      } else if (profile && profile.account_status !== 'approved') {
        navigate('/pending-approval');
      }
    }
  }, [user, loading, profile, profileLoading, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin border-t-primary mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-muted-foreground font-medium">{t('common.loadingSpace')}</p>
        </div>
      </div>
    );
  }

  if (!user || profileError) {
    return null;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} Mds`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)} M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)} K`;
    return value.toString();
  };

  const keyMetrics = [
    {
      title: t('index.operatorsSupported'),
      value: stats?.companies || 0,
      icon: Building2,
      gradient: "from-secondary to-secondary/70",
      subtitle: `${stats?.activeAccompaniment || 0} ${t('index.inProgress')}`,
    },
    {
      title: t('index.activeProjects'),
      value: stats?.activeProjects || 0,
      icon: Target,
      gradient: "from-accent to-accent/70",
      subtitle: `${t('index.outOf')} ${stats?.projects || 0} ${t('index.projects')}`,
    },
    {
      title: t('index.b2bConnections'),
      value: stats?.connections || 0,
      icon: Handshake,
      gradient: "from-primary to-primary/70",
      subtitle: `${stats?.successfulConnections || 0} ${t('index.concluded')}`,
    },
    {
      title: t('index.partnerships'),
      value: stats?.partnerships || 0,
      icon: Users,
      gradient: "from-primary via-accent to-secondary",
      subtitle: t('index.activeRelations'),
    },
  ];

  const operatorMetrics = [
    {
      title: t('index.certifiedCompanies'),
      value: stats?.certifiedCompanies || 0,
      icon: Award,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: t('index.activeAccompaniment'),
      value: stats?.activeAccompaniment || 0,
      icon: UserCheck,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: t('index.exportOpportunities'),
      value: stats?.opportunities || 0,
      icon: Globe,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  const maturityData = [
    { level: t('index.beginner'), count: stats?.maturityLevels?.debutant || 0, color: "bg-muted-foreground" },
    { level: t('index.intermediate'), count: stats?.maturityLevels?.intermediaire || 0, color: "bg-accent" },
    { level: t('index.confirmed'), count: stats?.maturityLevels?.confirme || 0, color: "bg-primary" },
    { level: t('index.expert'), count: stats?.maturityLevels?.expert || 0, color: "bg-secondary" },
  ];
  const totalMaturity = maturityData.reduce((sum, m) => sum + m.count, 0);

  const modules = [
    {
      title: t('index.economicOperators'),
      description: t('index.companiesFullView'),
      icon: Building2,
      path: "/companies",
      count: stats?.companies,
      gradient: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
      borderColor: "border-secondary/30",
    },
    {
      title: t('sidebar.projects'),
      description: t('index.projectsManagement'),
      icon: FolderKanban,
      path: "/projects",
      count: stats?.projects,
      gradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent",
      borderColor: "border-accent/30",
    },
    {
      title: t('index.marketDevelopment'),
      description: t('index.exportOpportunitiesB2B'),
      icon: Globe,
      path: "/market-development",
      count: stats?.opportunities,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
      borderColor: "border-primary/30",
    },
    {
      title: t('index.trainings'),
      description: t('index.capacityBuilding'),
      icon: GraduationCap,
      path: "/trainings",
      count: stats?.trainings,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
      borderColor: "border-primary/30",
    },
    {
      title: t('index.events'),
      description: t('index.tradeFairsMissions'),
      icon: Calendar,
      path: "/events",
      count: stats?.events,
      gradient: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
      borderColor: "border-secondary/30",
    },
    {
      title: t('index.partnerships'),
      description: t('index.strategicRelations'),
      icon: Handshake,
      path: "/partnerships",
      count: stats?.partnerships,
      gradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent",
      borderColor: "border-accent/30",
    },
    {
      title: t('index.monitoringEvaluation'),
      description: t('index.kpisPerformance'),
      icon: BarChart3,
      path: "/suivi-evaluation",
      gradient: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
      borderColor: "border-secondary/30",
    },
    {
      title: t('index.documents'),
      description: t('index.centralizedGed'),
      icon: FileText,
      path: "/documents",
      count: stats?.documents,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
      borderColor: "border-primary/30",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full px-4 py-4 relative z-10">
        {/* Hero Section Compact */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative bg-card p-3 rounded-xl border border-primary/10 shadow-md">
              <img src={logo} alt="CÔTE D'IVOIRE EXPORT" className="h-12 w-auto" />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                {t('index.title')}
              </span>
            </h1>
            <p className="text-base text-muted-foreground">
              {t('index.subtitle')}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {keyMetrics.map((metric, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.gradient}`} />
              
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1 group-hover:scale-105 transition-transform duration-300">
                  {metric.value}
                </div>
                <p className="text-sm text-muted-foreground font-medium">{metric.title}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{metric.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Operator Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Operator Quick Stats */}
          <Card className="col-span-1 lg:col-span-2 border-primary/10 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl">{t('index.operatorView')}</span>
                  <CardDescription className="mt-1">{t('index.performanceAccompaniment')}</CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {operatorMetrics.map((item, index) => (
                  <div key={index} className={`text-center p-4 rounded-xl ${item.bgColor} border border-transparent hover:border-primary/20 transition-colors duration-300`}>
                    <item.icon className={`w-6 h-6 ${item.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-foreground mb-1">{item.value}</div>
                    <p className="text-xs text-muted-foreground font-medium">{item.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Maturity Level Distribution */}
          <Card className="border-secondary/10 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-accent" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg">{t('index.exportMaturity')}</span>
                  <CardDescription className="mt-1">{t('index.levelDistribution')}</CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {maturityData.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.level}</span>
                    <span className="font-medium text-foreground">{item.count}</span>
                  </div>
                  <Progress 
                    value={totalMaturity > 0 ? (item.count / totalMaturity) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Top Sectors */}
        {stats?.topSectors && stats.topSectors.length > 0 && (
          <Card className="mb-8 border-accent/10 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl">{t('index.activitySectors')}</span>
                  <CardDescription className="mt-1">{t('index.topSectors')}</CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.topSectors.map(([sector, count], index) => (
                  <div key={index} className="text-center p-4 rounded-xl bg-accent/5 border border-accent/10 hover:border-accent/30 transition-colors duration-300">
                    <div className="text-2xl font-bold text-foreground mb-1">{count}</div>
                    <p className="text-xs text-muted-foreground font-medium line-clamp-2">{sector}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Summary */}
        <Card className="mb-8 border-primary/10 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl">{t('index.activitySummary')}</span>
                <CardDescription className="mt-1">{t('index.resourcesOverview')}</CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t('index.trainings'), value: stats?.trainings || 0, icon: GraduationCap, color: "primary" },
                { label: t('index.events'), value: stats?.events || 0, icon: Calendar, color: "secondary" },
                { label: t('index.partnerships'), value: stats?.partnerships || 0, icon: Handshake, color: "accent" },
                { label: t('index.documents'), value: stats?.documents || 0, icon: FileText, color: "primary" },
              ].map((item, index) => (
                <div key={index} className={`text-center p-4 rounded-xl bg-${item.color}/5 border border-${item.color}/10 hover:border-${item.color}/30 transition-colors duration-300`}>
                  <item.icon className={`w-6 h-6 text-${item.color} mx-auto mb-2`} />
                  <div className="text-3xl font-bold text-foreground mb-1">{item.value}</div>
                  <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section Analytics */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LineChart className="w-6 h-6 text-accent" />
            {t('index.analytics')}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyActivityChart />
            <SectorDistributionChart />
            <OpportunitiesChart />
            <ConnectionsEvolutionChart />
          </div>
        </div>

        {/* Modules Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {t('index.modules')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((module, index) => (
              <Card
                key={index}
                className={`cursor-pointer group relative overflow-hidden border ${module.borderColor} bg-gradient-to-br ${module.gradient} backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                onClick={() => navigate(module.path)}
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl bg-card border ${module.borderColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <module.icon className={`w-6 h-6 ${module.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {module.title}
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                {module.count !== undefined && (
                  <CardContent className="pt-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">{module.count}</span>
                      <span className="text-xs text-muted-foreground">{t('index.elements')}</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
