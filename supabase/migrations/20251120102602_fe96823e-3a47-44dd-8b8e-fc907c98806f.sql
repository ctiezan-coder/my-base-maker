-- Mettre à jour la politique RLS UPDATE pour media_content
-- Le Service Communication doit pouvoir modifier tous les médias (notamment le statut)

DROP POLICY IF EXISTS "Users can update own media" ON media_content;

CREATE POLICY "Users can update own media"
ON media_content
FOR UPDATE
USING (
  -- Les utilisateurs du Service Communication peuvent modifier tous les médias
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.direction_id = (
      SELECT id FROM directions WHERE name = 'Communication' LIMIT 1
    )
  ))
  OR
  -- Les utilisateurs peuvent modifier leurs propres médias
  (auth.uid() = created_by) 
  OR 
  -- Les admins/managers peuvent tout modifier
  has_role(auth.uid(), 'admin'::app_role) 
  OR 
  has_role(auth.uid(), 'manager'::app_role)
);