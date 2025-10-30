import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { DirectionCard } from "@/components/DirectionCard";
import { StatsOverview } from "@/components/StatsOverview";
import { BarChart3, Users, Megaphone, TrendingUp, FileText } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
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
  const directions = [
    {
      title: "Suivi & Évaluation",
      description: "Pilotage et analyse de performance",
      categories: ["Tableaux de bord dynamiques", "Reporting automatisé", "Alertes KPI"],
      priority: "Élevé" as const,
      icon: BarChart3
    },
    {
      title: "VAME",
      description: "Valorisation & Mise en Œuvre",
      categories: ["Formations/événements", "Partenariats", "Suivi activités"],
      priority: "Élevé" as const,
      volume: "12-3 Go",
      icon: Users
    },
    {
      title: "Communication",
      description: "Marketing & Média",
      categories: ["Supports marketing", "Contenus vidéo/photo", "Documents médias", "Agenda partagé"],
      priority: "Très élevé" as const,
      volume: "~500 Mo/mois",
      icon: Megaphone
    },
    {
      title: "Marchés & Compétitivité",
      description: "Intelligence commerciale",
      categories: ["Données opérateurs", "Documents partenariats", "Manifestations commerciales"],
      priority: "Très élevé" as const,
      icon: TrendingUp
    },
    {
      title: "Digitalisation",
      description: "Transformation digitale",
      categories: ["Documents légaux", "Données marchés", "Suivi projets", "PTBA", "Intelligence économique"],
      priority: "Très élevé" as const,
      volume: "~5,5 Go",
      icon: FileText
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
            Base de Données ACIEX
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
            Centralisation des données institutionnelles pour améliorer l'efficacité opérationnelle,
            faciliter la prise de décision et assurer la conformité aux standards internationaux
          </p>
        </div>

        {/* Stats Overview */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <StatsOverview />
        </div>

        {/* Directions Grid */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Directions Prioritaires</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Cinq directions stratégiques pour la centralisation des données
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {directions.map((direction, index) => (
              <div 
                key={index}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <DirectionCard {...direction} />
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-1000">
          <h3 className="text-xl font-bold text-foreground mb-6">Plan d'Action</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                Court terme (1-3 mois)
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Finaliser l'architecture technique</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Définir les niveaux d'accès</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                Moyen terme (3-6 mois)
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Déployer les modules prioritaires</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Former les utilisateurs</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                Long terme (6-12 mois)
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Intégrer l'ensemble des données</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Établir une culture data-driven</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
