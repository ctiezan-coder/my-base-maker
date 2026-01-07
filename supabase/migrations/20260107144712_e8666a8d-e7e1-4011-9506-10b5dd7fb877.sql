-- =============================================
-- Tables pour le Module Suivi & Évaluation Avancé
-- =============================================

-- 1. Table des objectifs stratégiques et opérationnels
CREATE TABLE public.strategic_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  objective_type TEXT NOT NULL CHECK (objective_type IN ('strategic', 'operational')),
  direction_id UUID REFERENCES public.directions(id),
  parent_objective_id UUID REFERENCES public.strategic_objectives(id),
  fiscal_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'achieved', 'at_risk', 'not_achieved')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table des plans d'action par direction
CREATE TABLE public.action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  direction_id UUID REFERENCES public.directions(id) NOT NULL,
  objective_id UUID REFERENCES public.strategic_objectives(id),
  fiscal_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  start_date DATE,
  end_date DATE,
  responsible_user_id UUID,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'in_progress', 'completed', 'cancelled')),
  budget_allocated NUMERIC DEFAULT 0,
  budget_consumed NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table des activités de plan d'action
CREATE TABLE public.action_plan_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id UUID REFERENCES public.action_plans(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  responsible TEXT,
  resources_needed TEXT,
  kpi_indicator TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')),
  obstacles TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Table des enquêtes de satisfaction
CREATE TABLE public.satisfaction_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  survey_type TEXT NOT NULL CHECK (survey_type IN ('operator', 'training', 'event', 'general', 'program')),
  direction_id UUID REFERENCES public.directions(id),
  reference_id UUID, -- Can reference training, event, etc.
  reference_type TEXT, -- 'training', 'event', 'program', etc.
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  questions JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Table des réponses aux enquêtes
CREATE TABLE public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.satisfaction_surveys(id) ON DELETE CASCADE NOT NULL,
  respondent_id UUID, -- Can be company_id, user_id, etc.
  respondent_type TEXT, -- 'company', 'user', 'anonymous'
  respondent_email TEXT,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  comments TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Table des rapports d'évaluation
CREATE TABLE public.evaluation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('monthly', 'quarterly', 'annual', 'project', 'program', 'thematic')),
  direction_id UUID REFERENCES public.directions(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  summary TEXT,
  key_findings TEXT,
  recommendations TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
  file_url TEXT,
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Table des analyses d'écarts
CREATE TABLE public.gap_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  objective_id UUID REFERENCES public.strategic_objectives(id),
  kpi_id UUID REFERENCES public.kpi_tracking(id),
  direction_id UUID REFERENCES public.directions(id),
  analysis_period TEXT NOT NULL,
  expected_value NUMERIC NOT NULL,
  actual_value NUMERIC NOT NULL,
  gap_value NUMERIC GENERATED ALWAYS AS (actual_value - expected_value) STORED,
  gap_percentage NUMERIC GENERATED ALWAYS AS (
    CASE WHEN expected_value = 0 THEN 0
    ELSE ((actual_value - expected_value) / expected_value) * 100
    END
  ) STORED,
  gap_type TEXT CHECK (gap_type IN ('positive', 'negative', 'neutral')),
  internal_factors TEXT,
  external_factors TEXT,
  root_cause_analysis TEXT,
  impact_assessment TEXT,
  lessons_learned TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Table des actions correctives
CREATE TABLE public.corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  gap_analysis_id UUID REFERENCES public.gap_analyses(id),
  direction_id UUID REFERENCES public.directions(id),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  responsible_user_id UUID,
  responsible_name TEXT,
  due_date DATE,
  completion_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  effectiveness_notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Table du tableau de bord consolidé (widgets personnalisables)
CREATE TABLE public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  direction_id UUID REFERENCES public.directions(id),
  widget_type TEXT NOT NULL CHECK (widget_type IN (
    'kpi_gauge', 'kpi_chart', 'project_status', 'budget_summary', 
    'imputation_stats', 'opportunity_summary', 'training_stats',
    'event_calendar', 'partnership_summary', 'custom_chart'
  )),
  title TEXT NOT NULL,
  configuration JSONB DEFAULT '{}'::jsonb,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 1,
  height INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Table des benchmarks
CREATE TABLE public.benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  benchmark_type TEXT NOT NULL CHECK (benchmark_type IN ('internal', 'external', 'international')),
  category TEXT, -- 'export_agency', 'best_practice', 'competitor', etc.
  source TEXT,
  indicator TEXT NOT NULL,
  our_value NUMERIC,
  benchmark_value NUMERIC,
  unit TEXT,
  analysis_period TEXT,
  findings TEXT,
  lessons_learned TEXT,
  recommendations TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Table des alertes de suivi
CREATE TABLE public.monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'objective_risk', 'kpi_critical', 'budget_overrun', 
    'project_delay', 'deadline_reminder', 'custom'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  reference_type TEXT, -- 'objective', 'kpi', 'project', 'budget', etc.
  reference_id UUID,
  direction_id UUID REFERENCES public.directions(id),
  user_id UUID,
  threshold_value NUMERIC,
  current_value NUMERIC,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Table du ROI des activités
CREATE TABLE public.activity_roi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'training', 'event', 'mission', 'program', 'partnership', 'intervention'
  )),
  activity_id UUID,
  activity_title TEXT NOT NULL,
  direction_id UUID REFERENCES public.directions(id),
  analysis_period TEXT,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  total_value_created NUMERIC NOT NULL DEFAULT 0,
  roi_percentage NUMERIC GENERATED ALWAYS AS (
    CASE WHEN total_cost = 0 THEN 0
    ELSE ((total_value_created - total_cost) / total_cost) * 100
    END
  ) STORED,
  direct_benefits TEXT,
  indirect_benefits TEXT,
  social_impact TEXT,
  jobs_created INTEGER DEFAULT 0,
  companies_benefited INTEGER DEFAULT 0,
  contracts_value NUMERIC DEFAULT 0,
  methodology TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.strategic_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plan_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satisfaction_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gap_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_roi ENABLE ROW LEVEL SECURITY;

-- RLS Policies (SELECT pour tous les utilisateurs authentifiés)
CREATE POLICY "Authenticated users can view strategic_objectives" ON public.strategic_objectives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage strategic_objectives" ON public.strategic_objectives FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view action_plans" ON public.action_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage action_plans" ON public.action_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view action_plan_activities" ON public.action_plan_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage action_plan_activities" ON public.action_plan_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view satisfaction_surveys" ON public.satisfaction_surveys FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage satisfaction_surveys" ON public.satisfaction_surveys FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view survey_responses" ON public.survey_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can submit survey_responses" ON public.survey_responses FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Authenticated users can view evaluation_reports" ON public.evaluation_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage evaluation_reports" ON public.evaluation_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view gap_analyses" ON public.gap_analyses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage gap_analyses" ON public.gap_analyses FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view corrective_actions" ON public.corrective_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage corrective_actions" ON public.corrective_actions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own dashboard_widgets" ON public.dashboard_widgets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own dashboard_widgets" ON public.dashboard_widgets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view benchmarks" ON public.benchmarks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage benchmarks" ON public.benchmarks FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own monitoring_alerts" ON public.monitoring_alerts FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Authenticated users can manage monitoring_alerts" ON public.monitoring_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view activity_roi" ON public.activity_roi FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage activity_roi" ON public.activity_roi FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_strategic_objectives_direction ON public.strategic_objectives(direction_id);
CREATE INDEX idx_strategic_objectives_fiscal_year ON public.strategic_objectives(fiscal_year);
CREATE INDEX idx_action_plans_direction ON public.action_plans(direction_id);
CREATE INDEX idx_action_plans_objective ON public.action_plans(objective_id);
CREATE INDEX idx_satisfaction_surveys_type ON public.satisfaction_surveys(survey_type);
CREATE INDEX idx_survey_responses_survey ON public.survey_responses(survey_id);
CREATE INDEX idx_evaluation_reports_type ON public.evaluation_reports(report_type);
CREATE INDEX idx_gap_analyses_objective ON public.gap_analyses(objective_id);
CREATE INDEX idx_corrective_actions_gap ON public.corrective_actions(gap_analysis_id);
CREATE INDEX idx_monitoring_alerts_user ON public.monitoring_alerts(user_id);
CREATE INDEX idx_activity_roi_type ON public.activity_roi(activity_type);

-- Triggers for updated_at
CREATE TRIGGER update_strategic_objectives_updated_at BEFORE UPDATE ON public.strategic_objectives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_action_plans_updated_at BEFORE UPDATE ON public.action_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_action_plan_activities_updated_at BEFORE UPDATE ON public.action_plan_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_satisfaction_surveys_updated_at BEFORE UPDATE ON public.satisfaction_surveys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_evaluation_reports_updated_at BEFORE UPDATE ON public.evaluation_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gap_analyses_updated_at BEFORE UPDATE ON public.gap_analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_corrective_actions_updated_at BEFORE UPDATE ON public.corrective_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON public.dashboard_widgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_benchmarks_updated_at BEFORE UPDATE ON public.benchmarks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_activity_roi_updated_at BEFORE UPDATE ON public.activity_roi FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();