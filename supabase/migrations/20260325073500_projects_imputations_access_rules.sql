-- ============================================================================
-- Migration: Projects and Imputations Business Access Rules
-- Description:
--   - Projects: Only DG, project managers, responsable S&E, or project owners
--     can create/modify projects. All users with module access can view.
--   - Imputations: Reserved exclusively for Direction Générale (DG).
-- ============================================================================

-- --------------------------------------------------------------------------
-- Helper: Check if user belongs to Direction Générale
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_direction_generale(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.directions d ON d.id = p.direction_id
    WHERE p.user_id = _user_id
      AND d.name = 'Direction Générale'
  );
$$;

-- --------------------------------------------------------------------------
-- Helper: Check if user can manage projects
-- (DG, project module manager, suivi_evaluation manager, or admin)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_manage_projects(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    has_role(_user_id, 'admin')
    OR is_direction_generale(_user_id)
    OR has_any_module_permission(_user_id, 'projects', 'manager')
    OR has_any_module_permission(_user_id, 'suivi_evaluation', 'manager');
$$;

-- --------------------------------------------------------------------------
-- 1. Projects: Update RLS policies for INSERT/UPDATE/DELETE
-- --------------------------------------------------------------------------

-- Drop existing write policies for projects
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Managers can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Users can manage projects with module permission" ON public.projects;

-- Only authorized roles can create projects
CREATE POLICY "Authorized users can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (
  can_manage_projects(auth.uid())
);

-- Only project creator, DG, S&E manager, or admin can update
CREATE POLICY "Authorized users can update projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR can_manage_projects(auth.uid())
)
WITH CHECK (
  created_by = auth.uid()
  OR can_manage_projects(auth.uid())
);

-- Only project creator, DG, or admin can delete
CREATE POLICY "Authorized users can delete projects"
ON public.projects
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR has_role(auth.uid(), 'admin')
  OR is_direction_generale(auth.uid())
);

-- --------------------------------------------------------------------------
-- 2. Imputations: Restrict to DG only
-- --------------------------------------------------------------------------

-- Drop existing write policies for imputations
DROP POLICY IF EXISTS "Users can create imputations" ON public.imputations;
DROP POLICY IF EXISTS "Users can update imputations" ON public.imputations;
DROP POLICY IF EXISTS "Users can delete imputations" ON public.imputations;
DROP POLICY IF EXISTS "Users can manage imputations" ON public.imputations;
DROP POLICY IF EXISTS "Users can manage imputations with module permission" ON public.imputations;
DROP POLICY IF EXISTS "Managers can manage imputations" ON public.imputations;

-- Only DG and admins can create imputations
CREATE POLICY "DG can create imputations"
ON public.imputations
FOR INSERT
TO authenticated
WITH CHECK (
  is_direction_generale(auth.uid())
  OR has_role(auth.uid(), 'admin')
);

-- Only DG and admins can update imputations
CREATE POLICY "DG can update imputations"
ON public.imputations
FOR UPDATE
TO authenticated
USING (
  is_direction_generale(auth.uid())
  OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  is_direction_generale(auth.uid())
  OR has_role(auth.uid(), 'admin')
);

-- Only DG and admins can delete imputations
CREATE POLICY "DG can delete imputations"
ON public.imputations
FOR DELETE
TO authenticated
USING (
  is_direction_generale(auth.uid())
  OR has_role(auth.uid(), 'admin')
);
