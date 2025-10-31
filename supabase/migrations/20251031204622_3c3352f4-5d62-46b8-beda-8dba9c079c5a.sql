-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Managers can manage folders" ON public.folders;
DROP POLICY IF EXISTS "Users can view folders from their direction" ON public.folders;

-- Politique pour la lecture
CREATE POLICY "Users can view folders from their direction"
  ON public.folders
  FOR SELECT
  USING (
    direction_id IN (
      SELECT d.id FROM directions d
      JOIN profiles p ON p.direction = d.name
      WHERE p.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Politique pour la création
CREATE POLICY "Users can create folders"
  ON public.folders
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'manager'::app_role)
      OR auth.uid() = created_by
    )
  );

-- Politique pour la mise à jour
CREATE POLICY "Managers can update folders"
  ON public.folders
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  );

-- Politique pour la suppression
CREATE POLICY "Managers can delete folders"
  ON public.folders
  FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  );