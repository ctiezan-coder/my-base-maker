-- Create project tracking table for monitoring project activities
CREATE TABLE IF NOT EXISTS public.project_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  tracking_type TEXT NOT NULL CHECK (tracking_type IN ('Réunion', 'Rapport', 'Visite', 'Évaluation', 'Audit')),
  tracking_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Planifié',
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  reference_id UUID,
  reference_table TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_tracking
CREATE POLICY "Users can view project tracking from their direction"
ON public.project_tracking
FOR SELECT
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN directions d ON p.direction_id = d.id
    JOIN profiles pr ON pr.direction = d.name
    WHERE pr.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Managers can manage project tracking"
ON public.project_tracking
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_project_tracking_project_id ON public.project_tracking(project_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Trigger for updated_at
CREATE TRIGGER update_project_tracking_updated_at
BEFORE UPDATE ON public.project_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();