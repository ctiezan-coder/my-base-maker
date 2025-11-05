import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users,
  Search,
  Bell,
  AlertCircle,
  Info,
  MessageSquare,
  Briefcase,
  Target,
  FileText,
  Calendar,
  TrendingUp
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Collaborateurs() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch user's profile to get their direction
  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch directions
  const { data: directions, isLoading: directionsLoading } = useQuery({
    queryKey: ['directions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('directions')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Get the initial direction ID based on user's direction name
  const initialDirectionId = directions?.find(d => d.name === profile?.direction)?.id;
  const [selectedDirection, setSelectedDirection] = useState<string | undefined>(initialDirectionId);

  // Update selectedDirection when initialDirectionId changes
  useEffect(() => {
    if (initialDirectionId && !selectedDirection) {
      setSelectedDirection(initialDirectionId);
    }
  }, [initialDirectionId, selectedDirection]);

  // Fetch team members from the same direction
  const { data: teamMembers } = useQuery({
    queryKey: ['teamMembers', selectedDirection || profile?.direction],
    queryFn: async () => {
      const directionName = selectedDirection 
        ? directions?.find(d => d.id === selectedDirection)?.name
        : profile?.direction;
      
      if (!directionName) return [];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('direction', directionName);
      
      if (profilesError) throw profilesError;

      // Fetch roles for these users
      const userIds = profiles?.map(p => p.user_id) || [];
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);
      
      if (rolesError) throw rolesError;

      return profiles?.map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.user_id)?.role || 'user'
      }));
    },
    enabled: !!(selectedDirection || profile?.direction),
  });

  // Fetch companies for the selected direction
  const { data: companies } = useQuery({
    queryKey: ['directionCompanies', selectedDirection],
    queryFn: async () => {
      const directionId = selectedDirection;
      if (!directionId) return [];
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('direction_id', directionId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDirection,
  });

  // Fetch projects for the selected direction
  const { data: projects } = useQuery({
    queryKey: ['directionProjects', selectedDirection],
    queryFn: async () => {
      const directionId = selectedDirection;
      if (!directionId) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('direction_id', directionId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDirection,
  });

  const notifications = [
    {
      type: "alert",
      title: "Nouvelle tâche assignée",
      description: "Révision du dossier export pour BioKarité CI",
      time: "Il y a 30 min",
      unread: true
    },
    {
      type: "info",
      title: "Réunion d'équipe",
      description: "Réunion hebdomadaire demain à 10h",
      time: "Il y a 2h",
      unread: true
    },
  ];

  const getDirectionIcon = (iconName: string | null) => {
    const icons: Record<string, any> = {
      'Handshake': Briefcase,
      'TrendingUp': TrendingUp,
      'Calendar': Calendar,
      'Megaphone': MessageSquare,
      'Globe': Target,
      'Brain': Info,
      'Scale': FileText,
      'UserCog': Users,
    };
    const Icon = icons[iconName || 'Building2'] || Building2;
    return <Icon className="h-5 w-5" />;
  };

  const currentDirection = selectedDirection 
    ? directions?.find(d => d.id === selectedDirection)
    : directions?.find(d => d.name === profile?.direction);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Espace Collaborateurs</h1>
            <p className="text-sm text-muted-foreground">
              {currentDirection?.name || 'Aucune direction assignée'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher..."
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
                            'bg-primary/10'
                          }`}>
                            {notif.type === 'alert' ? (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <Info className="h-4 w-4 text-primary" />
                            )}
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
                <p className="font-semibold text-sm">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Direction Selector for Admins */}
        <Tabs value={selectedDirection} onValueChange={setSelectedDirection} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-transparent">
            {directions?.map((direction) => (
              <TabsTrigger 
                key={direction.id} 
                value={direction.id}
                className="flex items-center gap-2"
              >
                {getDirectionIcon(direction.icon_name)}
                <span className="hidden md:inline">{direction.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {directions?.map((direction) => (
            <TabsContent key={direction.id} value={direction.id} className="space-y-6">
              {/* Direction Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getDirectionIcon(direction.icon_name)}
                    {direction.name}
                  </CardTitle>
                  <CardDescription>{direction.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{teamMembers?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Collaborateurs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{companies?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Entreprises</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{projects?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Projets actifs</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Members */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Équipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {teamMembers?.map((member) => (
                          <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                            <Avatar>
                              <AvatarImage src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.full_name}`} />
                              <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{member.full_name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                            <Badge variant="outline">
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                        {(!teamMembers || teamMembers.length === 0) && (
                          <p className="text-center text-muted-foreground py-8">
                            Aucun collaborateur dans cette direction
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Recent Companies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Entreprises récentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {companies?.map((company) => (
                          <div key={company.id} className="p-3 rounded-lg border hover:bg-accent transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-sm">{company.company_name}</p>
                                <p className="text-xs text-muted-foreground">{company.activity_sector}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {company.company_size || 'N/A'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {company.products_services}
                            </p>
                          </div>
                        ))}
                        {(!companies || companies.length === 0) && (
                          <p className="text-center text-muted-foreground py-8">
                            Aucune entreprise enregistrée
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Recent Projects */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Projets en cours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects?.map((project) => (
                        <div key={project.id} className="p-4 rounded-lg border hover:bg-accent transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-semibold">{project.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {project.description}
                              </p>
                            </div>
                            <Badge variant={
                              project.status === 'en cours' ? 'default' :
                              project.status === 'terminé' ? 'secondary' :
                              'outline'
                            }>
                              {project.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {project.start_date ? new Date(project.start_date).toLocaleDateString('fr-FR') : 'N/A'}
                            </div>
                            {project.budget && (
                              <div>
                                Budget: {project.budget.toLocaleString('fr-FR')} FCFA
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!projects || projects.length === 0) && (
                        <p className="text-center text-muted-foreground py-8 col-span-2">
                          Aucun projet en cours
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
