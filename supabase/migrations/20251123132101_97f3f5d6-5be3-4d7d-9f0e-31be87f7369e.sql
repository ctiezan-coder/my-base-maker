-- Ajouter une politique RLS pour permettre aux utilisateurs authentifiés de voir les autres profils pour la messagerie
DROP POLICY IF EXISTS "Users can view other profiles for messaging" ON public.profiles;

CREATE POLICY "Users can view other profiles for messaging"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND account_status = 'approved'
);