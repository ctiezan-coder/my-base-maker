import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Sparkles, 
  CheckSquare, 
  FileText, 
  CalendarClock,
  Users,
  MapPin,
  User,
  Calendar,
  Search,
  Bell,
  AlertCircle,
  Info,
  Plus,
  Download,
  MessageSquare
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Section = 'mes-pme' | 'opportunites' | 'taches' | 'rapports' | 'chat';

export default function Collaborateurs() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('mes-pme');
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      type: "alert",
      title: "Contrat Bio Karité - Signature imminente",
      description: "Le contrat avec Nature&Sens France nécessite votre validation finale",
      time: "2025-11-04 14:30",
      unread: true
    },
    {
      type: "info",
      title: "Nouvelle opportunité - Belgique",
      description: "Distributeur chocolat premium correspond à 3 de vos PME",
      time: "2025-11-04 10:15",
      unread: true
    },
    {
      type: "warning",
      title: "Échéance rapport mensuel",
      description: "Rapport mensuel activités dû dans 2 jours",
      time: "2025-11-04 09:00",
      unread: false
    }
  ];

  const pmeList = [
    {
      id: 1,
      name: "Cacao Excellence CI",
      sector: "Agroalimentaire • Cacao transformé",
      status: "En prospection",
      market: "Suisse",
      contact: "Yao Marie, DG",
      nextMeeting: "15/11/2025",
      progress: 65
    },
    {
      id: 2,
      name: "BioKarité Côte d'Ivoire",
      sector: "Cosmétique • Produits naturels",
      status: "Négociation",
      market: "France",
      contact: "Koné Fatou, CEO",
      nextMeeting: "10/11/2025",
      progress: 80
    },
    {
      id: 3,
      name: "Textile Africain Premium",
      sector: "Mode • Textile artisanal",
      status: "Prospection",
      market: "Allemagne",
      contact: "Diallo Ibrahim, Fondateur",
      nextMeeting: "20/11/2025",
      progress: 45
    },
    {
      id: 4,
      name: "Anacarde Export Plus",
      sector: "Agroalimentaire • Noix de cajou",
      status: "Actif",
      market: "Belgique",
      contact: "Traoré Seydou, DG",
      nextMeeting: "12/11/2025",
      progress: 90
    }
  ];

  const opportunities = [
    {
      id: 1,
      title: "Distributeur Bio - Belgique",
      description: "Recherche fournisseurs cacao & karité bio certifiés",
      country: "Belgique",
      sector: "Agroalimentaire",
      deadline: "20/11/2025",
      matches: 2
    },
    {
      id: 2,
      title: "Chaîne retail - Suisse",
      description: "Partenariat chocolat premium équitable",
      country: "Suisse",
      sector: "Distribution",
      deadline: "30/11/2025",
      matches: 1
    },
    {
      id: 3,
      title: "Marque cosmétique - France",
      description: "Sourcing karité brut certifié bio",
      country: "France",
      sector: "Cosmétique",
      deadline: "15/12/2025",
      matches: 3
    }
  ];

  const tasks = [
    {
      id: 1,
      title: "Valider contrat BioKarité",
      pme: "BioKarité CI",
      deadline: "08/11/2025",
      priority: "Urgent"
    },
    {
      id: 2,
      title: "Préparer dossier certification",
      pme: "Cacao Excellence",
      deadline: "12/11/2025",
      priority: "Important"
    },
    {
      id: 3,
      title: "Rapport mensuel activités",
      pme: "Toutes PME",
      deadline: "15/11/2025",
      priority: "Normal"
    },
    {
      id: 4,
      title: "Suivi post-mission Ghana",
      pme: "Anacarde Export",
      deadline: "18/11/2025",
      priority: "Normal"
    }
  ];

  const events = [
    {
      date: "12",
      month: "Nov",
      title: "Webinaire ZLECAf",
      location: "En ligne",
      participants: 50,
      type: "Webinaire"
    },
    {
      date: "18",
      month: "Nov",
      title: "Formation Export - FDFP",
      location: "Maison de la Formation",
      participants: 25,
      type: "Formation"
    },
    {
      date: "25",
      month: "Nov",
      title: "Mission commerciale Ghana",
      location: "Accra, Ghana",
      participants: 8,
      type: "Mission"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Espace Collaborateurs</h1>
            <p className="text-sm text-muted-foreground">Gestion de votre portefeuille PME</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher PME, opportunité..."
                className="pl-10 w-80"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
                    {notifications.filter(n => n.unread).length}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <Card className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto z-50">
                  <CardHeader>
                    <CardTitle className="text-base">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {notifications.map((notif, idx) => (
                      <div
                        key={idx}
                        className={`p-4 border-b last:border-b-0 hover:bg-accent ${
                          notif.unread ? 'bg-accent/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            notif.type === 'alert' ? 'bg-destructive/10' :
                            notif.type === 'info' ? 'bg-primary/10' :
                            'bg-yellow-100'
                          }`}>
                            {notif.type === 'alert' && <AlertCircle className="h-4 w-4 text-destructive" />}
                            {notif.type === 'info' && <Info className="h-4 w-4 text-primary" />}
                            {notif.type === 'warning' && <CheckSquare className="h-4 w-4 text-yellow-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* User profile */}
            <div className="flex items-center gap-3 pl-4 border-l">
              <Avatar>
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.email}`} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-semibold text-sm">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Conseiller Export</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            <Button
              variant={activeSection === 'mes-pme' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('mes-pme')}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Mes PME ({pmeList.length})
            </Button>
            <Button
              variant={activeSection === 'opportunites' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('opportunites')}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Opportunités
              <Badge variant="secondary" className="ml-auto">
                {opportunities.length}
              </Badge>
            </Button>
            <Button
              variant={activeSection === 'taches' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('taches')}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Mes tâches
              <Badge variant="destructive" className="ml-auto">
                {tasks.length}
              </Badge>
            </Button>
            <Button
              variant={activeSection === 'rapports' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('rapports')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Rapports
            </Button>
            <Button
              variant={activeSection === 'chat' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('chat')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Assistant IA
            </Button>
          </nav>

          {/* Upcoming Events */}
          <div className="mt-8">
            <h3 className="font-bold text-sm mb-4 flex items-center">
              <CalendarClock className="mr-2 h-4 w-4" />
              Prochains événements
            </h3>
            <div className="space-y-3">
              {events.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                  <div className="bg-primary/10 rounded-lg p-2 text-center min-w-[50px]">
                    <p className="text-xl font-bold text-primary">{event.date}</p>
                    <p className="text-xs text-muted-foreground">{event.month}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      {event.participants}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* MES PME Section */}
          {activeSection === 'mes-pme' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Mes PME accompagnées</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une PME
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pmeList.map((pme) => (
                  <Card key={pme.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{pme.name}</CardTitle>
                          <CardDescription>{pme.sector}</CardDescription>
                        </div>
                        <Badge variant={
                          pme.status === 'Actif' ? 'default' :
                          pme.status === 'Négociation' ? 'secondary' :
                          'outline'
                        }>
                          {pme.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4 text-primary" />
                          Marché cible: <strong className="ml-1">{pme.market}</strong>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="mr-2 h-4 w-4 text-primary" />
                          Contact: <strong className="ml-1">{pme.contact}</strong>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4 text-primary" />
                          Prochain RDV: <strong className="ml-1">{pme.nextMeeting}</strong>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="font-bold text-primary">{pme.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-primary to-green-600 h-3 rounded-full transition-all"
                            style={{ width: `${pme.progress}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* OPPORTUNITES Section */}
          {activeSection === 'opportunites' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Opportunités disponibles</h2>

              <div className="grid gap-6">
                {opportunities.map((opp) => (
                  <Card key={opp.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{opp.title}</CardTitle>
                          <CardDescription>{opp.description}</CardDescription>
                        </div>
                        <Badge>{opp.matches} PME</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          {opp.country}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Building2 className="mr-2 h-4 w-4" />
                          {opp.sector}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          Échéance: {opp.deadline}
                        </div>
                        <Button size="sm" className="ml-auto">
                          Voir les matches
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TACHES Section */}
          {activeSection === 'taches' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Mes tâches</h2>

              <div className="grid gap-4">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CheckSquare className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">{task.title}</p>
                            <p className="text-sm text-muted-foreground">{task.pme}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={
                            task.priority === 'Urgent' ? 'destructive' :
                            task.priority === 'Important' ? 'default' :
                            'secondary'
                          }>
                            {task.priority}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            <Calendar className="inline mr-1 h-4 w-4" />
                            {task.deadline}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* RAPPORTS Section */}
          {activeSection === 'rapports' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Rapports d'activité</h2>

              <div className="grid gap-6">
                {/* Rapports disponibles */}
                <Card>
                  <CardHeader>
                    <CardTitle>Générer un rapport</CardTitle>
                    <CardDescription>
                      Créez des rapports personnalisés sur vos activités
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                        <FileText className="h-6 w-6" />
                        <div className="text-center">
                          <p className="font-semibold">Rapport mensuel</p>
                          <p className="text-xs text-muted-foreground">Activités du mois</p>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                        <Building2 className="h-6 w-6" />
                        <div className="text-center">
                          <p className="font-semibold">Rapport PME</p>
                          <p className="text-xs text-muted-foreground">Par entreprise</p>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                        <Sparkles className="h-6 w-6" />
                        <div className="text-center">
                          <p className="font-semibold">Rapport opportunités</p>
                          <p className="text-xs text-muted-foreground">Matches et résultats</p>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                        <CheckSquare className="h-6 w-6" />
                        <div className="text-center">
                          <p className="font-semibold">Rapport tâches</p>
                          <p className="text-xs text-muted-foreground">Suivi et performance</p>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Rapports récents */}
                <Card>
                  <CardHeader>
                    <CardTitle>Rapports récents</CardTitle>
                    <CardDescription>Vos derniers rapports générés</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-4">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-semibold">Rapport mensuel - Octobre 2025</p>
                            <p className="text-sm text-muted-foreground">Généré le 01/11/2025</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-4">
                          <Building2 className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-semibold">Rapport PME - BioKarité CI</p>
                            <p className="text-sm text-muted-foreground">Généré le 28/10/2025</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-4">
                          <Sparkles className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-semibold">Rapport opportunités - Q3 2025</p>
                            <p className="text-sm text-muted-foreground">Généré le 15/10/2025</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* CHAT Section */}
          {activeSection === 'chat' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Assistant IA</h2>
              <Card className="h-[calc(100vh-300px)]">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {/* Messages d'exemple */}
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-accent p-3 rounded-lg">
                        <p className="text-sm">
                          Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Posez votre question..."
                      className="flex-1"
                    />
                    <Button>
                      Envoyer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
