import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FolderKanban, FileText, GraduationCap, Calendar, Handshake, Image, BarChart3, TrendingUp, Users, Target, Activity, Globe, ArrowRight, Sparkles, LineChart } from "lucide-react";
import logo from "@/assets/ci-export-logo.png";
import { MonthlyActivityChart, SectorDistributionChart, OpportunitiesChart, ConnectionsEvolutionChart } from "@/components/dashboard/DashboardCharts";
const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [companies, projects, trainings, events, partnerships, documents, media, activeProjectsData, opportunities, connections] = await Promise.all([
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id, name"),
        supabase.from("trainings").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("partnerships").select("id", { count: "exact", head: true }),
        supabase.from("documents").select("id", { count: "exact", head: true }),
        supabase.from("media_content").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id, name").eq("status", "en cours"),
        supabase.from("export_opportunities").select("id", { count: "exact", head: true }),
        supabase.from("business_connections").select("id", { count: "exact", head: true }),
      ]);

      // Filtrer les vrais projets (exclure ceux préfixés "Événement:" ou "Formation:")
      const realProjects = projects.data?.filter(p => 
        !p.name.startsWith("Événement:") && !p.name.startsWith("Formation:")
      ) || [];
      
      const realActiveProjects = activeProjectsData.data?.filter(p => 
        !p.name.startsWith("Événement:") && !p.name.startsWith("Formation:")
      ) || [];

      return {
        companies: companies.count || 0,
        projects: realProjects.length,
        trainings: trainings.count || 0,
        events: events.count || 0,
        partnerships: partnerships.count || 0,
        documents: documents.count || 0,
        media: media.count || 0,
        activeProjects: realActiveProjects.length,
        opportunities: opportunities.count || 0,
        connections: connections.count || 0,
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
          <p className="mt-6 text-muted-foreground font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!user || profileError) {
    return null;
  }

  const keyMetrics = [
    {
      title: "Opérateurs Accompagnés",
      value: stats?.companies || 0,
      icon: Building2,
      gradient: "from-secondary to-secondary/70",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Projets Actifs",
      value: stats?.activeProjects || 0,
      icon: Target,
      gradient: "from-accent to-accent/70",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Formations Organisées",
      value: stats?.trainings || 0,
      icon: GraduationCap,
      gradient: "from-primary to-primary/70",
      trend: "+15%",
      trendUp: true,
    },
    {
      title: "Partenariats",
      value: stats?.partnerships || 0,
      icon: Handshake,
      gradient: "from-primary via-accent to-secondary",
      trend: "+5%",
      trendUp: true,
    },
  ];

  const modules = [
    {
      title: "Opérateurs Économiques",
      description: "Base de données unifiée des entreprises accompagnées",
      icon: Building2,
      path: "/companies",
      count: stats?.companies,
      gradient: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
      borderColor: "border-secondary/30",
    },
    {
      title: "Projets",
      description: "Gestion et suivi des projets d'accompagnement",
      icon: FolderKanban,
      path: "/projects",
      count: stats?.projects,
      gradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent",
      borderColor: "border-accent/30",
    },
    {
      title: "Documents",
      description: "GED complète avec versioning et recherche",
      icon: FileText,
      path: "/documents",
      count: stats?.documents,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
      borderColor: "border-primary/30",
    },
    {
      title: "Formations",
      description: "Suivi des formations et évaluation d'impact",
      icon: GraduationCap,
      path: "/trainings",
      count: stats?.trainings,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
      borderColor: "border-primary/30",
    },
    {
      title: "Événements",
      description: "Calendrier des événements institutionnels",
      icon: Calendar,
      path: "/events",
      count: stats?.events,
      gradient: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
      borderColor: "border-secondary/30",
    },
    {
      title: "Partenariats",
      description: "Relations avec les partenaires stratégiques",
      icon: Handshake,
      path: "/partnerships",
      count: stats?.partnerships,
      gradient: "from-accent/20 to-accent/5",
      iconColor: "text-accent",
      borderColor: "border-accent/30",
    },
    {
      title: "Développement Marchés",
      description: "Opportunités d'export et connexions B2B",
      icon: Globe,
      path: "/market-development",
      count: stats?.opportunities,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
      borderColor: "border-primary/30",
    },
    {
      title: "Suivi des KPIs",
      description: "Indicateurs de performance clés",
      icon: BarChart3,
      path: "/kpis",
      gradient: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
      borderColor: "border-secondary/30",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full px-4 py-6 relative z-10">
        {/* Hero Section améliorée */}
        <div className="text-center space-y-6 mb-12">
          {/* Logo avec effet */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative bg-card p-4 rounded-2xl border border-primary/10 shadow-lg">
                <img src={logo} alt="CÔTE D'IVOIRE EXPORT" className="h-16 w-auto" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                ACIEX
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plateforme de gestion institutionnelle centralisée
            </p>
          </div>

          {/* Barre décorative */}
          <div className="flex items-center justify-center gap-2">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-primary to-primary/50" />
            <div className="h-1 w-10 rounded-full bg-gradient-to-r from-accent to-accent/50" />
            <div className="h-1 w-6 rounded-full bg-gradient-to-r from-secondary to-secondary/50" />
          </div>
        </div>

        {/* Key Metrics avec nouveau design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {keyMetrics.map((metric, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group"
            >
              {/* Bande de couleur en haut */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.gradient}`} />
              
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${metric.trendUp ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                    <TrendingUp className={`w-3 h-3 ${metric.trendUp ? '' : 'rotate-180'}`} />
                    {metric.trend}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground mb-1 group-hover:scale-105 transition-transform duration-300">
                  {metric.value}
                </div>
                <p className="text-sm text-muted-foreground font-medium">{metric.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Summary avec nouveau design */}
        <Card className="mb-10 border-primary/10 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl">Résumé d'Activité</span>
                <CardDescription className="mt-1">Vue d'ensemble des ressources et modules</CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Documents", value: stats?.documents || 0, color: "primary" },
                { label: "Médias", value: stats?.media || 0, color: "accent" },
                { label: "Événements", value: stats?.events || 0, color: "secondary" },
                { label: "Projets Total", value: stats?.projects || 0, color: "primary" },
              ].map((item, index) => (
                <div key={index} className={`text-center p-4 rounded-xl bg-${item.color}/5 border border-${item.color}/10 hover:border-${item.color}/30 transition-colors duration-300`}>
                  <div className="text-3xl font-bold text-foreground mb-1">{item.value}</div>
                  <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section Analytics */}
        <div className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LineChart className="w-6 h-6 text-accent" />
            Analytiques
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyActivityChart />
            <SectorDistributionChart />
            <OpportunitiesChart />
            <ConnectionsEvolutionChart />
          </div>
        </div>

        {/* Modules Grid avec nouveau design */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Modules
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
                      <span className="text-xs text-muted-foreground">éléments</span>
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
