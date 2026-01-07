-- Fix the "System can insert project history" policy that is overly permissive
DROP POLICY IF EXISTS "System can insert project history" ON project_history;

-- Create a more restrictive policy - only allow inserts from triggers or authenticated users
CREATE POLICY "Authenticated users can insert project history" ON project_history
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
  OR current_user = 'postgres'
);