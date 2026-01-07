-- Mise à jour de la table events avec tous les nouveaux champs
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS objectives TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS sectors TEXT[],
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Abidjan',
ADD COLUMN IF NOT EXISTS recurrence_type TEXT,
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planned',
ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'in_person',
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS venue TEXT,
ADD COLUMN IF NOT EXISTS full_address TEXT,
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS video_link TEXT,
ADD COLUMN IF NOT EXISTS access_instructions TEXT,
ADD COLUMN IF NOT EXISTS venue_map_url TEXT,
ADD COLUMN IF NOT EXISTS project_manager_id UUID,
ADD COLUMN IF NOT EXISTS budget_estimated DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS budget_actual DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS registration_deadline DATE,
ADD COLUMN IF NOT EXISTS registration_link TEXT,
ADD COLUMN IF NOT EXISTS is_registration_open BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS waitlist_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS require_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS program_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS satisfaction_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS total_participants_actual INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hashtag TEXT,
ADD COLUMN IF NOT EXISTS press_release_url TEXT,
ADD COLUMN IF NOT EXISTS social_media_links JSONB,
ADD COLUMN IF NOT EXISTS roi_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS contracts_value DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS leads_generated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS b2b_meetings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS media_coverage_value DECIMAL(15,2) DEFAULT 0;

-- Table pour l'équipe organisatrice
CREATE TABLE IF NOT EXISTS public.event_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_external BOOLEAN DEFAULT false,
  organization TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le programme détaillé par session
CREATE TABLE IF NOT EXISTS public.event_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  day_number INTEGER DEFAULT 1,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  room TEXT,
  session_type TEXT DEFAULT 'presentation',
  max_attendees INTEGER,
  is_break BOOLEAN DEFAULT false,
  is_parallel BOOLEAN DEFAULT false,
  materials_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les intervenants
CREATE TABLE IF NOT EXISTS public.event_speakers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.event_sessions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  bio TEXT,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  topics TEXT[],
  is_keynote BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mise à jour de la table event_participants avec les nouveaux champs
ALTER TABLE public.event_participants 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'visitor',
ADD COLUMN IF NOT EXISTS badge_printed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS badge_number TEXT,
ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS certificate_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS certificate_url TEXT,
ADD COLUMN IF NOT EXISTS dietary_requirements TEXT,
ADD COLUMN IF NOT EXISTS accessibility_needs TEXT,
ADD COLUMN IF NOT EXISTS hotel_reservation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS transport_needed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS waitlist_position INTEGER,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required',
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) DEFAULT 0;

-- Table pour la présence par session
CREATE TABLE IF NOT EXISTS public.event_session_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.event_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.event_participants(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  attended BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, participant_id)
);

-- Table pour les catégories de budget événement
CREATE TABLE IF NOT EXISTS public.event_budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  estimated_amount DECIMAL(12,2) DEFAULT 0,
  actual_amount DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'XOF',
  vendor TEXT,
  invoice_number TEXT,
  invoice_url TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les sponsors et partenaires
CREATE TABLE IF NOT EXISTS public.event_sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sponsor_level TEXT DEFAULT 'bronze',
  contribution_type TEXT DEFAULT 'financial',
  contribution_value DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'XOF',
  benefits_offered TEXT,
  logo_url TEXT,
  website TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_media_partner BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour la logistique et le matériel
CREATE TABLE IF NOT EXISTS public.event_logistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  description TEXT,
  vendor TEXT,
  status TEXT DEFAULT 'pending',
  assigned_to TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour la restauration
CREATE TABLE IF NOT EXISTS public.event_catering (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  service_date DATE NOT NULL,
  service_time TIME,
  expected_count INTEGER DEFAULT 0,
  menu_description TEXT,
  dietary_options TEXT[],
  caterer_name TEXT,
  caterer_contact TEXT,
  cost DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'XOF',
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les documents événement
CREATE TABLE IF NOT EXISTS public.event_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_size INTEGER,
  is_public BOOLEAN DEFAULT false,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les enquêtes de satisfaction
CREATE TABLE IF NOT EXISTS public.event_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.event_participants(id) ON DELETE SET NULL,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  organization_rating INTEGER CHECK (organization_rating >= 1 AND organization_rating <= 5),
  content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 5),
  speakers_rating INTEGER CHECK (speakers_rating >= 1 AND speakers_rating <= 5),
  logistics_rating INTEGER CHECK (logistics_rating >= 1 AND logistics_rating <= 5),
  venue_rating INTEGER CHECK (venue_rating >= 1 AND venue_rating <= 5),
  comments TEXT,
  suggestions TEXT,
  would_recommend BOOLEAN,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les notifications événement
CREATE TABLE IF NOT EXISTS public.event_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  recipients_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les rapports d'événement
CREATE TABLE IF NOT EXISTS public.event_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  report_type TEXT DEFAULT 'final',
  title TEXT NOT NULL,
  summary TEXT,
  objectives_achieved TEXT,
  key_statistics JSONB,
  lessons_learned TEXT,
  strengths TEXT,
  improvements TEXT,
  recommendations TEXT,
  financial_summary JSONB,
  testimonials TEXT[],
  media_urls TEXT[],
  file_url TEXT,
  status TEXT DEFAULT 'draft',
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les événements découverts (veille)
CREATE TABLE IF NOT EXISTS public.discovered_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  start_date DATE,
  end_date DATE,
  country TEXT,
  city TEXT,
  venue TEXT,
  website TEXT,
  sectors TEXT[],
  source TEXT,
  relevance_score INTEGER DEFAULT 50,
  status TEXT DEFAULT 'new',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.event_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_catering ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovered_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_team_members
CREATE POLICY "Authenticated users can view event team members" ON public.event_team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage event team members" ON public.event_team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for event_sessions
CREATE POLICY "Authenticated users can view event sessions" ON public.event_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage event sessions" ON public.event_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for event_speakers
CREATE POLICY "Authenticated users can view event speakers" ON public.event_speakers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage event speakers" ON public.event_speakers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for event_session_attendance
CREATE POLICY "Authenticated users can view session attendance" ON public.event_session_attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage session attendance" ON public.event_session_attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for event_budget_items
CREATE POLICY "Authenticated users can view event budget items" ON public.event_budget_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage event budget items" ON public.event_budget_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for event_sponsors
CREATE POLICY "Authenticated users can view event sponsors" ON public.event_sponsors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage event sponsors" ON public.event_sponsors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for event_logistics
CREATE POLICY "Authenticated users can view event logistics" ON public.event_logistics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage event logistics" ON public.event_logistics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for event_catering
CREATE POLICY "Authenticated users can view event catering" ON public.event_catering FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage event catering" ON public.event_catering FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for event_documents
CREATE POLICY "Authenticated users can view event documents" ON public.event_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage event documents" ON public.event_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for event_surveys
CREATE POLICY "Authenticated users can view event surveys" ON public.event_surveys FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage event surveys" ON public.event_surveys FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for event_notifications
CREATE POLICY "Authenticated users can view event notifications" ON public.event_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage event notifications" ON public.event_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for event_reports
CREATE POLICY "Authenticated users can view event reports" ON public.event_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage event reports" ON public.event_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for discovered_events
CREATE POLICY "Authenticated users can view discovered events" ON public.discovered_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage discovered events" ON public.discovered_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_sessions_event_id ON public.event_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_speakers_event_id ON public.event_speakers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sponsors_event_id ON public.event_sponsors(event_id);
CREATE INDEX IF NOT EXISTS idx_event_budget_items_event_id ON public.event_budget_items(event_id);
CREATE INDEX IF NOT EXISTS idx_event_logistics_event_id ON public.event_logistics(event_id);
CREATE INDEX IF NOT EXISTS idx_event_surveys_event_id ON public.event_surveys(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reports_event_id ON public.event_reports(event_id);
CREATE INDEX IF NOT EXISTS idx_discovered_events_status ON public.discovered_events(status);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);