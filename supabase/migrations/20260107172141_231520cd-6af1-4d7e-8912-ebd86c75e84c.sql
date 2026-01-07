
-- =====================================================
-- MODULE OPÉRATEURS ENRICHI - Migration complète
-- Phases 1-4: Données de base, Performance, Accompagnement, Avancé
-- =====================================================

-- =====================================================
-- PHASE 1: ENRICHISSEMENT TABLE COMPANIES
-- =====================================================

-- Ajout des nouveaux champs pour identification étendue
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS sigle TEXT,
ADD COLUMN IF NOT EXISTS registration_date_aciex DATE,
ADD COLUMN IF NOT EXISTS legal_status TEXT DEFAULT 'Actif',
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS commune TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS gps_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS gps_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS main_contact_name TEXT,
ADD COLUMN IF NOT EXISTS main_contact_function TEXT,
ADD COLUMN IF NOT EXISTS main_contact_email TEXT,
ADD COLUMN IF NOT EXISTS main_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS sub_sector TEXT,
ADD COLUMN IF NOT EXISTS filiere TEXT,
ADD COLUMN IF NOT EXISTS hs_codes TEXT[],
ADD COLUMN IF NOT EXISTS product_ranges TEXT[],
ADD COLUMN IF NOT EXISTS annual_capacity DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS current_production DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS capacity_utilization_rate DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS production_equipment TEXT,
ADD COLUMN IF NOT EXISTS can_increase_capacity BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS production_lead_time_days INTEGER,
ADD COLUMN IF NOT EXISTS available_stock TEXT,
ADD COLUMN IF NOT EXISTS total_employees INTEGER,
ADD COLUMN IF NOT EXISTS permanent_employees INTEGER,
ADD COLUMN IF NOT EXISTS seasonal_employees INTEGER,
ADD COLUMN IF NOT EXISTS male_employees INTEGER,
ADD COLUMN IF NOT EXISTS female_employees INTEGER,
ADD COLUMN IF NOT EXISTS managers_count INTEGER,
ADD COLUMN IF NOT EXISTS technicians_count INTEGER,
ADD COLUMN IF NOT EXISTS workers_count INTEGER,
ADD COLUMN IF NOT EXISTS export_turnover DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS export_rate DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS market_share DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS turnover_evolution_3y JSONB,
ADD COLUMN IF NOT EXISTS distribution_channels TEXT[],
ADD COLUMN IF NOT EXISTS practiced_incoterms TEXT[],
ADD COLUMN IF NOT EXISTS export_barriers TEXT,
ADD COLUMN IF NOT EXISTS first_contact_date DATE,
ADD COLUMN IF NOT EXISTS accompaniment_start_date DATE,
ADD COLUMN IF NOT EXISTS assigned_aciex_officer TEXT,
ADD COLUMN IF NOT EXISTS assigned_aciex_officer_id UUID,
ADD COLUMN IF NOT EXISTS accompaniment_type TEXT,
ADD COLUMN IF NOT EXISTS export_maturity_level TEXT,
ADD COLUMN IF NOT EXISTS financial_needs TEXT,
ADD COLUMN IF NOT EXISTS technical_needs TEXT,
ADD COLUMN IF NOT EXISTS marketing_needs TEXT,
ADD COLUMN IF NOT EXISTS logistics_needs TEXT,
ADD COLUMN IF NOT EXISTS needs_priority TEXT,
ADD COLUMN IF NOT EXISTS specific_needs_details TEXT,
ADD COLUMN IF NOT EXISTS initial_diagnostic TEXT,
ADD COLUMN IF NOT EXISTS smart_objectives JSONB,
ADD COLUMN IF NOT EXISTS accompaniment_budget DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS company_category TEXT,
ADD COLUMN IF NOT EXISTS turnover_category TEXT,
ADD COLUMN IF NOT EXISTS growth_potential TEXT,
ADD COLUMN IF NOT EXISTS accompaniment_priority TEXT,
ADD COLUMN IF NOT EXISTS strategic_segment TEXT,
ADD COLUMN IF NOT EXISTS export_performance_score INTEGER,
ADD COLUMN IF NOT EXISTS quality_rating INTEGER,
ADD COLUMN IF NOT EXISTS capacity_rating INTEGER,
ADD COLUMN IF NOT EXISTS management_rating INTEGER,
ADD COLUMN IF NOT EXISTS engagement_rating INTEGER,
ADD COLUMN IF NOT EXISTS identified_risks TEXT,
ADD COLUMN IF NOT EXISTS global_risk_level TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS catalog_url TEXT;

-- =====================================================
-- TABLE: Sites de production secondaires
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  site_type TEXT NOT NULL DEFAULT 'production',
  site_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  region TEXT,
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Contacts par département
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  name TEXT NOT NULL,
  function TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Historique des changements de direction
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_leadership_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  leader_name TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  reason_for_change TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Produits détaillés
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_code TEXT,
  hs_code TEXT,
  category TEXT,
  product_range TEXT,
  description TEXT,
  unit TEXT,
  price_fob DECIMAL(15, 2),
  price_cif DECIMAL(15, 2),
  currency TEXT DEFAULT 'XOF',
  min_order_quantity DECIMAL(15, 2),
  production_capacity DECIMAL(15, 2),
  available_quantity DECIMAL(15, 2),
  is_exported BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  photo_url TEXT,
  is_new_development BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Certifications détaillées
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  certification_name TEXT NOT NULL,
  issuing_body TEXT,
  issue_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'Actif',
  certificate_number TEXT,
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Marchés et clients export
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_export_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  country TEXT NOT NULL,
  market_type TEXT DEFAULT 'current',
  market_share_percent DECIMAL(5, 2),
  annual_volume DECIMAL(15, 2),
  annual_value DECIMAL(15, 2),
  currency TEXT DEFAULT 'XOF',
  main_clients TEXT[],
  barriers_encountered TEXT,
  entry_date DATE,
  status TEXT DEFAULT 'Actif',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Historique d'accompagnement
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_accompaniment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  interaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  subject TEXT NOT NULL,
  description TEXT,
  outcome TEXT,
  next_steps TEXT,
  documents_shared TEXT[],
  officer_id UUID,
  officer_name TEXT,
  duration_minutes INTEGER,
  location TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Plan d'accompagnement personnalisé
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_accompaniment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_title TEXT NOT NULL,
  fiscal_year INTEGER,
  status TEXT DEFAULT 'En cours',
  start_date DATE,
  end_date DATE,
  initial_diagnostic TEXT,
  smart_objectives JSONB,
  aciex_services TEXT[],
  milestones JSONB,
  success_indicators JSONB,
  allocated_budget DECIMAL(15, 2),
  consumed_budget DECIMAL(15, 2),
  responsible_officer_id UUID,
  responsible_officer_name TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Actions planifiées d'accompagnement
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_accompaniment_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.company_accompaniment_plans(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  action_title TEXT NOT NULL,
  action_type TEXT,
  description TEXT,
  status TEXT DEFAULT 'Planifié',
  priority TEXT DEFAULT 'Normal',
  planned_date DATE,
  completed_date DATE,
  responsible_id UUID,
  responsible_name TEXT,
  estimated_cost DECIMAL(15, 2),
  actual_cost DECIMAL(15, 2),
  outcome TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Participations aux programmes ACIEX
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_program_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  program_type TEXT NOT NULL,
  program_name TEXT NOT NULL,
  program_id UUID,
  participation_date DATE,
  status TEXT DEFAULT 'Inscrit',
  role TEXT,
  benefits_obtained TEXT,
  contacts_made INTEGER,
  contracts_signed INTEGER,
  contract_value DECIMAL(15, 2),
  feedback TEXT,
  rating INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Success stories et témoignages
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  story_title TEXT NOT NULL,
  story_type TEXT DEFAULT 'success_story',
  content TEXT NOT NULL,
  key_results JSONB,
  contracts_concluded INTEGER,
  contract_total_value DECIMAL(15, 2),
  new_markets_entered TEXT[],
  export_increase_percent DECIMAL(5, 2),
  jobs_created INTEGER,
  testimonial_text TEXT,
  testimonial_author TEXT,
  testimonial_date DATE,
  media_urls TEXT[],
  video_url TEXT,
  is_published BOOLEAN DEFAULT false,
  publication_authorized BOOLEAN DEFAULT false,
  authorized_by TEXT,
  authorization_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Documents administratifs de l'entreprise
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  issue_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'Valide',
  notes TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Indicateurs de performance export
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_export_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  period TEXT,
  export_turnover DECIMAL(15, 2),
  export_volume DECIMAL(15, 2),
  number_of_markets INTEGER,
  new_markets INTEGER,
  number_of_contracts INTEGER,
  contracts_value DECIMAL(15, 2),
  number_of_clients INTEGER,
  new_clients INTEGER,
  client_retention_rate DECIMAL(5, 2),
  average_payment_delay_days INTEGER,
  complaint_rate DECIMAL(5, 2),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, fiscal_year, period)
);

-- =====================================================
-- TABLE: Évaluations et notations
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  evaluation_date DATE NOT NULL,
  evaluator_id UUID,
  evaluator_name TEXT,
  evaluation_type TEXT DEFAULT 'Annuelle',
  export_performance_score INTEGER,
  quality_rating INTEGER,
  production_capacity_rating INTEGER,
  management_rating INTEGER,
  financial_health_rating INTEGER,
  engagement_rating INTEGER,
  overall_score DECIMAL(5, 2),
  strengths TEXT,
  weaknesses TEXT,
  opportunities TEXT,
  threats TEXT,
  recommendations TEXT,
  next_evaluation_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Risques identifiés
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  risk_type TEXT NOT NULL,
  risk_description TEXT NOT NULL,
  probability TEXT DEFAULT 'Moyen',
  impact TEXT DEFAULT 'Moyen',
  risk_level TEXT DEFAULT 'Moyen',
  mitigation_actions TEXT,
  status TEXT DEFAULT 'Identifié',
  identified_date DATE,
  resolved_date DATE,
  responsible_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Communications envoyées
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  communication_type TEXT NOT NULL,
  channel TEXT DEFAULT 'email',
  subject TEXT NOT NULL,
  content TEXT,
  sent_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Envoyé',
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  response_received BOOLEAN DEFAULT false,
  response_date TIMESTAMPTZ,
  sent_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLE: Filtres sauvegardés par utilisateur
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  filter_name TEXT NOT NULL,
  filter_config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES pour performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_company_sites_company ON public.company_sites(company_id);
CREATE INDEX IF NOT EXISTS idx_company_contacts_company ON public.company_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_company_products_company ON public.company_products(company_id);
CREATE INDEX IF NOT EXISTS idx_company_certifications_company ON public.company_certifications(company_id);
CREATE INDEX IF NOT EXISTS idx_company_export_markets_company ON public.company_export_markets(company_id);
CREATE INDEX IF NOT EXISTS idx_company_accompaniment_history_company ON public.company_accompaniment_history(company_id);
CREATE INDEX IF NOT EXISTS idx_company_accompaniment_plans_company ON public.company_accompaniment_plans(company_id);
CREATE INDEX IF NOT EXISTS idx_company_accompaniment_actions_company ON public.company_accompaniment_actions(company_id);
CREATE INDEX IF NOT EXISTS idx_company_program_participations_company ON public.company_program_participations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_success_stories_company ON public.company_success_stories(company_id);
CREATE INDEX IF NOT EXISTS idx_company_documents_company ON public.company_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_company_export_kpis_company ON public.company_export_kpis(company_id);
CREATE INDEX IF NOT EXISTS idx_company_evaluations_company ON public.company_evaluations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_risks_company ON public.company_risks(company_id);
CREATE INDEX IF NOT EXISTS idx_company_communications_company ON public.company_communications(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_region ON public.companies(region);
CREATE INDEX IF NOT EXISTS idx_companies_strategic_segment ON public.companies(strategic_segment);
CREATE INDEX IF NOT EXISTS idx_companies_export_maturity ON public.companies(export_maturity_level);
CREATE INDEX IF NOT EXISTS idx_companies_accompaniment_status ON public.companies(accompaniment_status);

-- =====================================================
-- RLS Policies
-- =====================================================
ALTER TABLE public.company_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_leadership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_export_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_accompaniment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_accompaniment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_accompaniment_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_program_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_export_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_saved_filters ENABLE ROW LEVEL SECURITY;

-- Policies pour utilisateurs authentifiés
CREATE POLICY "Users can view company sites" ON public.company_sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage company sites" ON public.company_sites FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view company contacts" ON public.company_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage company contacts" ON public.company_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view leadership history" ON public.company_leadership_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage leadership history" ON public.company_leadership_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view company products" ON public.company_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage company products" ON public.company_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view company certifications" ON public.company_certifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage company certifications" ON public.company_certifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view export markets" ON public.company_export_markets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage export markets" ON public.company_export_markets FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view accompaniment history" ON public.company_accompaniment_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage accompaniment history" ON public.company_accompaniment_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view accompaniment plans" ON public.company_accompaniment_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage accompaniment plans" ON public.company_accompaniment_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view accompaniment actions" ON public.company_accompaniment_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage accompaniment actions" ON public.company_accompaniment_actions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view program participations" ON public.company_program_participations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage program participations" ON public.company_program_participations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view success stories" ON public.company_success_stories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage success stories" ON public.company_success_stories FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view company documents" ON public.company_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage company documents" ON public.company_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view export kpis" ON public.company_export_kpis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage export kpis" ON public.company_export_kpis FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view evaluations" ON public.company_evaluations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage evaluations" ON public.company_evaluations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view company risks" ON public.company_risks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage company risks" ON public.company_risks FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view communications" ON public.company_communications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage communications" ON public.company_communications FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own saved filters" ON public.company_saved_filters FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved filters" ON public.company_saved_filters FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
