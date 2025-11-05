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
  | 'collaborators';

export type AppRole = 'admin' | 'manager' | 'user';

export function useModulePermission(
  directionId: string | null,
  module: AppModule,
  requiredRole: AppRole = 'user'
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['modulePermission', user?.id, directionId, module, requiredRole],
    queryFn: async () => {
      if (!user || !directionId) return false;

      const { data, error } = await supabase.rpc('has_module_permission', {
        _user_id: user.id,
        _direction_id: directionId,
        _module: module,
        _required_role: requiredRole,
      });

      if (error) {
        console.error('Error checking module permission:', error);
        return false;
      }

      return data || false;
    },
    enabled: !!user && !!directionId,
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
