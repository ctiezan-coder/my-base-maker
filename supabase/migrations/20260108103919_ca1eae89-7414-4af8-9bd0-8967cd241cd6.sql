-- ========================================
-- MODULE ORDRES DE MISSION COMPLET
-- ========================================

-- 1. Enum pour les types de mission
DO $$ BEGIN
  CREATE TYPE mission_type AS ENUM ('Nationale', 'Internationale');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Enum pour les niveaux d'urgence
DO $$ BEGIN
  CREATE TYPE mission_urgency AS ENUM ('Normale', 'Urgente', 'Très urgente');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Enum pour les statuts de mission étendus
DO $$ BEGIN
  CREATE TYPE mission_status_extended AS ENUM (
    'Brouillon', 
    'Soumise', 
    'En validation N1', 
    'En validation DAF', 
    'En validation DG',
    'Approuvée', 
    'Rejetée', 
    'Annulée',
    'Planifiée',
    'En cours', 
    'Terminée',
    'En attente rapport',
    'Rapport soumis',
    'En liquidation',
    'Liquidée',
    'Soldée'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Enum pour les statuts de validation
DO $$ BEGIN
  CREATE TYPE validation_status AS ENUM ('En attente', 'Approuvé', 'Rejeté');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Enum pour les niveaux de validation
DO $$ BEGIN
  CREATE TYPE validation_level AS ENUM ('N1_Superieur', 'N2_DAF', 'N3_DG');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Enum pour les statuts d'avance
DO $$ BEGIN
  CREATE TYPE advance_status AS ENUM ('En attente', 'Approuvée', 'Versée', 'Liquidée');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 7. Enum pour les modes de versement
DO $$ BEGIN
  CREATE TYPE payment_mode AS ENUM ('Virement', 'Chèque', 'Espèces');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 8. Enum pour les statuts de visa
DO $$ BEGIN
  CREATE TYPE visa_status AS ENUM ('Non requis', 'En cours', 'Obtenu', 'Refusé', 'Expiré');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 9. Enum pour les statuts de liquidation
DO $$ BEGIN
  CREATE TYPE liquidation_status AS ENUM ('En attente', 'En cours', 'Validée', 'Rejetée', 'Soldée');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ========================================
-- EXTENSION TABLE mission_orders
-- ========================================

-- Ajouter les nouvelles colonnes à mission_orders
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS mission_type mission_type DEFAULT 'Nationale';
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS urgency_level mission_urgency DEFAULT 'Normale';
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS extended_status mission_status_extended DEFAULT 'Brouillon';
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS justification TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS expected_results TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS request_date DATE DEFAULT CURRENT_DATE;

-- Informations demandeur enrichies
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS requester_matricule TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS requester_position TEXT;

-- Dates et heures détaillées
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS departure_time TIME;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS return_time TIME;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS working_days NUMERIC(5,2);
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS weekend_days NUMERIC(5,2);

-- Destination enrichie
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS destination_country TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS destination_cities TEXT[];
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS gps_coordinates JSONB;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS places_to_visit TEXT[];

-- Budget détaillé
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'FCFA';
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS transport_cost NUMERIC(15,2) DEFAULT 0;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS accommodation_cost NUMERIC(15,2) DEFAULT 0;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS per_diem_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS per_diem_days NUMERIC(5,2);
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS visa_cost NUMERIC(15,2) DEFAULT 0;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS insurance_cost NUMERIC(15,2) DEFAULT 0;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS other_costs NUMERIC(15,2) DEFAULT 0;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(15,6);
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS converted_budget NUMERIC(15,2);

-- Avance sur frais
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS advance_status advance_status DEFAULT 'En attente';
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS advance_currency TEXT DEFAULT 'FCFA';
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS advance_payment_mode payment_mode;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS advance_payment_date DATE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS advance_transaction_ref TEXT;

-- Imputation budgétaire
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS budget_line_id UUID;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS cost_center TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS budget_available BOOLEAN DEFAULT TRUE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS budget_alert_sent BOOLEAN DEFAULT FALSE;

-- Logistique
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS airline TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS flight_number TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS flight_class TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS pnr_reference TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS flight_departure_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS flight_arrival_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS hotel_name TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS hotel_address TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS hotel_check_in DATE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS hotel_check_out DATE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS hotel_nights INTEGER;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS hotel_confirmation_ref TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS rental_vehicle_type TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS rental_agency TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS driver_name TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS driver_phone TEXT;

-- Visa et documents
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS visa_required BOOLEAN DEFAULT FALSE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS visa_type TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS visa_status visa_status DEFAULT 'Non requis';
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS visa_request_date DATE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS visa_obtained_date DATE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS visa_number TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS passport_expiry DATE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS passport_alert_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS vaccinations_required TEXT[];
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS vaccination_card_valid BOOLEAN;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS travel_insurance_number TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS travel_insurance_company TEXT;

-- Suivi pendant la mission
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS actual_departure_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS actual_return_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS local_contact_name TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS local_contact_phone TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS emergency_contact_local TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS mission_incidents TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS program_changes TEXT;

-- Rapport de mission
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS report_due_date DATE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS report_submitted_date DATE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS report_validated BOOLEAN DEFAULT FALSE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS report_validated_by UUID;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS report_validated_date DATE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS objectives_achieved TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS activities_summary TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS people_met TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS discussions_summary TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS opportunities_identified TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS b2b_contacts_made INTEGER DEFAULT 0;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS agreements_made TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS difficulties_encountered TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS recommendations TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS documents_brought TEXT[];
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS photos_uploaded TEXT[];

-- Liquidation des frais
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS liquidation_status liquidation_status DEFAULT 'En attente';
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS total_actual_expenses NUMERIC(15,2) DEFAULT 0;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS budget_variance NUMERIC(15,2);
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS amount_to_refund NUMERIC(15,2);
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS amount_to_reimburse NUMERIC(15,2);
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS liquidation_date DATE;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS liquidation_validated_by UUID;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS liquidation_transaction_ref TEXT;
ALTER TABLE mission_orders ADD COLUMN IF NOT EXISTS accounting_entry_ref TEXT;

-- ========================================
-- TABLE: mission_itineraries (Itinéraire détaillé)
-- ========================================
CREATE TABLE IF NOT EXISTS mission_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES mission_orders(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  departure_location TEXT NOT NULL,
  arrival_location TEXT NOT NULL,
  departure_date DATE,
  arrival_date DATE,
  transport_mode TEXT,
  transport_details TEXT,
  accommodation TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE mission_itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mission itineraries readable by authenticated" ON mission_itineraries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Mission itineraries manageable by creators" ON mission_itineraries
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM mission_orders WHERE id = mission_id AND created_by = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- ========================================
-- TABLE: mission_program_days (Programme jour par jour)
-- ========================================
CREATE TABLE IF NOT EXISTS mission_program_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES mission_orders(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  day_number INTEGER NOT NULL,
  activities JSONB DEFAULT '[]',
  meetings JSONB DEFAULT '[]',
  contacts_to_meet JSONB DEFAULT '[]',
  events_to_cover TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE mission_program_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mission program days readable by authenticated" ON mission_program_days
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Mission program days manageable by creators" ON mission_program_days
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM mission_orders WHERE id = mission_id AND created_by = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- ========================================
-- TABLE: mission_validations (Workflow de validation)
-- ========================================
CREATE TABLE IF NOT EXISTS mission_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES mission_orders(id) ON DELETE CASCADE,
  validation_level validation_level NOT NULL,
  validator_id UUID REFERENCES auth.users(id),
  validator_name TEXT,
  status validation_status DEFAULT 'En attente',
  comments TEXT,
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE mission_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mission validations readable by authenticated" ON mission_validations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Mission validations manageable by validators" ON mission_validations
  FOR UPDATE TO authenticated USING (
    validator_id = auth.uid() 
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Mission validations insertable by system" ON mission_validations
  FOR INSERT TO authenticated WITH CHECK (true);

-- ========================================
-- TABLE: mission_expenses (Dépenses détaillées)
-- ========================================
CREATE TABLE IF NOT EXISTS mission_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES mission_orders(id) ON DELETE CASCADE,
  expense_category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'FCFA',
  expense_date DATE,
  receipt_number TEXT,
  receipt_url TEXT,
  is_justified BOOLEAN DEFAULT FALSE,
  justification_status TEXT DEFAULT 'En attente',
  comptable_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE mission_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mission expenses readable by authenticated" ON mission_expenses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Mission expenses manageable by creators" ON mission_expenses
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM mission_orders WHERE id = mission_id AND created_by = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- ========================================
-- TABLE: per_diem_rates (Barème per diem par pays)
-- ========================================
CREATE TABLE IF NOT EXISTS per_diem_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  city TEXT,
  daily_rate NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'FCFA',
  accommodation_rate NUMERIC(15,2),
  meal_rate NUMERIC(15,2),
  effective_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(country, city, effective_date)
);

ALTER TABLE per_diem_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Per diem rates readable by authenticated" ON per_diem_rates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Per diem rates manageable by admin" ON per_diem_rates
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ========================================
-- TABLE: mission_alerts (Alertes missions)
-- ========================================
CREATE TABLE IF NOT EXISTS mission_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES mission_orders(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  alert_message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  target_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE mission_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mission alerts readable by target user" ON mission_alerts
  FOR SELECT TO authenticated USING (
    target_user_id = auth.uid() 
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Mission alerts updatable by target user" ON mission_alerts
  FOR UPDATE TO authenticated USING (
    target_user_id = auth.uid() 
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Mission alerts insertable" ON mission_alerts
  FOR INSERT TO authenticated WITH CHECK (true);

-- ========================================
-- TABLE: mission_reports (Rapports de mission)
-- ========================================
CREATE TABLE IF NOT EXISTS mission_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES mission_orders(id) ON DELETE CASCADE,
  report_title TEXT NOT NULL,
  executive_summary TEXT,
  objectives_reminder TEXT,
  results_obtained TEXT,
  daily_activities JSONB DEFAULT '[]',
  people_met JSONB DEFAULT '[]',
  topics_discussed TEXT,
  opportunities JSONB DEFAULT '[]',
  b2b_contacts JSONB DEFAULT '[]',
  agreements JSONB DEFAULT '[]',
  difficulties TEXT,
  recommendations TEXT,
  follow_up_actions JSONB DEFAULT '[]',
  documents_collected TEXT[],
  photo_urls TEXT[],
  report_file_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  validation_comments TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE mission_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mission reports readable by authenticated" ON mission_reports
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Mission reports manageable by creators" ON mission_reports
  FOR ALL TO authenticated USING (
    created_by = auth.uid()
    OR has_role(auth.uid(), 'admin')
  );

-- ========================================
-- TABLE: mission_liquidations (Liquidation des frais)
-- ========================================
CREATE TABLE IF NOT EXISTS mission_liquidations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES mission_orders(id) ON DELETE CASCADE,
  advance_received NUMERIC(15,2) DEFAULT 0,
  total_expenses NUMERIC(15,2) DEFAULT 0,
  variance NUMERIC(15,2) DEFAULT 0,
  amount_to_refund NUMERIC(15,2) DEFAULT 0,
  amount_to_reimburse NUMERIC(15,2) DEFAULT 0,
  status liquidation_status DEFAULT 'En attente',
  comptable_id UUID REFERENCES auth.users(id),
  comptable_validation_date TIMESTAMP WITH TIME ZONE,
  comptable_comments TEXT,
  accounting_entry_number TEXT,
  analytical_code TEXT,
  payment_date DATE,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE mission_liquidations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mission liquidations readable by authenticated" ON mission_liquidations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Mission liquidations manageable by comptable or admin" ON mission_liquidations
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ========================================
-- TABLE: mission_settings (Paramétrage du module)
-- ========================================
CREATE TABLE IF NOT EXISTS mission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE mission_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mission settings readable by authenticated" ON mission_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Mission settings manageable by admin" ON mission_settings
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Insérer les paramètres par défaut
INSERT INTO mission_settings (setting_key, setting_value, description) VALUES
  ('validation_thresholds', '{"N1_max": 500000, "DAF_max": 2000000, "DG_required_above": 2000000}', 'Seuils de validation par niveau (FCFA)'),
  ('report_deadline_days', '7', 'Délai de soumission du rapport après retour (jours)'),
  ('advance_percentage', '80', 'Pourcentage de l''avance sur budget estimé'),
  ('passport_alert_months', '6', 'Alerte passeport X mois avant expiration'),
  ('mission_reminder_days', '[7, 2, 1]', 'Rappels avant le départ (jours)'),
  ('expense_categories', '["Transport", "Hébergement", "Per diem", "Visa", "Assurance", "Restauration", "Communication", "Autres"]', 'Catégories de dépenses')
ON CONFLICT (setting_key) DO NOTHING;

-- ========================================
-- FUNCTION: Générer le numéro de mission automatiquement
-- ========================================
CREATE OR REPLACE FUNCTION generate_mission_number()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
  type_prefix TEXT;
BEGIN
  IF NEW.mission_number IS NULL OR NEW.mission_number = '' THEN
    year_str := to_char(CURRENT_DATE, 'YYYY');
    type_prefix := CASE WHEN NEW.mission_type = 'Internationale' THEN 'MI' ELSE 'MN' END;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(mission_number FROM type_prefix || '-' || year_str || '-(\d+)') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM mission_orders
    WHERE mission_number LIKE type_prefix || '-' || year_str || '-%';
    
    NEW.mission_number := type_prefix || '-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_generate_mission_number ON mission_orders;
CREATE TRIGGER tr_generate_mission_number
  BEFORE INSERT ON mission_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_mission_number();

-- ========================================
-- FUNCTION: Calculer automatiquement les jours ouvrables et week-ends
-- ========================================
CREATE OR REPLACE FUNCTION calculate_mission_days()
RETURNS TRIGGER AS $$
DECLARE
  current_date_loop DATE;
  wd_count INTEGER := 0;
  we_count INTEGER := 0;
BEGIN
  IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL THEN
    current_date_loop := NEW.start_date;
    WHILE current_date_loop <= NEW.end_date LOOP
      IF EXTRACT(DOW FROM current_date_loop) IN (0, 6) THEN
        we_count := we_count + 1;
      ELSE
        wd_count := wd_count + 1;
      END IF;
      current_date_loop := current_date_loop + INTERVAL '1 day';
    END LOOP;
    
    NEW.working_days := wd_count;
    NEW.weekend_days := we_count;
    NEW.duration_days := wd_count + we_count;
    
    -- Définir la date limite du rapport (7 jours après retour)
    NEW.report_due_date := NEW.end_date + INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_calculate_mission_days ON mission_orders;
CREATE TRIGGER tr_calculate_mission_days
  BEFORE INSERT OR UPDATE OF start_date, end_date ON mission_orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_mission_days();

-- ========================================
-- FUNCTION: Calculer le budget total automatiquement
-- ========================================
CREATE OR REPLACE FUNCTION calculate_mission_budget()
RETURNS TRIGGER AS $$
BEGIN
  NEW.estimated_budget := COALESCE(NEW.transport_cost, 0) 
    + COALESCE(NEW.accommodation_cost, 0) 
    + COALESCE(NEW.per_diem_amount, 0) 
    + COALESCE(NEW.visa_cost, 0) 
    + COALESCE(NEW.insurance_cost, 0) 
    + COALESCE(NEW.other_costs, 0);
  
  -- Calculer l'avance (80% par défaut)
  NEW.advance_amount := NEW.estimated_budget * 0.8;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_calculate_mission_budget ON mission_orders;
CREATE TRIGGER tr_calculate_mission_budget
  BEFORE INSERT OR UPDATE OF transport_cost, accommodation_cost, per_diem_amount, visa_cost, insurance_cost, other_costs ON mission_orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_mission_budget();

-- ========================================
-- FUNCTION: Créer le workflow de validation
-- ========================================
CREATE OR REPLACE FUNCTION create_mission_validation_workflow()
RETURNS TRIGGER AS $$
BEGIN
  -- Quand le statut passe à "Soumise", créer les étapes de validation
  IF NEW.extended_status = 'Soumise' AND (OLD.extended_status IS NULL OR OLD.extended_status = 'Brouillon' OR OLD.extended_status = 'Rejetée') THEN
    -- Supprimer les anciennes validations si resoumission
    DELETE FROM mission_validations WHERE mission_id = NEW.id;
    
    -- Créer les 3 niveaux de validation
    INSERT INTO mission_validations (mission_id, validation_level, status) VALUES
      (NEW.id, 'N1_Superieur', 'En attente'),
      (NEW.id, 'N2_DAF', 'En attente'),
      (NEW.id, 'N3_DG', 'En attente');
    
    NEW.extended_status := 'En validation N1';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_create_mission_validation_workflow ON mission_orders;
CREATE TRIGGER tr_create_mission_validation_workflow
  BEFORE UPDATE OF extended_status ON mission_orders
  FOR EACH ROW
  EXECUTE FUNCTION create_mission_validation_workflow();

-- ========================================
-- FUNCTION: Notification quand mission approuvée
-- ========================================
CREATE OR REPLACE FUNCTION notify_mission_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.extended_status = 'Approuvée' AND OLD.extended_status != 'Approuvée' THEN
    -- Notifier l'employé
    INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
    SELECT 
      e.user_id,
      'Mission approuvée',
      'Votre demande de mission "' || NEW.purpose || '" vers ' || NEW.destination || ' a été approuvée.',
      'success',
      'mission_orders',
      NEW.id
    FROM employees e
    WHERE e.id = NEW.employee_id AND e.user_id IS NOT NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_notify_mission_approved ON mission_orders;
CREATE TRIGGER tr_notify_mission_approved
  AFTER UPDATE OF extended_status ON mission_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_mission_approved();

-- ========================================
-- FUNCTION: Vérifier et alerter sur rapport en retard
-- ========================================
CREATE OR REPLACE FUNCTION check_overdue_mission_reports()
RETURNS void AS $$
DECLARE
  mission_record RECORD;
BEGIN
  FOR mission_record IN 
    SELECT mo.id, mo.purpose, mo.destination, mo.employee_id, mo.report_due_date, e.user_id
    FROM mission_orders mo
    JOIN employees e ON mo.employee_id = e.id
    WHERE mo.extended_status = 'En attente rapport'
    AND mo.report_due_date < CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM mission_alerts ma 
      WHERE ma.mission_id = mo.id 
      AND ma.alert_type = 'report_overdue'
      AND ma.created_at > CURRENT_DATE - INTERVAL '1 day'
    )
  LOOP
    -- Créer une alerte
    INSERT INTO mission_alerts (mission_id, alert_type, alert_message, target_user_id)
    VALUES (
      mission_record.id,
      'report_overdue',
      'Le rapport de mission "' || mission_record.purpose || '" est en retard. Date limite: ' || mission_record.report_due_date,
      mission_record.user_id
    );
    
    -- Créer une notification
    IF mission_record.user_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
      VALUES (
        mission_record.user_id,
        'Rapport de mission en retard',
        'Le rapport de votre mission vers ' || mission_record.destination || ' est en retard. Veuillez le soumettre rapidement.',
        'warning',
        'mission_orders',
        mission_record.id
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ========================================
-- INDEX pour performances
-- ========================================
CREATE INDEX IF NOT EXISTS idx_mission_orders_extended_status ON mission_orders(extended_status);
CREATE INDEX IF NOT EXISTS idx_mission_orders_mission_type ON mission_orders(mission_type);
CREATE INDEX IF NOT EXISTS idx_mission_orders_employee ON mission_orders(employee_id);
CREATE INDEX IF NOT EXISTS idx_mission_orders_dates ON mission_orders(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_mission_validations_mission ON mission_validations(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_expenses_mission ON mission_expenses(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_alerts_target ON mission_alerts(target_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_per_diem_country ON per_diem_rates(country, city);

-- ========================================
-- Insérer quelques barèmes per diem par défaut
-- ========================================
INSERT INTO per_diem_rates (country, city, daily_rate, accommodation_rate, meal_rate, currency) VALUES
  ('Côte d''Ivoire', NULL, 50000, 35000, 15000, 'FCFA'),
  ('Côte d''Ivoire', 'Abidjan', 75000, 50000, 25000, 'FCFA'),
  ('France', NULL, 150000, 100000, 50000, 'FCFA'),
  ('France', 'Paris', 200000, 150000, 50000, 'FCFA'),
  ('Sénégal', NULL, 60000, 40000, 20000, 'FCFA'),
  ('Sénégal', 'Dakar', 80000, 55000, 25000, 'FCFA'),
  ('Maroc', NULL, 70000, 50000, 20000, 'FCFA'),
  ('Maroc', 'Casablanca', 90000, 60000, 30000, 'FCFA'),
  ('Ghana', NULL, 55000, 35000, 20000, 'FCFA'),
  ('Ghana', 'Accra', 70000, 45000, 25000, 'FCFA'),
  ('Nigeria', NULL, 65000, 45000, 20000, 'FCFA'),
  ('Nigeria', 'Lagos', 85000, 60000, 25000, 'FCFA'),
  ('Allemagne', NULL, 160000, 110000, 50000, 'FCFA'),
  ('Belgique', NULL, 140000, 95000, 45000, 'FCFA'),
  ('États-Unis', NULL, 180000, 130000, 50000, 'FCFA'),
  ('Chine', NULL, 120000, 80000, 40000, 'FCFA'),
  ('Dubaï', NULL, 170000, 120000, 50000, 'FCFA')
ON CONFLICT DO NOTHING;