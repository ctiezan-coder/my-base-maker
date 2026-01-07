
-- =====================================================
-- INTERNATIONAL BUYERS TABLE
-- =====================================================
CREATE TABLE public.international_buyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  sector TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  position TEXT,
  purchase_volume TEXT,
  purchase_frequency TEXT,
  products_interested TEXT[],
  quality_requirements TEXT,
  certifications_required TEXT[],
  payment_terms TEXT,
  preferred_incoterms TEXT,
  website TEXT,
  notes TEXT,
  status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'contact_etabli', 'negociation', 'partenaire_actif', 'inactif')),
  last_contact_date DATE,
  created_by UUID REFERENCES auth.users(id),
  direction_id UUID REFERENCES public.directions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.international_buyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view international buyers" ON public.international_buyers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage international buyers" ON public.international_buyers
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- BUYER REQUESTS HISTORY
-- =====================================================
CREATE TABLE public.buyer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.international_buyers(id) ON DELETE CASCADE,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  products_requested TEXT[],
  volume_requested TEXT,
  value_estimated NUMERIC,
  currency TEXT DEFAULT 'EUR',
  deadline DATE,
  status TEXT DEFAULT 'nouvelle' CHECK (status IN ('nouvelle', 'en_cours', 'traitee', 'expiree')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.buyer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view buyer requests" ON public.buyer_requests
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage buyer requests" ON public.buyer_requests
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PRODUCT CATALOGS
-- =====================================================
CREATE TABLE public.product_catalogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  publish_date DATE,
  version TEXT DEFAULT '1.0',
  download_count INTEGER DEFAULT 0,
  direction_id UUID REFERENCES public.directions(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_catalogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published catalogs" ON public.product_catalogs
  FOR SELECT USING (is_published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage catalogs" ON public.product_catalogs
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- CATALOG PRODUCTS (EXPORT PRODUCTS SHOWCASE)
-- =====================================================
CREATE TABLE public.catalog_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_id UUID REFERENCES public.product_catalogs(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_code TEXT,
  hs_code TEXT,
  description TEXT,
  category TEXT,
  origin_region TEXT,
  company_id UUID REFERENCES public.companies(id),
  image_url TEXT,
  price_fob NUMERIC,
  price_cif NUMERIC,
  currency TEXT DEFAULT 'EUR',
  unit TEXT,
  min_order_quantity NUMERIC,
  production_capacity TEXT,
  packaging_details TEXT,
  certifications TEXT[],
  available_quantity NUMERIC,
  lead_time_days INTEGER,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view catalog products" ON public.catalog_products
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage catalog products" ON public.catalog_products
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- REGULATORY REQUIREMENTS (KNOWLEDGE BASE)
-- =====================================================
CREATE TABLE public.regulatory_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL,
  region TEXT,
  sector TEXT,
  product_category TEXT,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('certification', 'norme', 'phytosanitaire', 'sanitaire', 'douane', 'quotas', 'licence', 'autre')),
  title TEXT NOT NULL,
  description TEXT,
  mandatory BOOLEAN DEFAULT true,
  issuing_authority TEXT,
  authority_contact TEXT,
  authority_website TEXT,
  validity_period TEXT,
  cost_estimate NUMERIC,
  currency TEXT DEFAULT 'EUR',
  processing_time TEXT,
  documents_required TEXT[],
  useful_links TEXT[],
  notes TEXT,
  last_updated DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.regulatory_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view regulatory requirements" ON public.regulatory_requirements
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage regulatory requirements" ON public.regulatory_requirements
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TRADE MISSIONS
-- =====================================================
CREATE TABLE public.trade_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_name TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('mission_prospection', 'salon_international', 'foire', 'rencontre_b2b', 'visite_acheteurs', 'autre')),
  destination_country TEXT NOT NULL,
  destination_city TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  objectives TEXT,
  target_sectors TEXT[],
  budget_estimated NUMERIC,
  budget_actual NUMERIC,
  currency TEXT DEFAULT 'EUR',
  organizer TEXT,
  event_id UUID REFERENCES public.events(id),
  status TEXT DEFAULT 'planifiee' CHECK (status IN ('planifiee', 'en_cours', 'terminee', 'annulee')),
  results_contacts INTEGER DEFAULT 0,
  results_leads INTEGER DEFAULT 0,
  results_contracts INTEGER DEFAULT 0,
  results_value NUMERIC,
  report_summary TEXT,
  lessons_learned TEXT,
  direction_id UUID REFERENCES public.directions(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trade_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trade missions" ON public.trade_missions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage trade missions" ON public.trade_missions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TRADE MISSION PARTICIPANTS
-- =====================================================
CREATE TABLE public.trade_mission_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES public.trade_missions(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  participant_name TEXT NOT NULL,
  participant_email TEXT,
  participant_phone TEXT,
  participation_fee NUMERIC,
  is_paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trade_mission_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mission participants" ON public.trade_mission_participants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage mission participants" ON public.trade_mission_participants
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- MARKET COUNTRY ANALYSIS
-- =====================================================
CREATE TABLE public.market_country_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL UNIQUE,
  region TEXT,
  population BIGINT,
  gdp_billion NUMERIC,
  gdp_growth_percent NUMERIC,
  inflation_percent NUMERIC,
  currency TEXT,
  official_languages TEXT[],
  trade_agreements TEXT[],
  ease_of_business_rank INTEGER,
  import_value_billion NUMERIC,
  main_imports TEXT[],
  main_trading_partners TEXT[],
  tariff_average_percent NUMERIC,
  non_tariff_barriers TEXT,
  market_opportunities TEXT,
  market_challenges TEXT,
  recommended_sectors TEXT[],
  ci_export_potential TEXT,
  key_contacts TEXT,
  useful_resources TEXT[],
  notes TEXT,
  last_updated DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.market_country_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view market analysis" ON public.market_country_analysis
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage market analysis" ON public.market_country_analysis
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- EXPORT PERFORMANCE KPIs
-- =====================================================
CREATE TABLE public.export_performance_kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period DATE NOT NULL,
  direction_id UUID REFERENCES public.directions(id),
  opportunities_identified INTEGER DEFAULT 0,
  opportunities_shared INTEGER DEFAULT 0,
  opportunities_concluded INTEGER DEFAULT 0,
  conversion_rate NUMERIC,
  total_contract_value NUMERIC,
  currency TEXT DEFAULT 'EUR',
  b2b_connections_made INTEGER DEFAULT 0,
  successful_connections INTEGER DEFAULT 0,
  missions_organized INTEGER DEFAULT 0,
  mission_participants INTEGER DEFAULT 0,
  buyers_contacted INTEGER DEFAULT 0,
  new_markets_accessed INTEGER DEFAULT 0,
  top_sectors TEXT[],
  top_countries TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(period, direction_id)
);

ALTER TABLE public.export_performance_kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view export KPIs" ON public.export_performance_kpis
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage export KPIs" ON public.export_performance_kpis
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_international_buyers_country ON public.international_buyers(country);
CREATE INDEX idx_international_buyers_sector ON public.international_buyers(sector);
CREATE INDEX idx_international_buyers_status ON public.international_buyers(status);

CREATE INDEX idx_catalog_products_catalog ON public.catalog_products(catalog_id);
CREATE INDEX idx_catalog_products_company ON public.catalog_products(company_id);
CREATE INDEX idx_catalog_products_category ON public.catalog_products(category);

CREATE INDEX idx_regulatory_requirements_country ON public.regulatory_requirements(country);
CREATE INDEX idx_regulatory_requirements_sector ON public.regulatory_requirements(sector);
CREATE INDEX idx_regulatory_requirements_type ON public.regulatory_requirements(requirement_type);

CREATE INDEX idx_trade_missions_country ON public.trade_missions(destination_country);
CREATE INDEX idx_trade_missions_dates ON public.trade_missions(start_date, end_date);
CREATE INDEX idx_trade_missions_status ON public.trade_missions(status);

CREATE INDEX idx_market_country_analysis_region ON public.market_country_analysis(region);

CREATE INDEX idx_export_performance_kpis_period ON public.export_performance_kpis(period);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_international_buyers_updated_at
  BEFORE UPDATE ON public.international_buyers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_catalogs_updated_at
  BEFORE UPDATE ON public.product_catalogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_catalog_products_updated_at
  BEFORE UPDATE ON public.catalog_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regulatory_requirements_updated_at
  BEFORE UPDATE ON public.regulatory_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trade_missions_updated_at
  BEFORE UPDATE ON public.trade_missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_country_analysis_updated_at
  BEFORE UPDATE ON public.market_country_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_export_performance_kpis_updated_at
  BEFORE UPDATE ON public.export_performance_kpis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
