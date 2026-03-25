import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppModule } from './useModulePermission';

export type ModuleAction = 'voir' | 'creer' | 'modifier' | 'supprimer' | 'exporter' | 'valider';

/**
 * Check if the current user can perform a specific action on a module.
 * Uses the DB function check_module_action which checks:
 * 1. Global admin bypass
 * 2. Direct permissions in user_role_assignments
 * 3. Shared module permissions
 */
export function useModuleAction(module: AppModule, action: ModuleAction) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['moduleAction', user?.id, module, action],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase.rpc('check_module_action', {
        _user_id: user.id,
        _module: module,
        _action: action,
      });

      if (error) {
        console.error('Error checking module action:', error);
        return false;
      }

      return data || false;
    },
    enabled: !!user,
  });

  return {
    allowed: data ?? false,
    isLoading,
  };
}

/**
 * Get all granular permissions for a module at once.
 * Returns an object with all action flags.
 */
export function useModulePermissions(module: AppModule) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['modulePermissions', user?.id, module],
    queryFn: async () => {
      if (!user) return null;

      const actions: ModuleAction[] = ['voir', 'creer', 'modifier', 'supprimer', 'exporter', 'valider'];
      const results: Record<ModuleAction, boolean> = {
        voir: false,
        creer: false,
        modifier: false,
        supprimer: false,
        exporter: false,
        valider: false,
      };

      const checks = await Promise.all(
        actions.map(async (action) => {
          const { data, error } = await supabase.rpc('check_module_action', {
            _user_id: user.id,
            _module: module,
            _action: action,
          });
          return { action, allowed: error ? false : (data || false) };
        })
      );

      checks.forEach(({ action, allowed }) => {
        results[action] = allowed;
      });

      return results;
    },
    enabled: !!user,
  });

  return {
    permissions: data ?? {
      voir: false,
      creer: false,
      modifier: false,
      supprimer: false,
      exporter: false,
      valider: false,
    },
    isLoading,
  };
}
