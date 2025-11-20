-- Créer les triggers manquants pour l'attribution automatique des rôles

-- Trigger pour assigner le rôle par défaut 'user' lors de la création d'un profil
DROP TRIGGER IF EXISTS on_profile_created_assign_role ON public.profiles;
CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();

-- Trigger pour assigner les permissions DAF et DG lors de la création d'un profil
DROP TRIGGER IF EXISTS on_profile_created_assign_permissions ON public.profiles;
CREATE TRIGGER on_profile_created_assign_permissions
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_daf_dg_permissions();