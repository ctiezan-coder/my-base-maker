import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useHasRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Lock } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = useHasRole('admin');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      toast({
        variant: 'destructive',
        title: 'Accès refusé',
        description: 'Vous n\'avez pas les permissions nécessaires',
      });
    }
  }, [isAdmin, navigate, toast]);

  const { data: users } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
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

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole as any }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'Rôle mis à jour',
        description: 'Le rôle de l\'utilisateur a été modifié avec succès',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de modifier le rôle',
      });
    },
  });

  if (!isAdmin) return null;

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'destructive';
    if (role === 'manager') return 'default';
    return 'secondary';
  };

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Shield className="w-4 h-4" />;
    if (role === 'manager') return <Lock className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Administration</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les utilisateurs et leurs permissions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter(u => u.role === 'admin').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter(u => u.role === 'manager').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des rôles</CardTitle>
          <CardDescription>
            Modifiez les rôles et permissions des utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(profile.role)}
                    <div>
                      <p className="font-medium">{profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={getRoleBadgeVariant(profile.role)}>
                    {profile.role}
                  </Badge>
                  {profile.user_id !== user?.id && (
                    <Select
                      defaultValue={profile.role}
                      onValueChange={(value) =>
                        updateRoleMutation.mutate({
                          userId: profile.user_id,
                          newRole: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Utilisateur</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {profile.user_id === user?.id && (
                    <span className="text-xs text-muted-foreground">(Vous)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Description des rôles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium">Administrateur</p>
              <p className="text-sm text-muted-foreground">
                Accès complet à toutes les fonctionnalités, gestion des utilisateurs et configuration système
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Manager</p>
              <p className="text-sm text-muted-foreground">
                Peut gérer les données de sa direction, créer et modifier les contenus
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Utilisateur</p>
              <p className="text-sm text-muted-foreground">
                Accès en lecture aux données de sa direction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
