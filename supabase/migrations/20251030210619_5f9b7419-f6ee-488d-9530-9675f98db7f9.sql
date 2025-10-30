-- Table des entreprises exportatrices
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identité entreprise
  company_name TEXT NOT NULL,
  trade_name TEXT,
  rccm_number TEXT NOT NULL,
  dfe_number TEXT NOT NULL,
  legal_form company_legal_form,
  company_size company_size,
  creation_date DATE,
  
  -- Localisation
  headquarters_location TEXT NOT NULL,
  postal_address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Représentant légal
  legal_representative_name TEXT,
  legal_representative_gender gender,
  legal_representative_phone TEXT,
  legal_representative_email TEXT,
  
  -- Service export
  has_export_service BOOLEAN DEFAULT false,
  export_manager_name TEXT,
  export_manager_phone TEXT,
  export_manager_email TEXT,
  
  -- Activité
  activity_sector TEXT,
  products_services TEXT,
  exported_products TEXT,
  current_export_markets TEXT[],
  target_export_markets TEXT[],
  annual_turnover NUMERIC,
  
  -- Certifications et participation
  certifications TEXT[],
  commercial_events_participation participation_type DEFAULT 'Jamais',
  
  -- Accompagnement
  support_needed support_type,
  aciex_interaction_history TEXT,
  accompaniment_status TEXT,
  
  -- Métadonnées
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  direction_id UUID
);

-- Table des formations
CREATE TABLE public.trainings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  training_type training_type NOT NULL,
  
  -- Dates et lieu
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  
  -- Capacité
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  
  -- Formateurs
  trainer_ids UUID[],
  
  -- Métadonnées
  direction_id UUID NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des inscriptions aux formations
CREATE TABLE public.training_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID NOT NULL,
  company_id UUID,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  participant_phone TEXT,
  participant_position TEXT,
  
  -- Statut
  status registration_status DEFAULT 'En attente',
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Évaluation
  attended BOOLEAN,
  evaluation_score NUMERIC,
  evaluation_comments TEXT,
  certificate_issued BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des formateurs/personnes ressources
CREATE TABLE public.trainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  specialization TEXT,
  bio TEXT,
  organization TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des contenus médias
CREATE TABLE public.media_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  media_type media_type NOT NULL,
  file_url TEXT,
  file_size BIGINT,
  
  -- Métadonnées
  direction_id UUID NOT NULL,
  priority_level priority_level DEFAULT '5',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Améliorer la table documents existante
ALTER TABLE public.documents 
  ADD COLUMN IF NOT EXISTS priority_level priority_level DEFAULT '3',
  ADD COLUMN IF NOT EXISTS document_category document_category;

-- Améliorer la table partnerships
ALTER TABLE public.partnerships
  ADD COLUMN IF NOT EXISTS contact_person TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS budget NUMERIC,
  ADD COLUMN IF NOT EXISTS priority_level priority_level DEFAULT '1';

-- Améliorer la table projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS rccm_number TEXT,
  ADD COLUMN IF NOT EXISTS dfe_number TEXT,
  ADD COLUMN IF NOT EXISTS priority_level priority_level DEFAULT '3';

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour companies
CREATE POLICY "Admins and managers can manage companies"
  ON public.companies FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Users can view companies from their direction"
  ON public.companies FOR SELECT
  USING (
    direction_id IN (
      SELECT d.id FROM directions d
      JOIN profiles p ON p.direction = d.name
      WHERE p.user_id = auth.uid()
    ) OR 
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies pour trainings
CREATE POLICY "Managers can manage trainings"
  ON public.trainings FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Users can view trainings from their direction"
  ON public.trainings FOR SELECT
  USING (
    direction_id IN (
      SELECT d.id FROM directions d
      JOIN profiles p ON p.direction = d.name
      WHERE p.user_id = auth.uid()
    ) OR 
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies pour training_registrations
CREATE POLICY "Anyone authenticated can register"
  ON public.training_registrations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their registrations"
  ON public.training_registrations FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies 
      WHERE created_by = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Managers can update registrations"
  ON public.training_registrations FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- RLS Policies pour trainers
CREATE POLICY "Everyone can view trainers"
  ON public.trainers FOR SELECT
  USING (true);

CREATE POLICY "Admins and managers can manage trainers"
  ON public.trainers FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- RLS Policies pour media_content
CREATE POLICY "Users can view media from their direction"
  ON public.media_content FOR SELECT
  USING (
    (priority_level = '5' AND direction_id IN (
      SELECT d.id FROM directions d
      JOIN profiles p ON p.direction = d.name
      WHERE p.user_id = auth.uid()
    )) OR
    (priority_level IN ('1', '3')) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Managers can manage media"
  ON public.media_content FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Triggers pour updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at
  BEFORE UPDATE ON public.trainings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_registrations_updated_at
  BEFORE UPDATE ON public.training_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trainers_updated_at
  BEFORE UPDATE ON public.trainers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_content_updated_at
  BEFORE UPDATE ON public.media_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();