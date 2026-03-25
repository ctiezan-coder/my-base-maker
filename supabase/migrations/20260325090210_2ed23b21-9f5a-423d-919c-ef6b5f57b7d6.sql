
-- 1. Add granular permission columns to user_role_assignments
ALTER TABLE public.user_role_assignments
ADD COLUMN IF NOT EXISTS peut_voir BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS peut_creer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS peut_modifier BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS peut_supprimer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS peut_exporter BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS peut_valider BOOLEAN DEFAULT false;

-- 2. Create shared_modules table
CREATE TABLE IF NOT EXISTS public.shared_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_direction_id UUID NOT NULL REFERENCES public.directions(id) ON DELETE CASCADE,
  target_direction_id UUID NOT NULL REFERENCES public.directions(id) ON DELETE CASCADE,
  module app_module NOT NULL,
  shared_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_direction_id, target_direction_id, module)
);

ALTER TABLE public.shared_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage shared modules" ON public.shared_modules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view shared modules for their direction" ON public.shared_modules
  FOR SELECT TO authenticated
  USING (
    source_direction_id IN (SELECT direction_id FROM profiles WHERE user_id = auth.uid())
    OR target_direction_id IN (SELECT direction_id FROM profiles WHERE user_id = auth.uid())
  );

-- 3. Create check_module_action function
CREATE OR REPLACE FUNCTION public.check_module_action(
  _user_id UUID,
  _module app_module,
  _action TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    -- Admin bypass
    has_role(_user_id, 'admin')
    OR EXISTS (
      SELECT 1 FROM user_role_assignments ura
      WHERE ura.user_id = _user_id
        AND ura.module = _module
        AND CASE _action
          WHEN 'voir' THEN ura.peut_voir
          WHEN 'creer' THEN ura.peut_creer
          WHEN 'modifier' THEN ura.peut_modifier
          WHEN 'supprimer' THEN ura.peut_supprimer
          WHEN 'exporter' THEN ura.peut_exporter
          WHEN 'valider' THEN ura.peut_valider
          ELSE false
        END
    )
    OR EXISTS (
      -- Check shared modules
      SELECT 1 FROM shared_modules sm
      JOIN user_role_assignments ura ON ura.user_id = _user_id
        AND ura.direction_id = sm.source_direction_id
        AND ura.module = _module
      JOIN profiles p ON p.user_id = _user_id
      WHERE sm.target_direction_id = p.direction_id
        AND sm.module = _module
        AND CASE _action
          WHEN 'voir' THEN ura.peut_voir
          WHEN 'creer' THEN ura.peut_creer
          WHEN 'modifier' THEN ura.peut_modifier
          WHEN 'supprimer' THEN ura.peut_supprimer
          WHEN 'exporter' THEN ura.peut_exporter
          WHEN 'valider' THEN ura.peut_valider
          ELSE false
        END
    );
$$;
