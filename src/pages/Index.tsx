import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FolderKanban, FileText, GraduationCap, Calendar, Handshake, Image, BarChart3, TrendingUp, Users, Target, Activity } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user) {
          navigate('/auth');
        } else {
          // Check account status
          const { data: profile } = await supabase
            .from('profiles')
            .select('account_status')
            .eq('user_id', user.id)
            .single();
          
          if (profile && profile.account_status !== 'approved') {
            navigate('/pending-approval');
          }
        }
      }
    };
    
    checkAuth();
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [companies, projects, trainings, events, partnerships, documents, media, activeProjects] = await Promise.all([
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("trainings").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("partnerships").select("id", { count: "exact", head: true }),
        supabase.from("documents").select("id", { count: "exact", head: true }),
        supabase.from("media_content").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "en cours"),
      ]);

      return {
        companies: companies.count || 0,
        projects: projects.count || 0,
        trainings: trainings.count || 0,
        events: events.count || 0,
        partnerships: partnerships.count || 0,
        documents: documents.count || 0,
        media: media.count || 0,
        activeProjects: activeProjects.count || 0,
      };
    },
  });

  const keyMetrics = [
    {
      title: "Opérateurs Accompagnés",
      value: stats?.companies || 0,
      icon: Building2,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Projets Actifs",
      value: stats?.activeProjects || 0,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Formations Organisées",
      value: stats?.trainings || 0,
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "+15%",
      trendUp: true,
    },
    {
      title: "Partenariats",
      value: stats?.partnerships || 0,
      icon: Handshake,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+5%",
      trendUp: true,
    },
  ];

  const modules = [
    {
      title: "Opérateurs Économiques",
      description: "Base de données unifiée des entreprises accompagnées avec suivi complet",
      icon: Building2,
      path: "/companies",
      count: stats?.companies,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Projets",
      description: "Gestion et suivi des projets d'accompagnement avec tableaux de bord",
      icon: FolderKanban,
      path: "/projects",
      count: stats?.projects,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Documents",
      description: "GED complète avec versioning et recherche avancée",
      icon: FileText,
      path: "/documents",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Formations",
      description: "Suivi des formations et évaluation d'impact sur les performances",
      icon: GraduationCap,
      path: "/trainings",
      count: stats?.trainings,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Événements",
      description: "Calendrier et gestion des événements institutionnels",
      icon: Calendar,
      path: "/events",
      count: stats?.events,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      title: "Partenariats",
      description: "Gestion des relations avec les partenaires stratégiques",
      icon: Handshake,
      path: "/partnerships",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Médias",
      description: "Bibliothèque de contenus médias et supports de communication",
      icon: Image,
      path: "/media",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Suivi des KPIs",
      description: "Tableau de bord des indicateurs de performance clés",
      icon: BarChart3,
      path: "/kpis",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Gestion de base données ACIEX
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Plateforme de gestion institutionnelle centralisée pour optimiser
            l'accompagnement des entreprises ivoiriennes à l'export
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {keyMetrics.map((metric, index) => (
            <Card key={index} className="border-border/50 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`w-3 h-3 ${metric.trendUp ? '' : 'rotate-180'}`} />
                    {metric.trend}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {metric.value}
                </div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Summary */}
        <Card className="mb-12 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Résumé d'Activité
            </CardTitle>
            <CardDescription>Vue d'ensemble des modules et ressources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-foreground mb-1">{stats?.documents || 0}</div>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-foreground mb-1">{stats?.media || 0}</div>
                <p className="text-xs text-muted-foreground">Médias</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-foreground mb-1">{stats?.events || 0}</div>
                <p className="text-xs text-muted-foreground">Événements</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-foreground mb-1">{stats?.projects || 0}</div>
                <p className="text-xs text-muted-foreground">Projets Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50"
              onClick={() => navigate(module.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                  <module.icon className={`w-6 h-6 ${module.color}`} />
                </div>
                <CardTitle className="text-xl">{module.title}</CardTitle>
                <CardDescription className="text-sm">
                  {module.description}
                </CardDescription>
              </CardHeader>
              {module.count !== undefined && (
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {module.count}
                  </div>
                  <p className="text-xs text-muted-foreground">Total</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
