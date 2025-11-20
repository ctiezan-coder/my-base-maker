-- Mettre à jour la politique RLS SELECT pour media_content
-- Le Service Communication doit voir tous les médias pour les traiter

DROP POLICY IF EXISTS "Users can view media with access" ON media_content;

CREATE POLICY "Users can view media with access"
ON media_content
FOR SELECT
USING (
  -- Les utilisateurs du Service Communication voient tous les médias
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.direction_id = (
      SELECT id FROM directions WHERE name = 'Service Communication' LIMIT 1
    )
  ))
  OR
  -- Les autres utilisateurs voient les médias de leur direction
  user_has_direction_access(auth.uid(), direction_id) 
  OR 
  -- Les admins voient tout
  has_role(auth.uid(), 'admin'::app_role)
);