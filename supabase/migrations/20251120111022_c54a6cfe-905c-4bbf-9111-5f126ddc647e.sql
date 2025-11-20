
-- Créer une fonction pour vérifier si un utilisateur a des permissions pour un module (dans n'importe quelle direction)
CREATE OR REPLACE FUNCTION public.has_any_module_permission(_user_id uuid, _module app_module, _required_role app_role DEFAULT 'user')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Vérifie si l'utilisateur est admin
  SELECT has_role(_user_id, 'admin')
  OR EXISTS (
    -- Ou s'il a des permissions pour ce module dans n'importe quelle direction
    SELECT 1
    FROM public.user_role_assignments
    WHERE user_id = _user_id
      AND module = _module
      AND (
        (role = 'admin') OR
        (_required_role = 'user' AND role IN ('user', 'manager', 'admin')) OR
        (_required_role = 'manager' AND role IN ('manager', 'admin'))
      )
  );
$$;

-- Supprimer l'ancienne politique RLS pour partnerships
DROP POLICY IF EXISTS "Users can view partnerships with access" ON public.partnerships;
DROP POLICY IF EXISTS "Managers can manage partnerships" ON public.partnerships;

-- Créer une nouvelle politique pour la lecture (SELECT)
CREATE POLICY "Users can view partnerships with module permission"
ON public.partnerships
FOR SELECT
TO authenticated
USING (
  -- L'utilisateur peut voir si:
  -- 1. Il a accès à la direction du partenariat (direction principale ou via role assignments)
  user_has_direction_access(auth.uid(), direction_id)
  OR
  -- 2. Il a des permissions pour le module partnerships dans n'importe quelle direction
  has_any_module_permission(auth.uid(), 'partnerships', 'user')
);

-- Créer une nouvelle politique pour la gestion (INSERT, UPDATE, DELETE)
CREATE POLICY "Users can manage partnerships with module permission"
ON public.partnerships
FOR ALL
TO authenticated
USING (
  -- L'utilisateur peut gérer si:
  -- 1. Il a des permissions manager/admin pour le module partnerships
  has_any_module_permission(auth.uid(), 'partnerships', 'manager')
)
WITH CHECK (
  has_any_module_permission(auth.uid(), 'partnerships', 'manager')
);
