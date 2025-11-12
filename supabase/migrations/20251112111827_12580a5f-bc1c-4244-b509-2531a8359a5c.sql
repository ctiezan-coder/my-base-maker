-- Create tasks table for task management
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deadline DATE,
  priority TEXT NOT NULL DEFAULT 'Moyenne' CHECK (priority IN ('Haute', 'Moyenne', 'Basse')),
  status TEXT NOT NULL DEFAULT 'À faire' CHECK (status IN ('À faire', 'En cours', 'Terminée', 'Annulée')),
  direction_id UUID REFERENCES public.directions(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Managers and admins can view all tasks
CREATE POLICY "Managers can view all tasks"
  ON public.tasks
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager')
  );

-- Users can view tasks assigned to them or created by them
CREATE POLICY "Users can view their tasks"
  ON public.tasks
  FOR SELECT
  USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager')
  );

-- Managers and admins can create tasks
CREATE POLICY "Managers can create tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager')
  );

-- Users can update tasks assigned to them
CREATE POLICY "Users can update their tasks"
  ON public.tasks
  FOR UPDATE
  USING (
    auth.uid() = assigned_to OR
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager')
  );

-- Managers and admins can delete tasks
CREATE POLICY "Managers can delete tasks"
  ON public.tasks
  FOR DELETE
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager')
  );

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();