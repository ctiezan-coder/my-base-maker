-- Table pour les partages de dossiers et documents
CREATE TABLE public.document_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Type d'élément partagé: 'folder' ou 'document'
  item_type TEXT NOT NULL CHECK (item_type IN ('folder', 'document')),
  -- ID de l'élément partagé
  item_id UUID NOT NULL,
  -- Utilisateur qui partage
  shared_by UUID NOT NULL,
  -- Utilisateur avec qui on partage
  shared_with UUID NOT NULL,
  -- Niveau de permission: 'view' ou 'edit'
  permission_level TEXT NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'edit')),
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Contrainte d'unicité
  UNIQUE(item_type, item_id, shared_with)
);

-- Index pour les performances
CREATE INDEX idx_document_shares_item ON public.document_shares(item_type, item_id);
CREATE INDEX idx_document_shares_shared_with ON public.document_shares(shared_with);
CREATE INDEX idx_document_shares_shared_by ON public.document_shares(shared_by);

-- Enable RLS
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir les partages qui les concernent (partagés par eux ou avec eux)
CREATE POLICY "Users can view their shares"
ON public.document_shares
FOR SELECT
USING (auth.uid() = shared_by OR auth.uid() = shared_with);

-- Policy: Les utilisateurs peuvent créer des partages pour leurs propres éléments
CREATE POLICY "Users can create shares for their items"
ON public.document_shares
FOR INSERT
WITH CHECK (auth.uid() = shared_by);

-- Policy: Les utilisateurs peuvent supprimer les partages qu'ils ont créés
CREATE POLICY "Users can delete their shares"
ON public.document_shares
FOR DELETE
USING (auth.uid() = shared_by);

-- Fonction pour vérifier si un utilisateur a accès à un document partagé
CREATE OR REPLACE FUNCTION public.has_document_access(doc_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM documents WHERE id = doc_id AND uploaded_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM document_shares 
    WHERE item_type = 'document' AND item_id = doc_id AND shared_with = auth.uid()
  ) OR EXISTS (
    -- Vérifier si le document est dans un dossier partagé
    SELECT 1 FROM documents d
    JOIN document_shares ds ON ds.item_type = 'folder' AND ds.item_id = d.folder_id
    WHERE d.id = doc_id AND ds.shared_with = auth.uid()
  );
END;
$$;

-- Fonction pour vérifier si un utilisateur a accès à un dossier partagé
CREATE OR REPLACE FUNCTION public.has_folder_access(folder_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM folders WHERE id = folder_id AND created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM document_shares 
    WHERE item_type = 'folder' AND item_id = folder_id AND shared_with = auth.uid()
  );
END;
$$;