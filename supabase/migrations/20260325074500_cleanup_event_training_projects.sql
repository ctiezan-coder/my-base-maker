-- ============================================================================
-- Migration: Clean up auto-generated projects from events and trainings
-- Description: Events and trainings are not projects. Remove all auto-generated
--              project records created from events/trainings, clean up linking
--              tables, and remove stale project_type values.
-- ============================================================================

-- 1. Delete projects that were auto-generated from events
--    (linked via event_projects table)
DELETE FROM public.projects
WHERE id IN (
  SELECT project_id FROM public.event_projects
);

-- 2. Delete projects that were auto-generated from trainings
--    (linked via training_projects table)
DELETE FROM public.projects
WHERE id IN (
  SELECT project_id FROM public.training_projects
);

-- 3. Also delete any orphaned projects with event/training types
--    that may not have been linked properly
DELETE FROM public.projects
WHERE project_type IN ('Événement commercial', 'Formation')
  AND id NOT IN (
    SELECT DISTINCT id FROM public.projects
    WHERE project_type NOT IN ('Événement commercial', 'Formation')
  );

-- 4. Drop the linking tables (no longer needed)
DROP TABLE IF EXISTS public.event_projects CASCADE;
DROP TABLE IF EXISTS public.training_projects CASCADE;

-- 5. Clean up any remaining project_type references
--    Projects that somehow have these types but weren't deleted
--    (e.g., manually created with these types) get reassigned to 'Autre'
UPDATE public.projects
SET project_type = 'Autre'
WHERE project_type IN ('Événement commercial', 'Formation');
