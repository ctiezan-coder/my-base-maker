-- Créer une table pour les pièces jointes des ordres de mission
CREATE TABLE IF NOT EXISTS public.mission_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_order_id uuid NOT NULL REFERENCES public.mission_orders(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  file_type text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_mission_attachments_mission_order_id ON public.mission_attachments(mission_order_id);

-- Activer RLS
ALTER TABLE public.mission_attachments ENABLE ROW LEVEL SECURITY;

-- Politique SELECT: Tout utilisateur authentifié peut voir les pièces jointes
CREATE POLICY "Users can view mission attachments"
ON public.mission_attachments
FOR SELECT
TO authenticated
USING (true);

-- Politique INSERT: Tout utilisateur authentifié peut ajouter des pièces jointes
CREATE POLICY "Users can add mission attachments"
ON public.mission_attachments
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Politique DELETE: Seul l'uploader ou les admin/manager peuvent supprimer
CREATE POLICY "Users can delete their own attachments"
ON public.mission_attachments
FOR DELETE
TO authenticated
USING (
  auth.uid() = uploaded_by 
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'manager')
);

-- Créer un bucket de stockage pour les pièces jointes des missions
INSERT INTO storage.buckets (id, name, public)
VALUES ('mission-attachments', 'mission-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage pour les pièces jointes de missions
CREATE POLICY "Users can view mission attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'mission-attachments');

CREATE POLICY "Users can upload mission attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mission-attachments');

CREATE POLICY "Users can delete their own attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'mission-attachments' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'manager')
  )
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_mission_attachments_updated_at
BEFORE UPDATE ON public.mission_attachments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();