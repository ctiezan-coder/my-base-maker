import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'manager' | 'user';

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // If multiple roles, return the highest privilege
      if (data && data.length > 0) {
        if (data.some(r => r.role === 'admin')) return 'admin';
        if (data.some(r => r.role === 'manager')) return 'manager';
        return 'user';
      }
      
      return null;
    },
    enabled: !!user,
  });
}

export function useHasRole(role: AppRole) {
  const { data: userRole } = useUserRole();

  if (!userRole) return false;
  if (role === 'admin') return userRole === 'admin';
  if (role === 'manager') return userRole === 'admin' || userRole === 'manager';
  return true; // All authenticated users with a role have 'user' access
}
