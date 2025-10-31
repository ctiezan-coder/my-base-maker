-- Supprimer l'ancienne politique qui manque la clause WITH CHECK
DROP POLICY IF EXISTS "Managers can manage folders" ON public.folders;

-- Créer la politique corrigée avec WITH CHECK pour les insertions
CREATE POLICY "Managers can manage folders"
  ON public.folders
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  );