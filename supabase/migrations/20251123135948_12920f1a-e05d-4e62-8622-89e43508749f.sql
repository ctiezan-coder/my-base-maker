-- Permettre à tous les utilisateurs authentifiés de voir les statistiques pour le dashboard

-- Companies: Permettre à tous de compter/voir les entreprises
DROP POLICY IF EXISTS "Users can view companies with module permission" ON public.companies;
CREATE POLICY "Users can view companies with module permission"
ON public.companies FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- Projects: Permettre à tous de compter/voir les projets
DROP POLICY IF EXISTS "Users can view projects in their direction" ON public.projects;
CREATE POLICY "Users can view projects in their direction"
ON public.projects FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- Trainings: Permettre à tous de compter/voir les formations
DROP POLICY IF EXISTS "Users can view trainings in their direction" ON public.trainings;
CREATE POLICY "Users can view trainings in their direction"
ON public.trainings FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- Events: Permettre à tous de compter/voir les événements
DROP POLICY IF EXISTS "Users can view events in their direction" ON public.events;
CREATE POLICY "Users can view events in their direction"
ON public.events FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- Partnerships: Permettre à tous de compter/voir les partenariats
DROP POLICY IF EXISTS "Users can view partnerships with module permission" ON public.partnerships;
CREATE POLICY "Users can view partnerships with module permission"
ON public.partnerships FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- Documents: Permettre à tous de compter/voir les documents
DROP POLICY IF EXISTS "Users can view documents in their direction" ON public.documents;
CREATE POLICY "Users can view documents in their direction"
ON public.documents FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- Media Content: Permettre à tous de compter/voir les médias
DROP POLICY IF EXISTS "Users can view media in their direction or if Service Communication" ON public.media_content;
CREATE POLICY "Users can view media in their direction or if Service Communication"
ON public.media_content FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);