-- Mettre à jour les politiques RLS pour permettre aux utilisateurs de créer et voir leurs médias
DROP POLICY IF EXISTS "Managers can manage media" ON public.media_content;
DROP POLICY IF EXISTS "Users can view media with access" ON public.media_content;

-- Les managers et admins peuvent tout faire
CREATE POLICY "Managers can manage media" 
ON public.media_content 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Les utilisateurs peuvent créer des médias
CREATE POLICY "Users can create media" 
ON public.media_content 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Les utilisateurs peuvent voir les médias de leur direction
CREATE POLICY "Users can view media with access" 
ON public.media_content 
FOR SELECT 
USING (user_has_direction_access(auth.uid(), direction_id) OR has_role(auth.uid(), 'admin'));

-- Les utilisateurs peuvent modifier leurs propres médias
CREATE POLICY "Users can update own media" 
ON public.media_content 
FOR UPDATE 
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));