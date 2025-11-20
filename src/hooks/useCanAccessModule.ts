import { useModulePermission, AppModule, AppRole } from './useModulePermission';

export function useCanAccessModule(module: AppModule, requiredRole: AppRole = 'user') {
  const { data: hasAccess, isLoading } = useModulePermission(module, requiredRole);
  
  return {
    canAccess: hasAccess ?? false,
    isLoading,
  };
}
