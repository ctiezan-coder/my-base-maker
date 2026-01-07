-- =============================================
-- TABLES POUR LA GESTION COMPLÈTE DES PROJETS
-- =============================================

-- 1. Table des membres d'équipe projet (employés et utilisateurs)
CREATE TABLE public.project_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'membre', -- responsable, membre, consultant
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT project_member_check CHECK (employee_id IS NOT NULL OR user_id IS NOT NULL)
);

-- 2. Table des jalons (milestones)
CREATE TABLE public.project_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'en attente', -- en attente, en cours, terminé, annulé
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Table des livrables
CREATE TABLE public.project_deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'à faire', -- à faire, en cours, terminé, validé
  assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Table du suivi des dépenses projet
CREATE TABLE public.project_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  expense_date DATE NOT NULL,
  category VARCHAR(100), -- personnel, équipement, services, déplacement, autre
  receipt_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Table des documents projet
CREATE TABLE public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  category VARCHAR(100), -- contrat, rapport, spécification, autre
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Table des commentaires projet
CREATE TABLE public.project_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Table de l'historique projet
CREATE TABLE public.project_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL, -- création, modification, statut_changé, membre_ajouté, etc.
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Table des risques projet
CREATE TABLE public.project_risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  probability VARCHAR(20) NOT NULL DEFAULT 'moyen', -- faible, moyen, élevé, critique
  impact VARCHAR(20) NOT NULL DEFAULT 'moyen', -- faible, moyen, élevé, critique
  mitigation_plan TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'identifié', -- identifié, en cours, résolu, survenu
  owner_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Table des indicateurs de performance projet (KPIs spécifiques au projet)
CREATE TABLE public.project_kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  target_value NUMERIC(15, 2),
  current_value NUMERIC(15, 2),
  unit VARCHAR(50),
  measurement_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- POLITIQUES RLS
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_kpis ENABLE ROW LEVEL SECURITY;

-- Policies for project_members
CREATE POLICY "Users can view project members" ON project_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND (
      p.created_by = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR user_has_direction_access(auth.uid(), p.direction_id)
    )
  )
);

CREATE POLICY "Managers can manage project members" ON project_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND (
      p.created_by = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_module_permission(auth.uid(), p.direction_id, 'projects'::app_module, 'manager'::app_role)
    )
  )
);

-- Policies for project_milestones
CREATE POLICY "Users can view project milestones" ON project_milestones
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND user_has_direction_access(auth.uid(), p.direction_id)
  )
);

CREATE POLICY "Managers can manage project milestones" ON project_milestones
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND (
      p.created_by = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_module_permission(auth.uid(), p.direction_id, 'projects'::app_module, 'manager'::app_role)
    )
  )
);

-- Policies for project_deliverables
CREATE POLICY "Users can view project deliverables" ON project_deliverables
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND user_has_direction_access(auth.uid(), p.direction_id)
  )
);

CREATE POLICY "Managers can manage project deliverables" ON project_deliverables
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND (
      p.created_by = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_module_permission(auth.uid(), p.direction_id, 'projects'::app_module, 'manager'::app_role)
    )
  )
);

-- Policies for project_expenses
CREATE POLICY "Users can view project expenses" ON project_expenses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND user_has_direction_access(auth.uid(), p.direction_id)
  )
);

CREATE POLICY "Managers can manage project expenses" ON project_expenses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND (
      p.created_by = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_module_permission(auth.uid(), p.direction_id, 'projects'::app_module, 'manager'::app_role)
    )
  )
);

-- Policies for project_documents
CREATE POLICY "Users can view project documents" ON project_documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND user_has_direction_access(auth.uid(), p.direction_id)
  )
);

CREATE POLICY "Managers can manage project documents" ON project_documents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND (
      p.created_by = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_module_permission(auth.uid(), p.direction_id, 'projects'::app_module, 'manager'::app_role)
    )
  )
);

-- Policies for project_comments
CREATE POLICY "Users can view project comments" ON project_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND user_has_direction_access(auth.uid(), p.direction_id)
  )
);

CREATE POLICY "Users can add comments to projects" ON project_comments
FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND user_has_direction_access(auth.uid(), p.direction_id)
  )
);

CREATE POLICY "Users can edit own comments" ON project_comments
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON project_comments
FOR DELETE USING (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Policies for project_history
CREATE POLICY "Users can view project history" ON project_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND user_has_direction_access(auth.uid(), p.direction_id)
  )
);

CREATE POLICY "System can insert project history" ON project_history
FOR INSERT WITH CHECK (true);

-- Policies for project_risks
CREATE POLICY "Users can view project risks" ON project_risks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND user_has_direction_access(auth.uid(), p.direction_id)
  )
);

CREATE POLICY "Managers can manage project risks" ON project_risks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND (
      p.created_by = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_module_permission(auth.uid(), p.direction_id, 'projects'::app_module, 'manager'::app_role)
    )
  )
);

-- Policies for project_kpis
CREATE POLICY "Users can view project kpis" ON project_kpis
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND user_has_direction_access(auth.uid(), p.direction_id)
  )
);

CREATE POLICY "Managers can manage project kpis" ON project_kpis
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
    AND (
      p.created_by = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_module_permission(auth.uid(), p.direction_id, 'projects'::app_module, 'manager'::app_role)
    )
  )
);

-- =============================================
-- TRIGGERS POUR L'HISTORIQUE ET MISE À JOUR
-- =============================================

-- Trigger pour l'historique des projets
CREATE OR REPLACE FUNCTION log_project_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO project_history (project_id, user_id, action, details)
    VALUES (NEW.id, auth.uid(), 'création', jsonb_build_object('name', NEW.name, 'status', NEW.status));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO project_history (project_id, user_id, action, details)
      VALUES (NEW.id, auth.uid(), 'statut_changé', jsonb_build_object('ancien', OLD.status, 'nouveau', NEW.status));
    ELSE
      INSERT INTO project_history (project_id, user_id, action, details)
      VALUES (NEW.id, auth.uid(), 'modification', jsonb_build_object('name', NEW.name));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER project_history_trigger
AFTER INSERT OR UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION log_project_changes();

-- Triggers pour updated_at
CREATE TRIGGER update_project_members_updated_at
BEFORE UPDATE ON project_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at
BEFORE UPDATE ON project_milestones
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_deliverables_updated_at
BEFORE UPDATE ON project_deliverables
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_expenses_updated_at
BEFORE UPDATE ON project_expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_documents_updated_at
BEFORE UPDATE ON project_documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_comments_updated_at
BEFORE UPDATE ON project_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_risks_updated_at
BEFORE UPDATE ON project_risks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_kpis_updated_at
BEFORE UPDATE ON project_kpis
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- BUCKET STORAGE POUR DOCUMENTS PROJET
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for project documents storage
CREATE POLICY "Users can view project documents storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload project documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own project documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);