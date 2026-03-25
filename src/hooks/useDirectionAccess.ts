import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Check if the current user belongs to the Direction Générale.
 */
export function useIsDirectionGenerale() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['isDirectionGenerale', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('profiles')
        .select('direction_id, directions!inner(name)')
        .eq('user_id', user.id)
        .single();

      if (error || !data) return false;

      const directionName = (data.directions as any)?.name || '';
      return directionName === 'Direction Générale';
    },
    enabled: !!user,
  });
}

/**
 * Check if the current user can create/manage projects.
 * Allowed for:
 * - Global admins
 * - DG (Direction Générale) members
 * - Users with suivi_evaluation module permission (responsable S&E)
 * - Project creators (checked at RLS level)
 * - Users with projects module manager/admin role
 */
export function useCanManageProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['canManageProjects', user?.id],
    queryFn: async () => {
      if (!user) return false;

      // Check if global admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleData) return true;

      // Get user's direction
      const { data: profile } = await supabase
        .from('profiles')
        .select('direction_id, directions!inner(name)')
        .eq('user_id', user.id)
        .single();

      if (!profile) return false;

      const directionName = (profile.directions as any)?.name || '';

      // DG members can always manage projects
      if (directionName === 'Direction Générale') return true;

      // Check if user has projects module permission as manager/admin
      const { data: projectPerm } = await supabase.rpc('has_module_permission', {
        _user_id: user.id,
        _direction_id: profile.direction_id,
        _module: 'projects',
        _required_role: 'manager',
      });

      if (projectPerm) return true;

      // Check if user has suivi_evaluation module permission (responsable S&E)
      const { data: sePerm } = await supabase.rpc('has_any_module_permission', {
        _user_id: user.id,
        _module: 'suivi_evaluation',
        _required_role: 'manager',
      });

      if (sePerm) return true;

      return false;
    },
    enabled: !!user,
  });
}
