-- Create enum for market regions
CREATE TYPE market_region AS ENUM (
  'Europe',
  'Afrique',
  'ZLECAf',
  'Asie',
  'Moyen-Orient',
  'Amérique du Nord',
  'Amérique du Sud'
);

-- Create enum for risk levels
CREATE TYPE risk_level AS ENUM (
  'Faible',
  'Modéré',
  'Élevé'
);

-- Create enum for opportunity status
CREATE TYPE opportunity_status AS ENUM (
  'URGENT',
  'NOUVEAU',
  'RECOMMANDÉ',
  'EN_COURS',
  'FERMÉ'
);

-- Create enum for connection status
CREATE TYPE connection_status AS ENUM (
  'En négociation',
  'Contrat signé',
  'En cours',
  'Terminé'
);

-- Create table for potential markets
CREATE TABLE public.potential_markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region market_region NOT NULL,
  country TEXT NOT NULL,
  sector TEXT NOT NULL,
  market_potential TEXT NOT NULL, -- 'Élevé', 'Très Élevé', 'Croissant', 'Émergent'
  demand_description TEXT,
  key_products TEXT[],
  requirements TEXT[],
  risk_level risk_level DEFAULT 'Modéré',
  market_size_billion NUMERIC,
  growth_rate NUMERIC,
  direction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for export opportunities
CREATE TABLE public.export_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  sector TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  destination_city TEXT,
  region market_region NOT NULL,
  estimated_value NUMERIC NOT NULL,
  currency TEXT DEFAULT '€',
  compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  deadline DATE NOT NULL,
  volume TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  status opportunity_status DEFAULT 'NOUVEAU',
  direction_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for business connections/partnerships (mises en relation)
CREATE TABLE public.business_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  pme_name TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  contract_value NUMERIC NOT NULL,
  currency TEXT DEFAULT '€',
  status connection_status NOT NULL DEFAULT 'En négociation',
  contract_duration_years INTEGER,
  jobs_created INTEGER,
  social_impact TEXT,
  direction_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for market statistics
CREATE TABLE public.market_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  export_value_billions NUMERIC NOT NULL,
  intra_african_trade_percent NUMERIC,
  pme_count INTEGER,
  active_markets INTEGER,
  business_connections_count INTEGER,
  conversion_rate NUMERIC,
  total_value_generated NUMERIC,
  average_deal_days INTEGER,
  direction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.potential_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for potential_markets
CREATE POLICY "Users can view markets from their direction"
ON public.potential_markets FOR SELECT
USING (
  direction_id IN (
    SELECT d.id FROM directions d
    JOIN profiles p ON p.direction = d.name
    WHERE p.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Managers can manage markets"
ON public.potential_markets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- RLS Policies for export_opportunities
CREATE POLICY "Users can view opportunities from their direction"
ON public.export_opportunities FOR SELECT
USING (
  direction_id IN (
    SELECT d.id FROM directions d
    JOIN profiles p ON p.direction = d.name
    WHERE p.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Managers can manage opportunities"
ON public.export_opportunities FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- RLS Policies for business_connections
CREATE POLICY "Users can view connections from their direction"
ON public.business_connections FOR SELECT
USING (
  direction_id IN (
    SELECT d.id FROM directions d
    JOIN profiles p ON p.direction = d.name
    WHERE p.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Managers can manage connections"
ON public.business_connections FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- RLS Policies for market_statistics
CREATE POLICY "Users can view statistics from their direction"
ON public.market_statistics FOR SELECT
USING (
  direction_id IN (
    SELECT d.id FROM directions d
    JOIN profiles p ON p.direction = d.name
    WHERE p.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Managers can manage statistics"
ON public.market_statistics FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_potential_markets_updated_at
BEFORE UPDATE ON public.potential_markets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_export_opportunities_updated_at
BEFORE UPDATE ON public.export_opportunities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_connections_updated_at
BEFORE UPDATE ON public.business_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_statistics_updated_at
BEFORE UPDATE ON public.market_statistics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();