-- Tighten RLS on opportunity_projects (no public write)
DROP POLICY IF EXISTS "Users can view opportunity projects" ON public.opportunity_projects;
DROP POLICY IF EXISTS "Users can insert opportunity projects" ON public.opportunity_projects;
DROP POLICY IF EXISTS "Users can delete opportunity projects" ON public.opportunity_projects;

CREATE POLICY "Authenticated can view opportunity projects"
ON public.opportunity_projects
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Managers can insert opportunity projects"
ON public.opportunity_projects
FOR INSERT
TO authenticated
WITH CHECK (has_any_module_permission(auth.uid(), 'projects'::app_module, 'manager'::app_role));

CREATE POLICY "Managers can delete opportunity projects"
ON public.opportunity_projects
FOR DELETE
TO authenticated
USING (has_any_module_permission(auth.uid(), 'projects'::app_module, 'manager'::app_role));