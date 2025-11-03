-- Create partnership_projects junction table
CREATE TABLE public.partnership_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partnership_id, project_id)
);

-- Enable RLS
ALTER TABLE public.partnership_projects ENABLE ROW LEVEL SECURITY;

-- Users can view partnership_projects from their direction
CREATE POLICY "Users can view partnership_projects from their direction"
ON public.partnership_projects
FOR SELECT
USING (
  partnership_id IN (
    SELECT p.id FROM partnerships p
    JOIN directions d ON p.direction_id = d.id
    JOIN profiles pr ON pr.direction = d.name
    WHERE pr.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Managers can manage partnership_projects
CREATE POLICY "Managers can manage partnership_projects"
ON public.partnership_projects
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Create index for better performance
CREATE INDEX idx_partnership_projects_partnership ON public.partnership_projects(partnership_id);
CREATE INDEX idx_partnership_projects_project ON public.partnership_projects(project_id);