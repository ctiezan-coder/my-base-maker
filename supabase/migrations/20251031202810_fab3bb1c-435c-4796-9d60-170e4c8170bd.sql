-- Créer la table des dossiers pour l'organisation hiérarchique
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  direction_id UUID NOT NULL REFERENCES public.directions(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter folder_id aux documents
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_folders_parent ON public.folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_direction ON public.folders(direction_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON public.documents(folder_id);

-- Enable RLS sur folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Policies pour folders
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

CREATE POLICY "Managers can manage folders"
  ON public.folders
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  );

-- Créer un bucket de storage pour les documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policies pour le storage des documents
CREATE POLICY "Users can view documents from their direction"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their uploaded documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Managers can delete documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' AND
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  );

-- Trigger pour updated_at sur folders
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();