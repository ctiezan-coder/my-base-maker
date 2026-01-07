-- Ajouter les colonnes manquantes à la table projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS project_code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS project_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS actual_start_date DATE,
ADD COLUMN IF NOT EXISTS actual_end_date DATE,
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.employees(id);

-- Ajouter les colonnes manquantes aux jalons
ALTER TABLE public.project_milestones
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
ADD COLUMN IF NOT EXISTS validation_status VARCHAR(50) DEFAULT 'En attente';

-- Ajouter les colonnes manquantes aux livrables  
ALTER TABLE public.project_deliverables
ADD COLUMN IF NOT EXISTS validation_status VARCHAR(50) DEFAULT 'En attente',
ADD COLUMN IF NOT EXISTS validated_by UUID,
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE;

-- Ajouter une colonne catégorie aux risques
ALTER TABLE public.project_risks
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50);

-- Ajouter versioning aux documents projet
ALTER TABLE public.project_documents
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES public.project_documents(id);

-- Créer une table pour les alertes budgétaires
CREATE TABLE IF NOT EXISTS public.project_budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  threshold_percentage INTEGER NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_budget_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view budget alerts"
ON public.project_budget_alerts FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert budget alerts"
ON public.project_budget_alerts FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update budget alerts"
ON public.project_budget_alerts FOR UPDATE TO authenticated
USING (true);

-- Créer une fonction pour calculer le niveau de risque automatiquement
CREATE OR REPLACE FUNCTION public.calculate_risk_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.probability = 'Haute' AND NEW.impact = 'Élevé' THEN
    NEW.risk_level := 'Critique';
  ELSIF (NEW.probability = 'Haute' AND NEW.impact = 'Moyen') OR (NEW.probability = 'Moyenne' AND NEW.impact = 'Élevé') THEN
    NEW.risk_level := 'Élevé';
  ELSIF NEW.probability = 'Moyenne' AND NEW.impact = 'Moyen' THEN
    NEW.risk_level := 'Moyen';
  ELSE
    NEW.risk_level := 'Faible';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER calculate_risk_level_trigger
BEFORE INSERT OR UPDATE ON public.project_risks
FOR EACH ROW EXECUTE FUNCTION public.calculate_risk_level();

-- Créer une fonction pour générer le code projet automatiquement
CREATE OR REPLACE FUNCTION public.generate_project_code()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
  new_code TEXT;
BEGIN
  IF NEW.project_code IS NULL THEN
    year_str := to_char(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(project_code FROM 'PRJ-' || year_str || '-(\d+)') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.projects
    WHERE project_code LIKE 'PRJ-' || year_str || '-%';
    NEW.project_code := 'PRJ-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER generate_project_code_trigger
BEFORE INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.generate_project_code();

-- Fonction pour déclencher des alertes budgétaires
CREATE OR REPLACE FUNCTION public.check_budget_alerts()
RETURNS TRIGGER AS $$
DECLARE
  project_budget NUMERIC;
  total_expenses NUMERIC;
  usage_percent NUMERIC;
BEGIN
  SELECT budget INTO project_budget FROM public.projects WHERE id = NEW.project_id;
  
  IF project_budget IS NOT NULL AND project_budget > 0 THEN
    SELECT COALESCE(SUM(amount), 0) INTO total_expenses
    FROM public.project_expenses WHERE project_id = NEW.project_id;
    
    usage_percent := (total_expenses / project_budget) * 100;
    
    -- Alertes à 80%, 90%, 100%
    IF usage_percent >= 100 THEN
      INSERT INTO public.project_budget_alerts (project_id, threshold_percentage)
      SELECT NEW.project_id, 100
      WHERE NOT EXISTS (
        SELECT 1 FROM public.project_budget_alerts 
        WHERE project_id = NEW.project_id AND threshold_percentage = 100
      );
    ELSIF usage_percent >= 90 THEN
      INSERT INTO public.project_budget_alerts (project_id, threshold_percentage)
      SELECT NEW.project_id, 90
      WHERE NOT EXISTS (
        SELECT 1 FROM public.project_budget_alerts 
        WHERE project_id = NEW.project_id AND threshold_percentage = 90
      );
    ELSIF usage_percent >= 80 THEN
      INSERT INTO public.project_budget_alerts (project_id, threshold_percentage)
      SELECT NEW.project_id, 80
      WHERE NOT EXISTS (
        SELECT 1 FROM public.project_budget_alerts 
        WHERE project_id = NEW.project_id AND threshold_percentage = 80
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER check_budget_alerts_trigger
AFTER INSERT OR UPDATE ON public.project_expenses
FOR EACH ROW EXECUTE FUNCTION public.check_budget_alerts();