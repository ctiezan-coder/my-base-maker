-- Create opportunity_projects table to link opportunities to projects
CREATE TABLE public.opportunity_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.export_opportunities(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(opportunity_id, project_id)
);

-- Enable RLS
ALTER TABLE public.opportunity_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view opportunity projects"
ON public.opportunity_projects FOR SELECT
USING (true);

CREATE POLICY "Users can insert opportunity projects"
ON public.opportunity_projects FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete opportunity projects"
ON public.opportunity_projects FOR DELETE
USING (true);