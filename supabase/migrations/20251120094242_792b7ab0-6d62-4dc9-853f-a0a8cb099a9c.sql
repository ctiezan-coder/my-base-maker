-- Ajouter les nouveaux champs pour le dialogue média
ALTER TABLE public.media_content
ADD COLUMN IF NOT EXISTS contexte_activite TEXT,
ADD COLUMN IF NOT EXISTS deroule TEXT,
ADD COLUMN IF NOT EXISTS parties_prenantes TEXT,
ADD COLUMN IF NOT EXISTS panelistes TEXT;