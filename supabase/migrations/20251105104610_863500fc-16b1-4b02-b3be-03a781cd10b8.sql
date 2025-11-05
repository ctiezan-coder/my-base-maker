-- Drop the old enum type if it exists
DROP TYPE IF EXISTS public.app_module CASCADE;

-- Create enum for modules
CREATE TYPE public.app_module AS ENUM (
  'companies',
  'projects', 
  'documents',
  'events',
  'trainings',
  'kpis',
  'market_development',
  'partnerships',
  'media',
  'collaborators'
);

-- Drop table if exists to recreate it properly
DROP TABLE IF EXISTS public.user_role_assignments CASCADE;

-- Create table for granular role assignments
CREATE TABLE public.user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  direction_id UUID REFERENCES public.directions(id) ON DELETE CASCADE NOT NULL,
  module app_module NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, direction_id, module)
);

-- Enable RLS
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Users can view their own role assignments
CREATE POLICY "Users can view own role assignments"
ON public.user_role_assignments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all role assignments
CREATE POLICY "Admins can manage role assignments"
ON public.user_role_assignments
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create function to check module permission
CREATE OR REPLACE FUNCTION public.has_module_permission(
  _user_id UUID,
  _direction_id UUID,
  _module app_module,
  _required_role app_role
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_role_assignments
    WHERE user_id = _user_id
      AND direction_id = _direction_id
      AND module = _module
      AND (
        (role = 'admin') OR
        (_required_role = 'user' AND role IN ('user', 'manager', 'admin')) OR
        (_required_role = 'manager' AND role IN ('manager', 'admin'))
      )
  ) OR has_role(_user_id, 'admin');
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_user_role_assignments_updated_at
BEFORE UPDATE ON public.user_role_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Link profiles to directions properly
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS direction_id UUID REFERENCES public.directions(id);

-- Create index for performance
CREATE INDEX idx_user_role_assignments_user_direction 
ON public.user_role_assignments(user_id, direction_id);

CREATE INDEX idx_user_role_assignments_module 
ON public.user_role_assignments(module);