import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Lock, ArrowLeft, Clock, UserCheck, UserPlus, Search } from 'lucide-react';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { UserPermissionsTable } from '@/components/admin/UserPermissionsTable';
import { AllowedEmailsManager } from '@/components/admin/AllowedEmailsManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');

  // Check account status FIRST - most important check
  const { data: currentProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('user_id', user.id)
        .single();
      
      return data;
    },
  });

  // Check admin role with loading state
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const isAdmin = userRole === 'admin';

  // Redirect logic - check profile status first
  useEffect(() => {
    if (profileLoading || roleLoading) return;
    
    if (!currentProfile) {
      navigate('/auth');
      return;
    }
    
    if (currentProfile.account_status !== 'approved') {
      navigate('/pending-approval');
      toast({
        variant: 'destructive',
        title: 'Compte en attente',
        description: 'Votre compte doit être approuvé pour accéder à cette page',
      });
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
      toast({
        variant: 'destructive',
        title: 'Accès refusé',
        description: 'Vous n\'avez pas les permissions nécessaires',
      });
    }
  }, [isAdmin, currentProfile, profileLoading, roleLoading, navigate, toast]);

  const { data: users } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          *,
          directions (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');

      return profiles?.map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.user_id)?.role || 'user',
      }));
    },
    enabled: isAdmin,
  });

  const { data: directions } = useQuery({
    queryKey: ['directions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('directions')
        .select('*')
        .order('name');
      return data || [];
    },
    enabled: isAdmin,
  });

  const { data: activityLogs } = useQuery({
    queryKey: ['permissionHistory'],
    queryFn: async () => {
      const { data } = await supabase
        .from('permission_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!data) return [];
      
      // Fetch user details separately
      const userIds = [...new Set([...data.map(d => d.user_id), ...data.map(d => d.target_user_id)])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);
      
      return data.map(log => ({
        ...log,
        user: profiles?.find(p => p.user_id === log.user_id),
        target_user: profiles?.find(p => p.user_id === log.target_user_id),
      }));
    },
    enabled: isAdmin,
  });

  // Fetch users with permissions for permissions tab
  const { data: usersWithPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["admin-users-permissions"],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(`
          user_id,
          full_name,
          email,
          direction_id,
          directions (
            id,
            name
          )
        `)
        .order("full_name");

      const { data, error } = await query;
      if (error) throw error;

      // Get roles for each user
      const userIds = data.map((u) => u.user_id);
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      // Get role assignments for each user
      const { data: assignmentsData } = await supabase
        .from("user_role_assignments")
        .select(`
          user_id,
          direction_id,
          module,
          role,
          directions (
            id,
            name
          )
        `)
        .in("user_id", userIds);

      // Map roles and assignments to users
      const rolesMap = new Map();
      rolesData?.forEach((r) => {
        if (!rolesMap.has(r.user_id)) {
          rolesMap.set(r.user_id, []);
        }
        rolesMap.get(r.user_id).push(r.role);
      });

      const assignmentsMap = new Map();
      assignmentsData?.forEach((a) => {
        if (!assignmentsMap.has(a.user_id)) {
          assignmentsMap.set(a.user_id, []);
        }
        assignmentsMap.get(a.user_id).push(a);
      });

      return data.map((u) => ({
        ...u,
        roles: rolesMap.get(u.user_id) || [],
        assignments: assignmentsMap.get(u.user_id) || [],
      }));
    },
    enabled: isAdmin,
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesDirection = directionFilter === 'all' || user.direction_id === directionFilter;
    
    return matchesSearch && matchesRole && matchesDirection;
  });

  // Show loading state
  if (profileLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Don't render if not approved or not admin (redirects will happen in useEffect)
  if (!currentProfile || currentProfile.account_status !== 'approved' || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card shadow-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-2">
                <Shield className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Administration</h1>
                <p className="text-sm text-muted-foreground">Gestion des utilisateurs, rôles et permissions</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-card">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="roles">Rôles</TabsTrigger>
            <TabsTrigger value="directions">Directions</TabsTrigger>
            <TabsTrigger value="logs">Logs d'activité</TabsTrigger>
            <TabsTrigger value="emails">Emails autorisés</TabsTrigger>
          </TabsList>

          {/* TAB 1: Users */}
          <TabsContent value="users" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-semibold">Total utilisateurs</p>
                      <p className="text-3xl font-bold mt-2">{users?.length || 0}</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-3">
                      <Users className="text-blue-600 w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-semibold">Approuvés</p>
                      <p className="text-3xl font-bold mt-2">
                        {users?.filter(u => u.account_status === 'approved').length || 0}
                      </p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-3">
                      <UserCheck className="text-green-600 w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-semibold">En attente</p>
                      <p className="text-3xl font-bold mt-2">
                        {users?.filter(u => u.account_status === 'pending').length || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-full p-3">
                      <Clock className="text-yellow-600 w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-semibold">Administrateurs</p>
                      <p className="text-3xl font-bold mt-2">
                        {users?.filter(u => u.role === 'admin').length || 0}
                      </p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-3">
                      <Shield className="text-purple-600 w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Liste des utilisateurs</h3>
                  <CreateUserDialog />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Rechercher un utilisateur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les rôles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">Utilisateur</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={directionFilter} onValueChange={setDirectionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les directions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les directions</SelectItem>
                      {directions?.map((dir) => (
                        <SelectItem key={dir.id} value={dir.id}>
                          {dir.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <UserManagementTable />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Permissions */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des permissions utilisateurs</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gérez les rôles globaux et les permissions par module pour chaque utilisateur
                </p>
              </CardHeader>
              <CardContent>
                <UserPermissionsTable users={usersWithPermissions || []} isLoading={permissionsLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Roles */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Role Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Rôles disponibles</h3>
                </div>

                <Card className="border-l-4 border-l-purple-600">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-purple-600" />
                          Administrateur
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">Accès complet à toutes les fonctionnalités</p>
                        <span className="inline-block mt-2 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full">
                          {users?.filter(u => u.role === 'admin').length || 0} utilisateurs
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-green-600">
                        <UserCheck className="w-4 h-4 mr-2" />
                        <span>Gestion utilisateurs</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <UserCheck className="w-4 h-4 mr-2" />
                        <span>Toutes les directions</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <UserCheck className="w-4 h-4 mr-2" />
                        <span>Modification/Suppression</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-600">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold flex items-center">
                          <Lock className="w-5 h-5 mr-2 text-green-600" />
                          Manager
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">Gestion de sa direction</p>
                        <span className="inline-block mt-2 text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                          {users?.filter(u => u.role === 'manager').length || 0} utilisateurs
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-green-600">
                        <UserCheck className="w-4 h-4 mr-2" />
                        <span>Vue direction complète</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <UserCheck className="w-4 h-4 mr-2" />
                        <span>Création et modification</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-600">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600" />
                          Utilisateur
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">Accès en lecture</p>
                        <span className="inline-block mt-2 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                          {users?.filter(u => u.role === 'user').length || 0} utilisateurs
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-green-600">
                        <UserCheck className="w-4 h-4 mr-2" />
                        <span>Lecture données direction</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Permissions Matrix */}
              <Card>
                <CardHeader>
                  <CardTitle>Matrice de permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4">Module</th>
                          <th className="text-center py-2 px-2">Admin</th>
                          <th className="text-center py-2 px-2">Manager</th>
                          <th className="text-center py-2 px-2">User</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="py-3 pr-4 font-semibold">Tableau de bord</td>
                          <td className="text-center"><UserCheck className="w-4 h-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><UserCheck className="w-4 h-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><UserCheck className="w-4 h-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-4 font-semibold">Gestion PME</td>
                          <td className="text-center"><UserCheck className="w-4 h-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><UserCheck className="w-4 h-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><span className="text-blue-600 mx-auto">👁️</span></td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-4 font-semibold">Opportunités</td>
                          <td className="text-center"><UserCheck className="w-4 h-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><UserCheck className="w-4 h-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><span className="text-blue-600 mx-auto">👁️</span></td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-4 font-semibold">Administration</td>
                          <td className="text-center"><UserCheck className="w-4 h-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><span className="text-red-600 mx-auto">❌</span></td>
                          <td className="text-center"><span className="text-red-600 mx-auto">❌</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 4: Directions */}
          <TabsContent value="directions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {directions?.map((direction) => (
                <Card key={direction.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold">{direction.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{direction.description}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Utilisateurs:</span>
                        <span className="font-semibold">
                          {users?.filter(u => u.direction_id === direction.id).length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Priorité:</span>
                        <span className="font-semibold">{direction.priority}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 5: Activity Logs */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dernières activités</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs?.map((log) => (
                    <div key={log.id} className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg">
                      <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.user?.full_name} a modifié les permissions de {log.target_user?.full_name}
                          {log.module && ` pour le module ${log.module}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!activityLogs || activityLogs.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune activité récente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: Allowed Emails */}
          <TabsContent value="emails" className="space-y-6">
            <AllowedEmailsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
