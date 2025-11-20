
-- Supprimer les anciennes politiques RLS pour companies
DROP POLICY IF EXISTS "Users can view companies with access" ON public.companies;
DROP POLICY IF EXISTS "Admins and managers can manage companies" ON public.companies;

-- Créer une nouvelle politique pour la lecture (SELECT) des companies
CREATE POLICY "Users can view companies with module permission"
ON public.companies
FOR SELECT
TO authenticated
USING (
  -- L'utilisateur peut voir si:
  -- 1. Il a accès à la direction de l'opérateur (si direction_id n'est pas NULL)
  (direction_id IS NULL OR user_has_direction_access(auth.uid(), direction_id))
  OR
  -- 2. Il a des permissions pour le module companies dans n'importe quelle direction
  has_any_module_permission(auth.uid(), 'companies', 'user')
);

-- Créer une nouvelle politique pour la gestion (INSERT, UPDATE, DELETE) des companies
CREATE POLICY "Users can manage companies with module permission"
ON public.companies
FOR ALL
TO authenticated
USING (
  -- L'utilisateur peut gérer si:
  -- 1. Il a des permissions manager/admin pour le module companies
  has_any_module_permission(auth.uid(), 'companies', 'manager')
)
WITH CHECK (
  has_any_module_permission(auth.uid(), 'companies', 'manager')
);
