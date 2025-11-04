-- Create table for opportunity applications (candidatures)
CREATE TABLE public.opportunity_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.export_opportunities(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  application_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'En attente', -- 'En attente', 'Acceptée', 'Refusée'
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(opportunity_id, company_id)
);

-- Create table for company market interests
CREATE TABLE public.company_market_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES public.potential_markets(id) ON DELETE CASCADE,
  interest_level TEXT DEFAULT 'Intéressé', -- 'Intéressé', 'Très intéressé', 'En contact'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, market_id)
);

-- Enable RLS
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_market_interests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for opportunity_applications
CREATE POLICY "Users can view applications from their companies"
ON public.opportunity_applications FOR SELECT
USING (
  company_id IN (
    SELECT id FROM companies WHERE created_by = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Users can create applications for their companies"
ON public.opportunity_applications FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT id FROM companies WHERE created_by = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can update applications"
ON public.opportunity_applications FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers can delete applications"
ON public.opportunity_applications FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- RLS Policies for company_market_interests
CREATE POLICY "Users can view interests from their companies"
ON public.company_market_interests FOR SELECT
USING (
  company_id IN (
    SELECT id FROM companies WHERE created_by = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Users can create interests for their companies"
ON public.company_market_interests FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT id FROM companies WHERE created_by = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Users can update their company interests"
ON public.company_market_interests FOR UPDATE
USING (
  company_id IN (
    SELECT id FROM companies WHERE created_by = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Users can delete their company interests"
ON public.company_market_interests FOR DELETE
USING (
  company_id IN (
    SELECT id FROM companies WHERE created_by = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
);

-- Create triggers
CREATE TRIGGER update_opportunity_applications_updated_at
BEFORE UPDATE ON public.opportunity_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_market_interests_updated_at
BEFORE UPDATE ON public.company_market_interests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_opportunity_applications_company ON public.opportunity_applications(company_id);
CREATE INDEX idx_opportunity_applications_opportunity ON public.opportunity_applications(opportunity_id);
CREATE INDEX idx_company_market_interests_company ON public.company_market_interests(company_id);
CREATE INDEX idx_company_market_interests_market ON public.company_market_interests(market_id);