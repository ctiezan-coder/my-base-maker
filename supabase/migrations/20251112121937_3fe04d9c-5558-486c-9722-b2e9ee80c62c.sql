-- Create permission change history table
CREATE TABLE IF NOT EXISTS public.permission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  direction_id UUID REFERENCES public.directions(id),
  module app_module,
  old_role app_role,
  new_role app_role,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.permission_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all permission history"
ON public.permission_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert permission history"
ON public.permission_history
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX idx_permission_history_target_user ON public.permission_history(target_user_id);
CREATE INDEX idx_permission_history_created_at ON public.permission_history(created_at DESC);