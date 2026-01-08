-- Create event_projects table to link events with their associated projects
CREATE TABLE public.event_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, project_id)
);

-- Create training_projects table to link trainings with their associated projects
CREATE TABLE public.training_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(training_id, project_id)
);

-- Enable RLS
ALTER TABLE public.event_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event_projects
CREATE POLICY "Users can view event_projects" ON public.event_projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert event_projects" ON public.event_projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete event_projects" ON public.event_projects FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for training_projects
CREATE POLICY "Users can view training_projects" ON public.training_projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert training_projects" ON public.training_projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete training_projects" ON public.training_projects FOR DELETE USING (auth.role() = 'authenticated');