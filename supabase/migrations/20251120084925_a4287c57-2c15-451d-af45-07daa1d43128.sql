-- Rendre la colonne direction_id obligatoire dans profiles
ALTER TABLE profiles ALTER COLUMN direction_id SET NOT NULL;

-- Créer une fonction pour vérifier l'accès aux données d'une direction
CREATE OR REPLACE FUNCTION public.user_has_direction_access(_user_id uuid, _direction_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Un utilisateur a accès à une direction si:
  -- 1. C'est sa direction principale
  -- 2. Il a une permission explicite via user_role_assignments
  -- 3. Il est admin
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = _user_id AND direction_id = _direction_id
  ) OR EXISTS (
    SELECT 1 FROM user_role_assignments WHERE user_id = _user_id AND direction_id = _direction_id
  ) OR has_role(_user_id, 'admin');
$$;

-- Mettre à jour les politiques RLS pour filtrer par direction

-- business_connections
DROP POLICY IF EXISTS "Users can view all connections" ON business_connections;
CREATE POLICY "Users can view connections with access" ON business_connections
  FOR SELECT USING (
    user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- companies
DROP POLICY IF EXISTS "Users can view all companies" ON companies;
CREATE POLICY "Users can view companies with access" ON companies
  FOR SELECT USING (
    user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- documents
DROP POLICY IF EXISTS "Users can view all documents" ON documents;
CREATE POLICY "Users can view documents with access" ON documents
  FOR SELECT USING (
    user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- events
DROP POLICY IF EXISTS "Users can view all events" ON events;
CREATE POLICY "Users can view events with access" ON events
  FOR SELECT USING (
    user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- export_opportunities  
DROP POLICY IF EXISTS "Users can view all opportunities" ON export_opportunities;
CREATE POLICY "Users can view opportunities with access" ON export_opportunities
  FOR SELECT USING (
    direction_id IS NULL OR user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- folders
DROP POLICY IF EXISTS "Users can view all folders" ON folders;
CREATE POLICY "Users can view folders with access" ON folders
  FOR SELECT USING (
    user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- imputations
DROP POLICY IF EXISTS "Users can view all imputations" ON imputations;
CREATE POLICY "Users can view imputations with access" ON imputations
  FOR SELECT USING (
    direction_id IS NULL OR user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- kpi_tracking
DROP POLICY IF EXISTS "Users can view all KPIs" ON kpi_tracking;
CREATE POLICY "Users can view KPIs with access" ON kpi_tracking
  FOR SELECT USING (
    user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- market_statistics
DROP POLICY IF EXISTS "Users can view all statistics" ON market_statistics;
CREATE POLICY "Users can view statistics with access" ON market_statistics
  FOR SELECT USING (
    direction_id IS NULL OR user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- media_content
DROP POLICY IF EXISTS "Users can view all media" ON media_content;
CREATE POLICY "Users can view media with access" ON media_content
  FOR SELECT USING (
    user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- partnerships
DROP POLICY IF EXISTS "Users can view all partnerships" ON partnerships;
CREATE POLICY "Users can view partnerships with access" ON partnerships
  FOR SELECT USING (
    user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- partnership_projects
DROP POLICY IF EXISTS "Users can view all partnership_projects" ON partnership_projects;
CREATE POLICY "Users can view partnership_projects with access" ON partnership_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM partnerships p 
      WHERE p.id = partnership_id 
      AND (user_has_direction_access(auth.uid(), p.direction_id) OR has_role(auth.uid(), 'admin'))
    )
  );

-- potential_markets
DROP POLICY IF EXISTS "Users can view all markets" ON potential_markets;
CREATE POLICY "Users can view markets with access" ON potential_markets
  FOR SELECT USING (
    direction_id IS NULL OR user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- project_tracking
DROP POLICY IF EXISTS "Users can view all project tracking" ON project_tracking;
CREATE POLICY "Users can view project tracking with access" ON project_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND (user_has_direction_access(auth.uid(), p.direction_id) OR has_role(auth.uid(), 'admin'))
    )
  );

-- projects
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
CREATE POLICY "Users can view projects with access" ON projects
  FOR SELECT USING (
    user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );

-- trainings
DROP POLICY IF EXISTS "Users can view all trainings" ON trainings;
CREATE POLICY "Users can view trainings with access" ON trainings
  FOR SELECT USING (
    user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin')
  );