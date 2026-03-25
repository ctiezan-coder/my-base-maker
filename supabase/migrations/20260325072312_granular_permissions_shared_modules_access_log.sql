-- ============================================================================
-- Migration: Granular Permissions, Shared Modules, Access Log
-- Description: Adds fine-grained CRUD permission columns to user_role_assignments,
--              creates shared_modules for cross-direction access,
--              creates access_log for audit trail,
--              and updates permission-check functions accordingly.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Add granular permission columns to user_role_assignments
-- --------------------------------------------------------------------------
ALTER TABLE public.user_role_assignments
  ADD COLUMN IF NOT EXISTS peut_voir BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS peut_creer BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS peut_modifier BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS peut_supprimer BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS peut_exporter BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS peut_valider BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill existing records based on current role:
--   admin   → all permissions true
--   manager → voir + creer + modifier + exporter true
--   user    → only voir true (already default)
UPDATE public.user_role_assignments
SET
  peut_voir = TRUE,
  peut_creer = CASE WHEN role IN ('manager', 'admin') THEN TRUE ELSE FALSE END,
  peut_modifier = CASE WHEN role IN ('manager', 'admin') THEN TRUE ELSE FALSE END,
  peut_supprimer = CASE WHEN role = 'admin' THEN TRUE ELSE FALSE END,
  peut_exporter = CASE WHEN role IN ('manager', 'admin') THEN TRUE ELSE FALSE END,
  peut_valider = CASE WHEN role = 'admin' THEN TRUE ELSE FALSE END;

-- --------------------------------------------------------------------------
-- 2. Create shared_modules table (modules_partages)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shared_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module app_module NOT NULL,
  source_direction_id UUID NOT NULL REFERENCES public.directions(id) ON DELETE CASCADE,
  target_direction_id UUID NOT NULL REFERENCES public.directions(id) ON DELETE CASCADE,
  peut_voir BOOLEAN NOT NULL DEFAULT TRUE,
  peut_creer BOOLEAN NOT NULL DEFAULT FALSE,
  peut_modifier BOOLEAN NOT NULL DEFAULT FALSE,
  peut_exporter BOOLEAN NOT NULL DEFAULT FALSE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(module, source_direction_id, target_direction_id),
  CHECK (source_direction_id <> target_direction_id)
);

ALTER TABLE public.shared_modules ENABLE ROW LEVEL SECURITY;

-- Admins can manage shared modules
CREATE POLICY "Admins can manage shared modules"
ON public.shared_modules
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Users can view shared modules targeting their direction
CREATE POLICY "Users can view their shared modules"
ON public.shared_modules
FOR SELECT
TO authenticated
USING (
  target_direction_id IN (
    SELECT direction_id FROM public.profiles WHERE user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

CREATE INDEX IF NOT EXISTS idx_shared_modules_target
ON public.shared_modules(target_direction_id, module);

CREATE INDEX IF NOT EXISTS idx_shared_modules_source
ON public.shared_modules(source_direction_id, module);

-- Trigger for updated_at
CREATE TRIGGER update_shared_modules_updated_at
BEFORE UPDATE ON public.shared_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------------
-- 3. Create access_log table (journal_acces)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module app_module NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.access_log ENABLE ROW LEVEL SECURITY;

-- Admins can read all logs
CREATE POLICY "Admins can view access logs"
ON public.access_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Authenticated users can insert their own logs
CREATE POLICY "Users can insert own access logs"
ON public.access_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_access_log_user
ON public.access_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_log_module
ON public.access_log(module, created_at DESC);

-- --------------------------------------------------------------------------
-- 4. Create check_module_action function for granular permission checks
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_module_action(
  _user_id UUID,
  _module app_module,
  _action TEXT  -- 'voir', 'creer', 'modifier', 'supprimer', 'exporter', 'valider'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _has_permission BOOLEAN := FALSE;
  _user_direction_id UUID;
BEGIN
  -- Admin bypass: global admins can do everything
  IF has_role(_user_id, 'admin') THEN
    RETURN TRUE;
  END IF;

  -- Get user's primary direction
  SELECT direction_id INTO _user_direction_id
  FROM public.profiles
  WHERE user_id = _user_id;

  -- Check direct permission from user_role_assignments
  SELECT
    CASE _action
      WHEN 'voir' THEN ura.peut_voir
      WHEN 'creer' THEN ura.peut_creer
      WHEN 'modifier' THEN ura.peut_modifier
      WHEN 'supprimer' THEN ura.peut_supprimer
      WHEN 'exporter' THEN ura.peut_exporter
      WHEN 'valider' THEN ura.peut_valider
      ELSE FALSE
    END INTO _has_permission
  FROM public.user_role_assignments ura
  WHERE ura.user_id = _user_id
    AND ura.module = _module
  LIMIT 1;

  IF _has_permission THEN
    RETURN TRUE;
  END IF;

  -- Check shared modules: does any shared_module grant this action
  -- to the user's direction?
  IF _user_direction_id IS NOT NULL THEN
    SELECT
      CASE _action
        WHEN 'voir' THEN sm.peut_voir
        WHEN 'creer' THEN sm.peut_creer
        WHEN 'modifier' THEN sm.peut_modifier
        WHEN 'exporter' THEN sm.peut_exporter
        ELSE FALSE  -- supprimer/valider not available via sharing
      END INTO _has_permission
    FROM public.shared_modules sm
    WHERE sm.target_direction_id = _user_direction_id
      AND sm.module = _module
    LIMIT 1;
  END IF;

  RETURN COALESCE(_has_permission, FALSE);
END;
$$;

-- --------------------------------------------------------------------------
-- 5. Create log_access function for inserting audit entries
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_access(
  _module app_module,
  _action TEXT,
  _details JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.access_log (user_id, module, action, details)
  VALUES (auth.uid(), _module, _action, _details);
END;
$$;

-- --------------------------------------------------------------------------
-- 6. Create user_menu_permissions view for dynamic menu generation
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.user_menu_permissions AS
SELECT DISTINCT
  ura.user_id,
  ura.module,
  ura.peut_voir,
  ura.peut_creer,
  ura.peut_modifier,
  ura.peut_supprimer,
  ura.peut_exporter,
  ura.peut_valider,
  d.name AS direction_name,
  'direct' AS access_type
FROM public.user_role_assignments ura
JOIN public.directions d ON d.id = ura.direction_id
WHERE ura.peut_voir = TRUE

UNION

SELECT DISTINCT
  p.user_id,
  sm.module,
  sm.peut_voir,
  sm.peut_creer,
  sm.peut_modifier,
  FALSE AS peut_supprimer,
  sm.peut_exporter,
  FALSE AS peut_valider,
  d.name AS direction_name,
  'shared' AS access_type
FROM public.shared_modules sm
JOIN public.profiles p ON p.direction_id = sm.target_direction_id
JOIN public.directions d ON d.id = sm.source_direction_id
WHERE sm.peut_voir = TRUE;

-- --------------------------------------------------------------------------
-- 7. Update assign_daf_dg_permissions to set granular permissions
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION assign_daf_dg_permissions()
RETURNS TRIGGER AS $$
DECLARE
  daf_id uuid;
  dg_id uuid;
  module_name app_module;
BEGIN
  SELECT id INTO daf_id FROM directions WHERE name = 'Direction Administrative et Financière';
  SELECT id INTO dg_id FROM directions WHERE name = 'Direction Générale';

  IF daf_id IS NOT NULL THEN
    FOR module_name IN
      SELECT unnest(enum_range(NULL::app_module))
    LOOP
      INSERT INTO user_role_assignments (user_id, direction_id, module, role, peut_voir, peut_creer, peut_modifier, peut_supprimer, peut_exporter, peut_valider)
      VALUES (NEW.user_id, daf_id, module_name, 'user', TRUE, FALSE, FALSE, FALSE, FALSE, FALSE)
      ON CONFLICT (user_id, direction_id, module) DO NOTHING;
    END LOOP;
  END IF;

  IF dg_id IS NOT NULL THEN
    FOR module_name IN
      SELECT unnest(enum_range(NULL::app_module))
    LOOP
      INSERT INTO user_role_assignments (user_id, direction_id, module, role, peut_voir, peut_creer, peut_modifier, peut_supprimer, peut_exporter, peut_valider)
      VALUES (NEW.user_id, dg_id, module_name, 'user', TRUE, TRUE, TRUE, FALSE, TRUE, FALSE)
      ON CONFLICT (user_id, direction_id, module) DO NOTHING;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
