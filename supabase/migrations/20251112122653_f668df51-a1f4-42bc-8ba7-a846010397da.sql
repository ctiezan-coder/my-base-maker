-- Add new modules to the app_module enum
ALTER TYPE public.app_module ADD VALUE IF NOT EXISTS 'imputations';
ALTER TYPE public.app_module ADD VALUE IF NOT EXISTS 'suivi_evaluation';