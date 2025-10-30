-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('Suivi & Évaluation', 'VAME', 'Communication', 'Marchés & Compétitivité', 'Digitalisation')),
  role TEXT CHECK (role IN ('admin', 'manager', 'user')) DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create directions table
CREATE TABLE public.directions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  priority TEXT CHECK (priority IN ('Élevé', 'Très élevé')) NOT NULL,
  volume_estimate TEXT,
  icon_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.directions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view directions"
ON public.directions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage directions"
ON public.directions FOR ALL
TO authenticated
USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction_id UUID REFERENCES public.directions(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  category TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents from their direction"
ON public.documents FOR SELECT
TO authenticated
USING (
  direction_id IN (
    SELECT d.id FROM public.directions d
    JOIN public.profiles p ON p.direction = d.name
    WHERE p.user_id = auth.uid()
  ) OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

CREATE POLICY "Users can create documents"
ON public.documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own documents"
ON public.documents FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction_id UUID REFERENCES public.directions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('planifié', 'en cours', 'terminé', 'en pause')) DEFAULT 'planifié',
  start_date DATE,
  end_date DATE,
  budget NUMERIC(15,2),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects from their direction"
ON public.projects FOR SELECT
TO authenticated
USING (
  direction_id IN (
    SELECT d.id FROM public.directions d
    JOIN public.profiles p ON p.direction = d.name
    WHERE p.user_id = auth.uid()
  ) OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

CREATE POLICY "Managers can manage projects"
ON public.projects FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('admin', 'manager')
);

-- Create partnerships table
CREATE TABLE public.partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction_id UUID REFERENCES public.directions(id) ON DELETE CASCADE NOT NULL,
  partner_name TEXT NOT NULL,
  partner_type TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('actif', 'en négociation', 'terminé')) DEFAULT 'en négociation',
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view partnerships from their direction"
ON public.partnerships FOR SELECT
TO authenticated
USING (
  direction_id IN (
    SELECT d.id FROM public.directions d
    JOIN public.profiles p ON p.direction = d.name
    WHERE p.user_id = auth.uid()
  ) OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

CREATE POLICY "Managers can manage partnerships"
ON public.partnerships FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('admin', 'manager')
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction_id UUID REFERENCES public.directions(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('formation', 'conférence', 'atelier', 'réunion', 'autre')) NOT NULL,
  location TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_participants INT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events from their direction"
ON public.events FOR SELECT
TO authenticated
USING (
  direction_id IN (
    SELECT d.id FROM public.directions d
    JOIN public.profiles p ON p.direction = d.name
    WHERE p.user_id = auth.uid()
  ) OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

CREATE POLICY "Managers can manage events"
ON public.events FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('admin', 'manager')
);

-- Create KPI tracking table
CREATE TABLE public.kpi_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction_id UUID REFERENCES public.directions(id) ON DELETE CASCADE NOT NULL,
  kpi_name TEXT NOT NULL,
  kpi_value NUMERIC(15,2) NOT NULL,
  target_value NUMERIC(15,2),
  unit TEXT,
  period DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.kpi_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view KPIs from their direction"
ON public.kpi_tracking FOR SELECT
TO authenticated
USING (
  direction_id IN (
    SELECT d.id FROM public.directions d
    JOIN public.profiles p ON p.direction = d.name
    WHERE p.user_id = auth.uid()
  ) OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

CREATE POLICY "Managers can manage KPIs"
ON public.kpi_tracking FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('admin', 'manager')
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partnerships_updated_at
  BEFORE UPDATE ON public.partnerships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert initial directions data
INSERT INTO public.directions (name, description, priority, volume_estimate, icon_name) VALUES
('Suivi & Évaluation', 'Pilotage et analyse de performance', 'Élevé', NULL, 'BarChart3'),
('VAME', 'Valorisation & Mise en Œuvre', 'Élevé', '12-3 Go', 'Users'),
('Communication', 'Marketing & Média', 'Très élevé', '~500 Mo/mois', 'Megaphone'),
('Marchés & Compétitivité', 'Intelligence commerciale', 'Très élevé', NULL, 'TrendingUp'),
('Digitalisation', 'Transformation digitale', 'Très élevé', '~5,5 Go', 'FileText');