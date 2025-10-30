-- Supprimer les anciennes politiques qui dépendent de profiles.role
DROP POLICY IF EXISTS "Admins can manage directions" ON public.directions;
DROP POLICY IF EXISTS "Users can view documents from their direction" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view projects from their direction" ON public.projects;
DROP POLICY IF EXISTS "Managers can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view partnerships from their direction" ON public.partnerships;
DROP POLICY IF EXISTS "Managers can manage partnerships" ON public.partnerships;
DROP POLICY IF EXISTS "Users can view events from their direction" ON public.events;
DROP POLICY IF EXISTS "Managers can manage events" ON public.events;
DROP POLICY IF EXISTS "Users can view KPIs from their direction" ON public.kpi_tracking;
DROP POLICY IF EXISTS "Managers can manage KPIs" ON public.kpi_tracking;

-- Supprimer la colonne role de profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;

-- Créer les types énumérés
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');
CREATE TYPE public.company_legal_form AS ENUM ('SA', 'SARL', 'SAS', 'SASU', 'EI', 'GIE', 'Autre');
CREATE TYPE public.company_size AS ENUM ('TPE', 'PME', 'ETI', 'Grande entreprise');
CREATE TYPE public.gender AS ENUM ('Homme', 'Femme');
CREATE TYPE public.support_type AS ENUM ('Financier', 'Non financier', 'Les deux');
CREATE TYPE public.participation_type AS ENUM ('Foires', 'Salons', 'Jamais');
CREATE TYPE public.training_type AS ENUM ('Formation', 'Atelier', 'Coaching', 'Webinaire', 'Autre');
CREATE TYPE public.registration_status AS ENUM ('En attente', 'Confirmée', 'Annulée', 'Présent', 'Absent');
CREATE TYPE public.document_category AS ENUM (
  'Convention exportation',
  'Agrément',
  'Licence',
  'Texte légal',
  'Accord partenariat',
  'MoU',
  'Protocole collaboration',
  'Manuel',
  'Politique',
  'Procédure',
  'Formulaire',
  'Contrat PPP',
  'Contrat stage',
  'Fiche de poste',
  'Étude marché',
  'PTBA',
  'TDR',
  'Autre'
);
CREATE TYPE public.media_type AS ENUM (
  'Newsletter',
  'Magazine',
  'Création graphique',
  'Film institutionnel',
  'Reportage',
  'Capsule vidéo',
  'Photo',
  'Article presse',
  'Interview audio',
  'Autre'
);
CREATE TYPE public.priority_level AS ENUM ('1', '3', '5');

-- Table des rôles utilisateurs (séparée pour la sécurité)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction de vérification de rôle (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies pour user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Recréer les politiques pour directions avec has_role
CREATE POLICY "Admins can manage directions"
  ON public.directions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Recréer les politiques pour documents
CREATE POLICY "Users can view documents from their direction"
  ON public.documents FOR SELECT
  USING (
    direction_id IN (
      SELECT d.id FROM directions d
      JOIN profiles p ON p.direction = d.name
      WHERE p.user_id = auth.uid()
    ) OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can update own documents"
  ON public.documents FOR UPDATE
  USING (
    (auth.uid() = uploaded_by) OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Recréer les politiques pour projects
CREATE POLICY "Users can view projects from their direction"
  ON public.projects FOR SELECT
  USING (
    direction_id IN (
      SELECT d.id FROM directions d
      JOIN profiles p ON p.direction = d.name
      WHERE p.user_id = auth.uid()
    ) OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Managers can manage projects"
  ON public.projects FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Recréer les politiques pour partnerships
CREATE POLICY "Users can view partnerships from their direction"
  ON public.partnerships FOR SELECT
  USING (
    direction_id IN (
      SELECT d.id FROM directions d
      JOIN profiles p ON p.direction = d.name
      WHERE p.user_id = auth.uid()
    ) OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Managers can manage partnerships"
  ON public.partnerships FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Recréer les politiques pour events
CREATE POLICY "Users can view events from their direction"
  ON public.events FOR SELECT
  USING (
    direction_id IN (
      SELECT d.id FROM directions d
      JOIN profiles p ON p.direction = d.name
      WHERE p.user_id = auth.uid()
    ) OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Managers can manage events"
  ON public.events FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Recréer les politiques pour kpi_tracking
CREATE POLICY "Users can view KPIs from their direction"
  ON public.kpi_tracking FOR SELECT
  USING (
    direction_id IN (
      SELECT d.id FROM directions d
      JOIN profiles p ON p.direction = d.name
      WHERE p.user_id = auth.uid()
    ) OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Managers can manage KPIs"
  ON public.kpi_tracking FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Trigger pour créer automatiquement un rôle user lors de la création d'un profil
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_user_role_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();