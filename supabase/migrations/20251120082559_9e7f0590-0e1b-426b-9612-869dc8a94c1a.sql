-- Drop existing restrictive SELECT policies and create new ones that allow all authenticated users to view all data

-- business_connections
DROP POLICY IF EXISTS "Users can view connections from their direction" ON business_connections;
CREATE POLICY "Users can view all connections" ON business_connections
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- companies
DROP POLICY IF EXISTS "Users can view companies from their direction" ON companies;
CREATE POLICY "Users can view all companies" ON companies
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- documents
DROP POLICY IF EXISTS "Users can view documents from their direction" ON documents;
CREATE POLICY "Users can view all documents" ON documents
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- events
DROP POLICY IF EXISTS "Users can view events from their direction" ON events;
CREATE POLICY "Users can view all events" ON events
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- export_opportunities
DROP POLICY IF EXISTS "Users can view opportunities from their direction" ON export_opportunities;
CREATE POLICY "Users can view all opportunities" ON export_opportunities
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- folders
DROP POLICY IF EXISTS "Users can view folders from their direction" ON folders;
CREATE POLICY "Users can view all folders" ON folders
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- imputations
DROP POLICY IF EXISTS "Users can view imputations from their direction" ON imputations;
CREATE POLICY "Users can view all imputations" ON imputations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- kpi_tracking
DROP POLICY IF EXISTS "Users can view KPIs from their direction" ON kpi_tracking;
CREATE POLICY "Users can view all KPIs" ON kpi_tracking
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- market_statistics
DROP POLICY IF EXISTS "Users can view statistics from their direction" ON market_statistics;
CREATE POLICY "Users can view all statistics" ON market_statistics
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- media_content
DROP POLICY IF EXISTS "Users can view media from their direction" ON media_content;
CREATE POLICY "Users can view all media" ON media_content
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- partnerships
DROP POLICY IF EXISTS "Users can view partnerships from their direction" ON partnerships;
CREATE POLICY "Users can view all partnerships" ON partnerships
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- partnership_projects
DROP POLICY IF EXISTS "Users can view partnership_projects from their direction" ON partnership_projects;
CREATE POLICY "Users can view all partnership_projects" ON partnership_projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- potential_markets
DROP POLICY IF EXISTS "Users can view markets from their direction" ON potential_markets;
CREATE POLICY "Users can view all markets" ON potential_markets
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- project_tracking
DROP POLICY IF EXISTS "Users can view project tracking from their direction" ON project_tracking;
CREATE POLICY "Users can view all project tracking" ON project_tracking
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- projects
DROP POLICY IF EXISTS "Users can view projects from their direction" ON projects;
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- trainings
DROP POLICY IF EXISTS "Users can view trainings from their direction" ON trainings;
CREATE POLICY "Users can view all trainings" ON trainings
  FOR SELECT USING (auth.uid() IS NOT NULL);