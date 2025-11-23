import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppModule = 
  | 'companies'
  | 'projects'
  | 'documents'
  | 'events'
  | 'trainings'
  | 'kpis'
  | 'market_development'
  | 'partnerships'
  | 'media'
  | 'collaborators'
  | 'imputations'
  | 'suivi_evaluation';

export type AppRole = 'admin' | 'manager' | 'user';

export function useModulePermission(
  module: AppModule,
  requiredRole: AppRole = 'user'
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['modulePermission', user?.id, module, requiredRole],
    queryFn: async () => {
      if (!user) return false;

      // Get user's direction
      const { data: profile } = await supabase
        .from('profiles')
        .select('direction_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.direction_id) return false;

      const { data, error } = await supabase.rpc('has_module_permission', {
        _user_id: user.id,
        _direction_id: profile.direction_id,
        _module: module,
        _required_role: requiredRole,
      });

      if (error) {
        console.error('Error checking module permission:', error);
        return false;
      }

      return data || false;
    },
    enabled: !!user,
  });
}

export function useUserModuleRoles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userModuleRoles', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_role_assignments')
        .select(`
          *,
          direction:directions(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
