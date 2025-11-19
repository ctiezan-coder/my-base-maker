import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OperatorTrackingDialog } from "@/components/collaborateurs/OperatorTrackingDialog";
import { OpportunityMatchesDialog } from "@/components/collaborateurs/OpportunityMatchesDialog";
import { ReportDialog } from "@/components/collaborateurs/ReportDialog";
import { TaskDialog } from "@/components/collaborateurs/TaskDialog";
import { OpportunityDialog } from "@/components/market/OpportunityDialog";
import { SendToOperatorsDialog } from "@/components/market/SendToOperatorsDialog";
import { CompanyDetailsDialog } from "@/components/companies/CompanyDetailsDialog";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useUserDirection } from "@/hooks/useUserDirection";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  MessageSquare,
  Send,
  History
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Section = 'mes-pme' | 'opportunites' | 'taches' | 'rapports' | 'chat' | 'historique';
type ReportType = "monthly" | "pme" | "opportunities" | "tasks";

export default function Collaborateurs() {
  const { user } = useAuth();
  const { data: userDirection } = useUserDirection();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<Section>('mes-pme');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Dialog states
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [showMatchesDialog, setShowMatchesDialog] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("monthly");
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showOpportunityDialog, setShowOpportunityDialog] = useState(false);
  const [selectedOpportunityDetails, setSelectedOpportunityDetails] = useState<any>(null);
  const [showSendToOperatorsDialog, setShowSendToOperatorsDialog] = useState(false);
  const [sendOpportunityData, setSendOpportunityData] = useState<{id: string, title: string, sector: string} | null>(null);
  const [showCompanyDetailsDialog, setShowCompanyDetailsDialog] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");

  // Chat functionality
  const { messages, isLoading: isLoadingMessages, sendMessage, isSending } = useChatMessages(selectedCollaborators);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time updates for opportunity applications
  useEffect(() => {
    const channel = supabase
      .channel('opportunity-applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'opportunity_applications'
        },
        () => {
          // Invalidate the query to refetch data
          queryClient.invalidateQueries({ queryKey: ['opportunity-applications-history'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Charger les collaborateurs depuis la base de données
  const { data: collaboratorsData, isLoading: isLoadingCollaborators } = useQuery({
    queryKey: ['collaborators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Charger les tâches depuis la base de données
  const { data: tasksData = [] } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Liste des collaborateurs depuis la base de données
  const collaborators = collaboratorsData?.map((profile) => ({
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.direction || "Collaborateur",
    online: Math.random() > 0.5 // Simulation du statut en ligne
  })) || [];

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

  // Charger les entreprises avec suivi depuis la base de données
  const { data: companiesData, isLoading: isLoadingCompanies, refetch: refetchCompanies } = useQuery({
    queryKey: ['tracked-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .not('accompaniment_status', 'is', null)
        .order('company_name');
      
      if (error) throw error;
      return data;
    }
  });

  const pmeList = companiesData?.map((company) => ({
    id: company.id,
    name: company.company_name,
    sector: `${company.activity_sector || 'Non spécifié'} • ${company.products_services || 'Produits variés'}`,
    activitySector: company.activity_sector || 'Non spécifié',
    status: company.accompaniment_status || 'En prospection',
    market: company.target_export_markets?.[0] || 'Non défini',
    contact: company.legal_representative_name || 'Non renseigné',
    nextMeeting: '-',
    progress: company.accompaniment_status === 'Actif' ? 90 : 
              company.accompaniment_status === 'Négociation' ? 70 : 50
  }))
  .filter((pme) => {
    const matchesStatus = statusFilter === "all" || pme.status === statusFilter;
    const matchesSector = sectorFilter === "all" || pme.activitySector === sectorFilter;
    return matchesStatus && matchesSector;
  }) || [];

  // Get unique sectors and statuses for filter options
  const uniqueSectors = Array.from(new Set(companiesData?.map(c => c.activity_sector).filter(Boolean))) || [];
  const uniqueStatuses = Array.from(new Set(companiesData?.map(c => c.accompaniment_status).filter(Boolean))) || [];

  // Charger les opportunités depuis la base de données
  const { data: opportunities = [], isLoading: isLoadingOpportunities } = useQuery({
    queryKey: ['export-opportunities-collaborateurs'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('export_opportunities')
        .select('*')
        .gte('deadline', today)
        .neq('status', 'FERMÉ')
        .order('deadline', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Charger l'historique des envois d'opportunités
  const { data: sendHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['opportunity-applications-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunity_applications')
        .select(`
          *,
          opportunity:export_opportunities(*),
          company:companies(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });


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
            <p className="text-sm text-muted-foreground">Gestion de votre portefeuille Opérateur</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher PME, opportunité..."
                className="pl-10 w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              Mes opérateurs ({pmeList.length})
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
                {tasksData.length}
              </Badge>
            </Button>
            <Button
              variant={activeSection === 'historique' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('historique')}
            >
              <History className="mr-2 h-4 w-4" />
              Historique envois
              <Badge variant="secondary" className="ml-auto">
                {sendHistory.length}
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
              Tchat
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
                <h2 className="text-3xl font-bold">Mes opérateurs suivis</h2>
                <Button onClick={() => setShowTrackingDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Suivre un opérateur
                </Button>
              </div>

              {/* Filtres masqués */}

              {/* Liste des opérateurs masquée */}
            </div>
          )}

          {/* OPPORTUNITES Section */}
          {activeSection === 'opportunites' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Opportunités disponibles</h2>

              <div className="grid gap-6">
                {isLoadingOpportunities ? (
                  <p className="text-center text-muted-foreground">Chargement des opportunités...</p>
                ) : opportunities.length === 0 ? (
                  <p className="text-center text-muted-foreground">Aucune opportunité disponible</p>
                ) : (
                  opportunities.map((opp) => (
                    <Card key={opp.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle>{opp.title}</CardTitle>
                              {opp.status && (
                                <Badge variant={
                                  opp.status === 'URGENT' ? 'destructive' :
                                  opp.status === 'NOUVEAU' ? 'default' :
                                  opp.status === 'RECOMMANDÉ' ? 'secondary' :
                                  'outline'
                                }>
                                  {opp.status}
                                </Badge>
                              )}
                            </div>
                            <CardDescription>{opp.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center flex-wrap gap-6 text-sm mb-4">
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4" />
                            {opp.destination_country}{opp.destination_city && `, ${opp.destination_city}`}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Building2 className="mr-2 h-4 w-4" />
                            {opp.sector}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="mr-2 h-4 w-4" />
                            Échéance: {format(new Date(opp.deadline), "dd/MM/yyyy")}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedOpportunityDetails(opp);
                              setShowOpportunityDialog(true);
                            }}
                          >
                            Voir détails
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSendOpportunityData({
                                id: opp.id,
                                title: opp.title,
                                sector: opp.sector
                              });
                              setShowSendToOperatorsDialog(true);
                            }}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Proposer cette opportunité
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TACHES Section */}
          {activeSection === 'taches' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Mes tâches</h2>
                <Button onClick={() => {
                  setSelectedTask(null);
                  setShowTaskDialog(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle tâche
                </Button>
              </div>

              <div className="grid gap-4">
                {tasksData.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Aucune tâche pour le moment. Créez votre première tâche pour commencer !
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  tasksData.map((task: any) => (
                    <Card 
                      key={task.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskDialog(true);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <CheckSquare className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">{task.title}</p>
                                <Badge variant={
                                  task.priority === 'Haute' ? 'destructive' :
                                  task.priority === 'Moyenne' ? 'default' :
                                  'secondary'
                                }>
                                  {task.priority}
                                </Badge>
                                <Badge variant={
                                  task.status === 'Terminée' ? 'default' :
                                  task.status === 'En cours' ? 'secondary' : 
                                  'outline'
                                }>
                                  {task.status}
                                </Badge>
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {task.company_name && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4" />
                                    {task.company_name}
                                  </span>
                                )}
                                {task.deadline && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(task.deadline), 'dd/MM/yyyy', { locale: fr })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* HISTORIQUE Section */}
          {activeSection === 'historique' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Historique des envois d'opportunités</h2>
              </div>

              {isLoadingHistory ? (
                <p className="text-center text-muted-foreground">Chargement de l'historique...</p>
              ) : sendHistory.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Aucun envoi d'opportunité pour le moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {sendHistory.map((record: any) => (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">
                              {record.opportunity?.title || "Opportunité supprimée"}
                            </CardTitle>
                            <CardDescription>
                              Envoyé à: {record.company?.company_name || "Entreprise supprimée"}
                            </CardDescription>
                          </div>
                          <Badge variant={
                            record.status === 'En attente' ? 'secondary' :
                            record.status === 'Accepté' ? 'default' :
                            record.status === 'Refusé' ? 'destructive' :
                            'outline'
                          }>
                            {record.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {record.opportunity && (
                            <>
                              <div>
                                <p className="text-muted-foreground">Destination</p>
                                <p className="font-medium">
                                  {record.opportunity.destination_country}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Secteur</p>
                                <p className="font-medium">{record.opportunity.sector}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Valeur estimée</p>
                                <p className="font-medium">
                                  {record.opportunity.estimated_value.toLocaleString()} {record.opportunity.currency}
                                </p>
                              </div>
                            </>
                          )}
                          <div>
                            <p className="text-muted-foreground">Date d'envoi</p>
                            <p className="font-medium">
                              {format(new Date(record.application_date), "dd/MM/yyyy", { locale: fr })}
                            </p>
                          </div>
                        </div>
                        {record.notes && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                            <p className="text-sm">{record.notes}</p>
                          </div>
                        )}
                        {record.company && (
                          <div className="mt-4 flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedCompanyId(record.company.id);
                                setSelectedCompanyName(record.company.company_name);
                                setShowCompanyDetailsDialog(true);
                              }}
                            >
                              Voir détails PME
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => {
                        setReportType("monthly");
                        setShowReportDialog(true);
                      }}>
                        <FileText className="h-6 w-6" />
                        <div className="text-center">
                          <p className="font-semibold">Rapport mensuel</p>
                          <p className="text-xs text-muted-foreground">Activités du mois</p>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => {
                        setReportType("pme");
                        setShowReportDialog(true);
                      }}>
                        <Building2 className="h-6 w-6" />
                        <div className="text-center">
                          <p className="font-semibold">Rapport PME</p>
                          <p className="text-xs text-muted-foreground">Par entreprise</p>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => {
                        setReportType("opportunities");
                        setShowReportDialog(true);
                      }}>
                        <Sparkles className="h-6 w-6" />
                        <div className="text-center">
                          <p className="font-semibold">Rapport opportunités</p>
                          <p className="text-xs text-muted-foreground">Matches et résultats</p>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => {
                        setReportType("tasks");
                        setShowReportDialog(true);
                      }}>
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
                        <Button size="sm" variant="ghost" onClick={() => console.log('Télécharger rapport mensuel')}>
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
                        <Button size="sm" variant="ghost" onClick={() => console.log('Télécharger rapport PME BioKarité')}>
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
                        <Button size="sm" variant="ghost" onClick={() => console.log('Télécharger rapport opportunités')}>
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
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Tchat</h2>
                <Badge variant="secondary">
                  {selectedCollaborators.length} participant{selectedCollaborators.length !== 1 ? 's' : ''} sélectionné{selectedCollaborators.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Liste des collaborateurs */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-base">Collaborateurs</CardTitle>
                    <CardDescription>Sélectionnez vos contacts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {collaborators.map((collab) => (
                          <div key={collab.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={collab.id}
                              checked={selectedCollaborators.includes(collab.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCollaborators([...selectedCollaborators, collab.id]);
                                } else {
                                  setSelectedCollaborators(
                                    selectedCollaborators.filter((id) => id !== collab.id)
                                  );
                                }
                              }}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={collab.id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium leading-none">
                                      {collab.name}
                                    </p>
                                    {collab.online && (
                                      <span className="h-2 w-2 rounded-full bg-green-500" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {collab.role}
                                  </p>
                                </div>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Zone de chat */}
                <Card className="lg:col-span-3 h-[calc(100vh-300px)]">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {selectedCollaborators.length === 0
                        ? "Sélectionnez des collaborateurs pour commencer"
                        : `Discussion avec ${selectedCollaborators.length} personne${selectedCollaborators.length !== 1 ? 's' : ''}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full pb-6">
                    <ScrollArea className="flex-1 pr-4 mb-4">
                      <div className="space-y-4">
                        {selectedCollaborators.length > 0 ? (
                          <>
                            {messages.length === 0 ? (
                              <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground">
                                  Début de la conversation
                                </p>
                                <Separator className="my-4" />
                              </div>
                            ) : (
                              messages.map((msg) => {
                                const isOwn = msg.sender_id === user?.id;
                                const senderName = msg.sender_profile?.full_name || msg.sender_profile?.email || 'Utilisateur';
                                const messageTime = new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });

                                return (
                                  <div 
                                    key={msg.id} 
                                    className={`flex gap-3 ${isOwn ? 'justify-end' : ''}`}
                                  >
                                    {!isOwn && (
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${senderName}`} />
                                        <AvatarFallback>{senderName.charAt(0).toUpperCase()}</AvatarFallback>
                                      </Avatar>
                                    )}
                                    <div className={`flex-1 flex flex-col ${isOwn ? 'items-end' : ''}`}>
                                      <div className="flex items-center gap-2 mb-1">
                                        {isOwn ? (
                                          <>
                                            <p className="text-xs text-muted-foreground">{messageTime}</p>
                                            <p className="text-sm font-semibold">Vous</p>
                                          </>
                                        ) : (
                                          <>
                                            <p className="text-sm font-semibold">{senderName}</p>
                                            <p className="text-xs text-muted-foreground">{messageTime}</p>
                                          </>
                                        )}
                                      </div>
                                      <div className={`p-3 rounded-lg max-w-[80%] ${
                                        isOwn 
                                          ? 'bg-primary text-primary-foreground' 
                                          : 'bg-accent'
                                      }`}>
                                        <p className="text-sm">{msg.message}</p>
                                      </div>
                                    </div>
                                    {isOwn && (
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.email}`} />
                                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>
                                );
                              })
                            )}
                            <div ref={messagesEndRef} />
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-center p-8">
                            <div>
                              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                Sélectionnez un ou plusieurs collaborateurs pour démarrer une discussion
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {selectedCollaborators.length > 0 && (
                      <>
                        <Separator className="mb-4" />
                        <div className="flex gap-2">
                          <Input
                            placeholder="Tapez votre message..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            disabled={isSending}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey && chatMessage.trim()) {
                                e.preventDefault();
                                sendMessage(chatMessage.trim());
                                setChatMessage("");
                              }
                            }}
                          />
                          <Button 
                            onClick={() => {
                              if (chatMessage.trim()) {
                                sendMessage(chatMessage.trim());
                                setChatMessage("");
                              }
                            }}
                            disabled={isSending || !chatMessage.trim()}
                          >
                            {isSending ? 'Envoi...' : 'Envoyer'}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dialogues */}
      <OperatorTrackingDialog 
        open={showTrackingDialog} 
        onOpenChange={(open) => {
          setShowTrackingDialog(open);
          if (!open) refetchCompanies();
        }} 
      />
      <OpportunityMatchesDialog 
        open={showMatchesDialog} 
        onOpenChange={setShowMatchesDialog}
        opportunity={selectedOpportunity}
      />
      <ReportDialog 
        open={showReportDialog} 
        onOpenChange={setShowReportDialog}
        reportType={reportType}
      />
      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        task={selectedTask}
        companies={companiesData?.map(c => ({ 
          id: c.id, 
          company_name: c.company_name 
        })) || []}
        collaborators={collaboratorsData?.map(p => ({ 
          user_id: p.user_id, 
          full_name: p.full_name 
        })) || []}
        directionId={userDirection?.direction_id || null}
      />
      
      {/* Opportunity Details Dialog */}
      <Dialog open={showOpportunityDialog} onOpenChange={setShowOpportunityDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de l'opportunité</DialogTitle>
          </DialogHeader>
          {selectedOpportunityDetails && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedOpportunityDetails.title}</h3>
                <div className="flex gap-2 mb-3">
                  {selectedOpportunityDetails.status && (
                    <Badge variant={
                      selectedOpportunityDetails.status === 'URGENT' ? 'destructive' :
                      selectedOpportunityDetails.status === 'NOUVEAU' ? 'default' :
                      selectedOpportunityDetails.status === 'RECOMMANDÉ' ? 'secondary' :
                      'outline'
                    }>
                      {selectedOpportunityDetails.status}
                    </Badge>
                  )}
                  <Badge variant="outline">{selectedOpportunityDetails.region}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Secteur</p>
                  <p className="font-medium">{selectedOpportunityDetails.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">
                    {selectedOpportunityDetails.destination_country}
                    {selectedOpportunityDetails.destination_city && `, ${selectedOpportunityDetails.destination_city}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valeur estimée</p>
                  <p className="font-medium">
                    {selectedOpportunityDetails.estimated_value.toLocaleString()} {selectedOpportunityDetails.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volume</p>
                  <p className="font-medium">{selectedOpportunityDetails.volume}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Échéance</p>
                  <p className="font-medium">
                    {format(new Date(selectedOpportunityDetails.deadline), "dd MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                {selectedOpportunityDetails.compatibility_score && (
                  <div>
                    <p className="text-sm text-muted-foreground">Score de compatibilité</p>
                    <p className="font-medium">{selectedOpportunityDetails.compatibility_score}%</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{selectedOpportunityDetails.description}</p>
              </div>

              {selectedOpportunityDetails.requirements && selectedOpportunityDetails.requirements.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Exigences</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedOpportunityDetails.requirements.map((req: string, idx: number) => (
                      <li key={idx} className="text-sm">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {sendOpportunityData && (
        <SendToOperatorsDialog
          open={showSendToOperatorsDialog}
          onOpenChange={(open) => {
            setShowSendToOperatorsDialog(open);
            if (!open) {
              // Invalidate history query when dialog closes
              queryClient.invalidateQueries({ queryKey: ['opportunity-applications-history'] });
            }
          }}
          opportunityId={sendOpportunityData.id}
          opportunityTitle={sendOpportunityData.title}
          opportunitySector={sendOpportunityData.sector}
        />
      )}
      {selectedCompanyId && (
        <CompanyDetailsDialog
          open={showCompanyDetailsDialog}
          onOpenChange={setShowCompanyDetailsDialog}
          companyId={selectedCompanyId}
          companyName={selectedCompanyName}
        />
      )}
    </div>
  );
}
