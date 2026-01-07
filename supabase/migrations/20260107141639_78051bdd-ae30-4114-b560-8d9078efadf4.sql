-- ============================================
-- ENHANCED PARTNERSHIPS MODULE
-- ============================================

-- Add new columns to partnerships table
ALTER TABLE public.partnerships
ADD COLUMN IF NOT EXISTS partner_country TEXT,
ADD COLUMN IF NOT EXISTS partner_sector TEXT,
ADD COLUMN IF NOT EXISTS partner_website TEXT,
ADD COLUMN IF NOT EXISTS partner_logo_url TEXT,
ADD COLUMN IF NOT EXISTS organization_type TEXT,
ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT DEFAULT 'identification',
ADD COLUMN IF NOT EXISTS signature_date DATE,
ADD COLUMN IF NOT EXISTS renewal_conditions TEXT,
ADD COLUMN IF NOT EXISTS strategic_objectives TEXT,
ADD COLUMN IF NOT EXISTS domains TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_beneficiaries TEXT,
ADD COLUMN IF NOT EXISTS expected_results TEXT,
ADD COLUMN IF NOT EXISTS kpi_indicators JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS aciex_responsibilities TEXT,
ADD COLUMN IF NOT EXISTS partner_responsibilities TEXT,
ADD COLUMN IF NOT EXISTS resources_provided TEXT,
ADD COLUMN IF NOT EXISTS deliverables_schedule TEXT,
ADD COLUMN IF NOT EXISTS confidentiality_clauses TEXT,
ADD COLUMN IF NOT EXISTS partner_contribution NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS in_kind_contribution TEXT,
ADD COLUMN IF NOT EXISTS disbursement_terms TEXT,
ADD COLUMN IF NOT EXISTS aciex_focal_point TEXT,
ADD COLUMN IF NOT EXISTS aciex_focal_email TEXT,
ADD COLUMN IF NOT EXISTS aciex_focal_phone TEXT,
ADD COLUMN IF NOT EXISTS communication_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS last_contact_date DATE,
ADD COLUMN IF NOT EXISTS satisfaction_level INTEGER,
ADD COLUMN IF NOT EXISTS efficiency_score INTEGER,
ADD COLUMN IF NOT EXISTS mid_term_evaluation TEXT,
ADD COLUMN IF NOT EXISTS final_evaluation TEXT,
ADD COLUMN IF NOT EXISTS renewal_notes TEXT,
ADD COLUMN IF NOT EXISTS termination_reason TEXT,
ADD COLUMN IF NOT EXISTS closure_notes TEXT,
ADD COLUMN IF NOT EXISTS reference_code TEXT;

-- Create partnership activities table
CREATE TABLE IF NOT EXISTS public.partnership_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL,
  location TEXT,
  participants_count INTEGER,
  budget_used NUMERIC,
  status TEXT DEFAULT 'planifiée',
  notes TEXT,
  event_id UUID REFERENCES public.events(id),
  training_id UUID REFERENCES public.trainings(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partnership documents table for versioning
CREATE TABLE IF NOT EXISTS public.partnership_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES public.partnership_documents(id),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partnership meetings table
CREATE TABLE IF NOT EXISTS public.partnership_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  agenda TEXT,
  minutes TEXT,
  attendees TEXT[],
  action_items JSONB DEFAULT '[]',
  next_meeting_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partnership actions tracking table
CREATE TABLE IF NOT EXISTS public.partnership_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.partnership_meetings(id),
  action_description TEXT NOT NULL,
  responsible TEXT,
  due_date DATE,
  status TEXT DEFAULT 'en attente',
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partnership alerts table
CREATE TABLE IF NOT EXISTS public.partnership_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  alert_date DATE NOT NULL,
  message TEXT NOT NULL,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partnership contacts table
CREATE TABLE IF NOT EXISTS public.partnership_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  position TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partnership financial tracking table
CREATE TABLE IF NOT EXISTS public.partnership_finances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT,
  source TEXT,
  receipt_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.partnership_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_finances ENABLE ROW LEVEL SECURITY;

-- RLS policies for partnership_activities
CREATE POLICY "Users can view partnership activities" ON public.partnership_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND user_has_direction_access(auth.uid(), p.direction_id)
    )
  );

CREATE POLICY "Managers can manage partnership activities" ON public.partnership_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND has_any_module_permission(auth.uid(), 'partnerships', 'manager')
    )
  );

-- RLS policies for partnership_documents
CREATE POLICY "Users can view partnership documents" ON public.partnership_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND user_has_direction_access(auth.uid(), p.direction_id)
    )
  );

CREATE POLICY "Managers can manage partnership documents" ON public.partnership_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND has_any_module_permission(auth.uid(), 'partnerships', 'manager')
    )
  );

-- RLS policies for partnership_meetings
CREATE POLICY "Users can view partnership meetings" ON public.partnership_meetings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND user_has_direction_access(auth.uid(), p.direction_id)
    )
  );

CREATE POLICY "Managers can manage partnership meetings" ON public.partnership_meetings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND has_any_module_permission(auth.uid(), 'partnerships', 'manager')
    )
  );

-- RLS policies for partnership_actions
CREATE POLICY "Users can view partnership actions" ON public.partnership_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      JOIN public.partnership_meetings m ON m.partnership_id = p.id OR partnership_actions.partnership_id = p.id
      WHERE user_has_direction_access(auth.uid(), p.direction_id)
    )
  );

CREATE POLICY "Managers can manage partnership actions" ON public.partnership_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND has_any_module_permission(auth.uid(), 'partnerships', 'manager')
    )
  );

-- RLS policies for partnership_alerts
CREATE POLICY "Users can view partnership alerts" ON public.partnership_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND user_has_direction_access(auth.uid(), p.direction_id)
    )
  );

CREATE POLICY "Managers can manage partnership alerts" ON public.partnership_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND has_any_module_permission(auth.uid(), 'partnerships', 'manager')
    )
  );

-- RLS policies for partnership_contacts
CREATE POLICY "Users can view partnership contacts" ON public.partnership_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND user_has_direction_access(auth.uid(), p.direction_id)
    )
  );

CREATE POLICY "Managers can manage partnership contacts" ON public.partnership_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND has_any_module_permission(auth.uid(), 'partnerships', 'manager')
    )
  );

-- RLS policies for partnership_finances
CREATE POLICY "Users can view partnership finances" ON public.partnership_finances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND user_has_direction_access(auth.uid(), p.direction_id)
    )
  );

CREATE POLICY "Managers can manage partnership finances" ON public.partnership_finances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p 
      WHERE p.id = partnership_id 
      AND has_any_module_permission(auth.uid(), 'partnerships', 'manager')
    )
  );

-- Function to generate partnership reference code
CREATE OR REPLACE FUNCTION public.generate_partnership_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
  new_code TEXT;
BEGIN
  IF NEW.reference_code IS NULL THEN
    year_str := to_char(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference_code FROM 'PART-' || year_str || '-(\d+)') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.partnerships
    WHERE reference_code LIKE 'PART-' || year_str || '-%';
    NEW.reference_code := 'PART-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate partnership code
DROP TRIGGER IF EXISTS generate_partnership_code_trigger ON public.partnerships;
CREATE TRIGGER generate_partnership_code_trigger
  BEFORE INSERT ON public.partnerships
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_partnership_code();

-- Function to create expiry alerts
CREATE OR REPLACE FUNCTION public.check_partnership_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 6 months alert
  IF NEW.end_date IS NOT NULL AND NEW.end_date - INTERVAL '6 months' <= CURRENT_DATE 
     AND NEW.end_date - INTERVAL '6 months' > CURRENT_DATE - INTERVAL '1 day' THEN
    INSERT INTO public.partnership_alerts (partnership_id, alert_type, alert_date, message)
    VALUES (NEW.id, 'expiry_6_months', CURRENT_DATE, 
      'Le partenariat avec ' || NEW.partner_name || ' expire dans 6 mois');
  END IF;
  
  -- 3 months alert
  IF NEW.end_date IS NOT NULL AND NEW.end_date - INTERVAL '3 months' <= CURRENT_DATE 
     AND NEW.end_date - INTERVAL '3 months' > CURRENT_DATE - INTERVAL '1 day' THEN
    INSERT INTO public.partnership_alerts (partnership_id, alert_type, alert_date, message)
    VALUES (NEW.id, 'expiry_3_months', CURRENT_DATE, 
      'Le partenariat avec ' || NEW.partner_name || ' expire dans 3 mois');
  END IF;
  
  -- 1 month alert
  IF NEW.end_date IS NOT NULL AND NEW.end_date - INTERVAL '1 month' <= CURRENT_DATE 
     AND NEW.end_date - INTERVAL '1 month' > CURRENT_DATE - INTERVAL '1 day' THEN
    INSERT INTO public.partnership_alerts (partnership_id, alert_type, alert_date, message)
    VALUES (NEW.id, 'expiry_1_month', CURRENT_DATE, 
      'Le partenariat avec ' || NEW.partner_name || ' expire dans 1 mois');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for expiry check on update
DROP TRIGGER IF EXISTS check_partnership_expiry_trigger ON public.partnerships;
CREATE TRIGGER check_partnership_expiry_trigger
  AFTER INSERT OR UPDATE ON public.partnerships
  FOR EACH ROW
  EXECUTE FUNCTION public.check_partnership_expiry();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partnership_activities_partnership ON public.partnership_activities(partnership_id);
CREATE INDEX IF NOT EXISTS idx_partnership_documents_partnership ON public.partnership_documents(partnership_id);
CREATE INDEX IF NOT EXISTS idx_partnership_meetings_partnership ON public.partnership_meetings(partnership_id);
CREATE INDEX IF NOT EXISTS idx_partnership_actions_partnership ON public.partnership_actions(partnership_id);
CREATE INDEX IF NOT EXISTS idx_partnership_alerts_partnership ON public.partnership_alerts(partnership_id);
CREATE INDEX IF NOT EXISTS idx_partnership_contacts_partnership ON public.partnership_contacts(partnership_id);
CREATE INDEX IF NOT EXISTS idx_partnership_finances_partnership ON public.partnership_finances(partnership_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_lifecycle ON public.partnerships(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON public.partnerships(status);