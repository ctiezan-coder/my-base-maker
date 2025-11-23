-- Supprimer l'ancienne politique restrictive pour la création de tâches
DROP POLICY IF EXISTS "Managers can create tasks" ON public.tasks;

-- Créer une nouvelle politique permettant à tous les utilisateurs authentifiés de créer des tâches
CREATE POLICY "Users can create tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Permettre aux utilisateurs de modifier leurs propres tâches et celles qui leur sont assignées
DROP POLICY IF EXISTS "Users can update their tasks" ON public.tasks;
CREATE POLICY "Users can update their own or assigned tasks" 
ON public.tasks 
FOR UPDATE 
USING (
  auth.uid() = assigned_to 
  OR auth.uid() = created_by 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- Permettre à tous les managers de supprimer les tâches (pas de changement)
-- Les utilisateurs ne peuvent supprimer que leurs propres tâches créées
DROP POLICY IF EXISTS "Managers can delete tasks" ON public.tasks;
CREATE POLICY "Users can delete own created tasks or managers can delete all" 
ON public.tasks 
FOR DELETE 
USING (
  auth.uid() = created_by 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
);