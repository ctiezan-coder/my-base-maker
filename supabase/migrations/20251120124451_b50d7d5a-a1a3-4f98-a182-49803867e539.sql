-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view directions" ON directions;

-- Create a new permissive policy that allows unauthenticated access
CREATE POLICY "Public can view directions"
ON directions
FOR SELECT
TO public
USING (true);