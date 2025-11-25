-- Supprimer les politiques trop permissives et les remplacer par des politiques basées sur les permissions

-- Companies: Supprimer la politique qui donne accès à tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Users can view companies with module permission" ON companies;

CREATE POLICY "Users can view companies with module permission"
ON companies
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'companies'::app_module, 'user'::app_role));

-- Documents: Supprimer les politiques trop permissives
DROP POLICY IF EXISTS "Users can view documents in their direction" ON documents;
DROP POLICY IF EXISTS "Users can view documents with access" ON documents;

CREATE POLICY "Users can view documents with module permission"
ON documents
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'documents'::app_module, 'user'::app_role));

-- Media: Supprimer les politiques trop permissives
DROP POLICY IF EXISTS "Users can view media in their direction or if Service Communica" ON media_content;
DROP POLICY IF EXISTS "Users can view media with access" ON media_content;

CREATE POLICY "Users can view media with module permission"
ON media_content
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'media'::app_module, 'user'::app_role));

-- Events: Ajouter la vérification des permissions de module
DROP POLICY IF EXISTS "Users can view events" ON events;

CREATE POLICY "Users can view events with module permission"
ON events
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'events'::app_module, 'user'::app_role));

-- Trainings: Ajouter la vérification des permissions de module
DROP POLICY IF EXISTS "Users can view trainings" ON trainings;

CREATE POLICY "Users can view trainings with module permission"
ON trainings
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'trainings'::app_module, 'user'::app_role));

-- Projects: Ajouter la vérification des permissions de module
DROP POLICY IF EXISTS "Users can view projects with access" ON projects;

CREATE POLICY "Users can view projects with module permission"
ON projects
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'projects'::app_module, 'user'::app_role));

-- KPIs: Supprimer la politique trop permissive
DROP POLICY IF EXISTS "Users can view KPIs with access" ON kpi_tracking;

CREATE POLICY "Users can view KPIs with module permission"
ON kpi_tracking
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'kpis'::app_module, 'user'::app_role));

-- Export Opportunities (Market Development)
DROP POLICY IF EXISTS "Users can view opportunities with access" ON export_opportunities;

CREATE POLICY "Users can view opportunities with module permission"
ON export_opportunities
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'market_development'::app_module, 'user'::app_role));

-- Business Connections
DROP POLICY IF EXISTS "Users can view connections with access" ON business_connections;

CREATE POLICY "Users can view connections with module permission"
ON business_connections
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'market_development'::app_module, 'user'::app_role));

-- Potential Markets
DROP POLICY IF EXISTS "Users can view markets with access" ON potential_markets;

CREATE POLICY "Users can view markets with module permission"
ON potential_markets
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'market_development'::app_module, 'user'::app_role));

-- Market Statistics
DROP POLICY IF EXISTS "Users can view statistics with access" ON market_statistics;

CREATE POLICY "Users can view statistics with module permission"
ON market_statistics
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'market_development'::app_module, 'user'::app_role));

-- Imputations: Supprimer la politique trop permissive
DROP POLICY IF EXISTS "Users can view imputations with access" ON imputations;

CREATE POLICY "Users can view imputations with module permission"
ON imputations
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'imputations'::app_module, 'user'::app_role));

-- Tasks (Collaborators module)
DROP POLICY IF EXISTS "Users can view their tasks" ON tasks;
DROP POLICY IF EXISTS "Managers can view all tasks" ON tasks;

CREATE POLICY "Users can view tasks with module permission"
ON tasks
FOR SELECT
TO authenticated
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by OR 
  has_any_module_permission(auth.uid(), 'collaborators'::app_module, 'manager'::app_role)
);