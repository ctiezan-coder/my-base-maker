-- Créer une table pour la liste blanche des emails autorisés
CREATE TABLE IF NOT EXISTS public.allowed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Activer RLS
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Admins can manage allowed emails"
  ON public.allowed_emails
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Everyone can check if email is allowed"
  ON public.allowed_emails
  FOR SELECT
  USING (true);

-- Créer un index pour accélérer les recherches
CREATE INDEX idx_allowed_emails_email ON public.allowed_emails(email);

-- Fonction pour vérifier si un email est autorisé
CREATE OR REPLACE FUNCTION public.is_email_allowed(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM allowed_emails 
    WHERE LOWER(email) = LOWER(check_email)
  );
$$;

COMMENT ON TABLE public.allowed_emails IS 'Liste blanche des emails autorisés pour l''inscription';
COMMENT ON FUNCTION public.is_email_allowed IS 'Vérifie si un email est dans la liste blanche';