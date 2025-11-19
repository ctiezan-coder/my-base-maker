-- Fonction pour mettre à jour les KPIs de formation
CREATE OR REPLACE FUNCTION update_training_kpis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
  v_period date;
BEGIN
  v_period := DATE_TRUNC('month', NEW.start_date::date);
  
  -- Compter le nombre de formations pour cette direction ce mois
  SELECT COUNT(*) INTO v_count
  FROM trainings
  WHERE direction_id = NEW.direction_id
  AND DATE_TRUNC('month', start_date::date) = v_period;
  
  -- Insérer ou mettre à jour le KPI
  INSERT INTO kpi_tracking (
    kpi_name,
    kpi_value,
    period,
    direction_id,
    unit,
    notes,
    created_by
  ) VALUES (
    'Nombre de formations organisées',
    v_count,
    v_period,
    NEW.direction_id,
    'formations',
    'KPI généré automatiquement depuis les formations',
    NEW.created_by
  )
  ON CONFLICT (direction_id, kpi_name, period) 
  DO UPDATE SET 
    kpi_value = v_count,
    notes = 'KPI généré automatiquement depuis les formations (mis à jour)';
  
  RETURN NEW;
END;
$function$;

-- Fonction pour mettre à jour les KPIs d'événements
CREATE OR REPLACE FUNCTION update_event_kpis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
  v_period date;
BEGIN
  v_period := DATE_TRUNC('month', NEW.start_date::date);
  
  SELECT COUNT(*) INTO v_count
  FROM events
  WHERE direction_id = NEW.direction_id
  AND DATE_TRUNC('month', start_date::date) = v_period;
  
  INSERT INTO kpi_tracking (
    kpi_name,
    kpi_value,
    period,
    direction_id,
    unit,
    notes,
    created_by
  ) VALUES (
    'Nombre d''événements organisés',
    v_count,
    v_period,
    NEW.direction_id,
    'événements',
    'KPI généré automatiquement depuis les événements',
    NEW.created_by
  )
  ON CONFLICT (direction_id, kpi_name, period) 
  DO UPDATE SET 
    kpi_value = v_count,
    notes = 'KPI généré automatiquement depuis les événements (mis à jour)';
  
  RETURN NEW;
END;
$function$;

-- Fonction pour mettre à jour les KPIs de connexions business
CREATE OR REPLACE FUNCTION update_connection_kpis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
  v_total_value numeric;
  v_period date;
BEGIN
  v_period := DATE_TRUNC('month', NEW.connection_date);
  
  -- Nombre de connexions
  SELECT COUNT(*) INTO v_count
  FROM business_connections
  WHERE direction_id = NEW.direction_id
  AND DATE_TRUNC('month', connection_date) = v_period
  AND status IN ('Contrat signé', 'En cours');
  
  INSERT INTO kpi_tracking (
    kpi_name,
    kpi_value,
    period,
    direction_id,
    unit,
    notes,
    created_by
  ) VALUES (
    'Nombre de connexions business',
    v_count,
    v_period,
    NEW.direction_id,
    'connexions',
    'KPI généré automatiquement depuis les connexions business',
    NEW.created_by
  )
  ON CONFLICT (direction_id, kpi_name, period) 
  DO UPDATE SET 
    kpi_value = v_count,
    notes = 'KPI généré automatiquement depuis les connexions business (mis à jour)';
  
  -- Valeur totale des contrats
  SELECT COALESCE(SUM(contract_value), 0) INTO v_total_value
  FROM business_connections
  WHERE direction_id = NEW.direction_id
  AND DATE_TRUNC('month', connection_date) = v_period
  AND status IN ('Contrat signé', 'En cours');
  
  INSERT INTO kpi_tracking (
    kpi_name,
    kpi_value,
    period,
    direction_id,
    unit,
    notes,
    created_by
  ) VALUES (
    'Valeur totale des contrats',
    v_total_value,
    v_period,
    NEW.direction_id,
    '€',
    'KPI généré automatiquement depuis les connexions business',
    NEW.created_by
  )
  ON CONFLICT (direction_id, kpi_name, period) 
  DO UPDATE SET 
    kpi_value = v_total_value,
    notes = 'KPI généré automatiquement depuis les connexions business (mis à jour)';
  
  RETURN NEW;
END;
$function$;

-- Fonction pour mettre à jour les KPIs d'opportunités
CREATE OR REPLACE FUNCTION update_opportunity_kpis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
  v_total_value numeric;
  v_period date;
BEGIN
  IF NEW.direction_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  v_period := DATE_TRUNC('month', NEW.created_at::date);
  
  -- Nombre d'opportunités en cours
  SELECT COUNT(*) INTO v_count
  FROM export_opportunities
  WHERE direction_id = NEW.direction_id
  AND DATE_TRUNC('month', created_at::date) = v_period
  AND status = 'EN_COURS';
  
  INSERT INTO kpi_tracking (
    kpi_name,
    kpi_value,
    period,
    direction_id,
    unit,
    notes,
    created_by
  ) VALUES (
    'Opportunités d''export en cours',
    v_count,
    v_period,
    NEW.direction_id,
    'opportunités',
    'KPI généré automatiquement depuis les opportunités d''export',
    NEW.created_by
  )
  ON CONFLICT (direction_id, kpi_name, period) 
  DO UPDATE SET 
    kpi_value = v_count,
    notes = 'KPI généré automatiquement depuis les opportunités d''export (mis à jour)';
  
  -- Valeur totale des opportunités
  SELECT COALESCE(SUM(estimated_value), 0) INTO v_total_value
  FROM export_opportunities
  WHERE direction_id = NEW.direction_id
  AND DATE_TRUNC('month', created_at::date) = v_period
  AND status = 'EN_COURS';
  
  INSERT INTO kpi_tracking (
    kpi_name,
    kpi_value,
    period,
    direction_id,
    unit,
    notes,
    created_by
  ) VALUES (
    'Valeur totale opportunités',
    v_total_value,
    v_period,
    NEW.direction_id,
    '€',
    'KPI généré automatiquement depuis les opportunités d''export',
    NEW.created_by
  )
  ON CONFLICT (direction_id, kpi_name, period) 
  DO UPDATE SET 
    kpi_value = v_total_value,
    notes = 'KPI généré automatiquement depuis les opportunités d''export (mis à jour)';
  
  RETURN NEW;
END;
$function$;

-- Fonction pour mettre à jour les KPIs de partenariats
CREATE OR REPLACE FUNCTION update_partnership_kpis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
  v_period date;
BEGIN
  v_period := DATE_TRUNC('month', COALESCE(NEW.start_date, CURRENT_DATE));
  
  SELECT COUNT(*) INTO v_count
  FROM partnerships
  WHERE direction_id = NEW.direction_id
  AND DATE_TRUNC('month', COALESCE(start_date, created_at::date)) = v_period
  AND status IN ('actif', 'en cours', 'Actif', 'En cours');
  
  INSERT INTO kpi_tracking (
    kpi_name,
    kpi_value,
    period,
    direction_id,
    unit,
    notes,
    created_by
  ) VALUES (
    'Nombre de partenariats actifs',
    v_count,
    v_period,
    NEW.direction_id,
    'partenariats',
    'KPI généré automatiquement depuis les partenariats',
    NEW.created_by
  )
  ON CONFLICT (direction_id, kpi_name, period) 
  DO UPDATE SET 
    kpi_value = v_count,
    notes = 'KPI généré automatiquement depuis les partenariats (mis à jour)';
  
  RETURN NEW;
END;
$function$;

-- Créer une contrainte unique pour éviter les doublons de KPIs
ALTER TABLE kpi_tracking ADD CONSTRAINT unique_kpi_per_direction_period 
UNIQUE (direction_id, kpi_name, period);

-- Créer les triggers
DROP TRIGGER IF EXISTS trigger_update_training_kpis ON trainings;
CREATE TRIGGER trigger_update_training_kpis
AFTER INSERT OR UPDATE ON trainings
FOR EACH ROW
EXECUTE FUNCTION update_training_kpis();

DROP TRIGGER IF EXISTS trigger_update_event_kpis ON events;
CREATE TRIGGER trigger_update_event_kpis
AFTER INSERT OR UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_event_kpis();

DROP TRIGGER IF EXISTS trigger_update_connection_kpis ON business_connections;
CREATE TRIGGER trigger_update_connection_kpis
AFTER INSERT OR UPDATE ON business_connections
FOR EACH ROW
EXECUTE FUNCTION update_connection_kpis();

DROP TRIGGER IF EXISTS trigger_update_opportunity_kpis ON export_opportunities;
CREATE TRIGGER trigger_update_opportunity_kpis
AFTER INSERT OR UPDATE ON export_opportunities
FOR EACH ROW
EXECUTE FUNCTION update_opportunity_kpis();

DROP TRIGGER IF EXISTS trigger_update_partnership_kpis ON partnerships;
CREATE TRIGGER trigger_update_partnership_kpis
AFTER INSERT OR UPDATE ON partnerships
FOR EACH ROW
EXECUTE FUNCTION update_partnership_kpis();

-- Générer les KPIs pour les données existantes avec une approche directe
DO $$
DECLARE
  v_direction_id uuid;
  v_period date;
  v_count integer;
  v_total_value numeric;
BEGIN
  -- KPIs pour les formations
  FOR v_direction_id, v_period IN 
    SELECT DISTINCT direction_id, DATE_TRUNC('month', start_date::date)
    FROM trainings
    WHERE direction_id IS NOT NULL
  LOOP
    SELECT COUNT(*) INTO v_count
    FROM trainings
    WHERE direction_id = v_direction_id
    AND DATE_TRUNC('month', start_date::date) = v_period;
    
    INSERT INTO kpi_tracking (kpi_name, kpi_value, period, direction_id, unit, notes)
    VALUES ('Nombre de formations organisées', v_count, v_period, v_direction_id, 'formations', 
            'KPI généré automatiquement depuis les formations')
    ON CONFLICT (direction_id, kpi_name, period) DO UPDATE SET kpi_value = v_count;
  END LOOP;
  
  -- KPIs pour les événements
  FOR v_direction_id, v_period IN 
    SELECT DISTINCT direction_id, DATE_TRUNC('month', start_date::date)
    FROM events
    WHERE direction_id IS NOT NULL
  LOOP
    SELECT COUNT(*) INTO v_count
    FROM events
    WHERE direction_id = v_direction_id
    AND DATE_TRUNC('month', start_date::date) = v_period;
    
    INSERT INTO kpi_tracking (kpi_name, kpi_value, period, direction_id, unit, notes)
    VALUES ('Nombre d''événements organisés', v_count, v_period, v_direction_id, 'événements',
            'KPI généré automatiquement depuis les événements')
    ON CONFLICT (direction_id, kpi_name, period) DO UPDATE SET kpi_value = v_count;
  END LOOP;
  
  -- KPIs pour les connexions business (nombre)
  FOR v_direction_id, v_period IN 
    SELECT DISTINCT direction_id, DATE_TRUNC('month', connection_date)
    FROM business_connections
    WHERE direction_id IS NOT NULL
    AND status IN ('Contrat signé', 'En cours')
  LOOP
    SELECT COUNT(*) INTO v_count
    FROM business_connections
    WHERE direction_id = v_direction_id
    AND DATE_TRUNC('month', connection_date) = v_period
    AND status IN ('Contrat signé', 'En cours');
    
    INSERT INTO kpi_tracking (kpi_name, kpi_value, period, direction_id, unit, notes)
    VALUES ('Nombre de connexions business', v_count, v_period, v_direction_id, 'connexions',
            'KPI généré automatiquement depuis les connexions business')
    ON CONFLICT (direction_id, kpi_name, period) DO UPDATE SET kpi_value = v_count;
    
    -- Valeur des contrats
    SELECT COALESCE(SUM(contract_value), 0) INTO v_total_value
    FROM business_connections
    WHERE direction_id = v_direction_id
    AND DATE_TRUNC('month', connection_date) = v_period
    AND status IN ('Contrat signé', 'En cours');
    
    INSERT INTO kpi_tracking (kpi_name, kpi_value, period, direction_id, unit, notes)
    VALUES ('Valeur totale des contrats', v_total_value, v_period, v_direction_id, '€',
            'KPI généré automatiquement depuis les connexions business')
    ON CONFLICT (direction_id, kpi_name, period) DO UPDATE SET kpi_value = v_total_value;
  END LOOP;
  
  -- KPIs pour les opportunités (nombre)
  FOR v_direction_id, v_period IN 
    SELECT DISTINCT direction_id, DATE_TRUNC('month', created_at::date)
    FROM export_opportunities
    WHERE direction_id IS NOT NULL
    AND status = 'EN_COURS'
  LOOP
    SELECT COUNT(*) INTO v_count
    FROM export_opportunities
    WHERE direction_id = v_direction_id
    AND DATE_TRUNC('month', created_at::date) = v_period
    AND status = 'EN_COURS';
    
    INSERT INTO kpi_tracking (kpi_name, kpi_value, period, direction_id, unit, notes)
    VALUES ('Opportunités d''export en cours', v_count, v_period, v_direction_id, 'opportunités',
            'KPI généré automatiquement depuis les opportunités d''export')
    ON CONFLICT (direction_id, kpi_name, period) DO UPDATE SET kpi_value = v_count;
    
    -- Valeur des opportunités
    SELECT COALESCE(SUM(estimated_value), 0) INTO v_total_value
    FROM export_opportunities
    WHERE direction_id = v_direction_id
    AND DATE_TRUNC('month', created_at::date) = v_period
    AND status = 'EN_COURS';
    
    INSERT INTO kpi_tracking (kpi_name, kpi_value, period, direction_id, unit, notes)
    VALUES ('Valeur totale opportunités', v_total_value, v_period, v_direction_id, '€',
            'KPI généré automatiquement depuis les opportunités d''export')
    ON CONFLICT (direction_id, kpi_name, period) DO UPDATE SET kpi_value = v_total_value;
  END LOOP;
  
  -- KPIs pour les partenariats
  FOR v_direction_id, v_period IN 
    SELECT DISTINCT direction_id, DATE_TRUNC('month', COALESCE(start_date, created_at::date))
    FROM partnerships
    WHERE direction_id IS NOT NULL
    AND status IN ('actif', 'en cours', 'Actif', 'En cours')
  LOOP
    SELECT COUNT(*) INTO v_count
    FROM partnerships
    WHERE direction_id = v_direction_id
    AND DATE_TRUNC('month', COALESCE(start_date, created_at::date)) = v_period
    AND status IN ('actif', 'en cours', 'Actif', 'En cours');
    
    INSERT INTO kpi_tracking (kpi_name, kpi_value, period, direction_id, unit, notes)
    VALUES ('Nombre de partenariats actifs', v_count, v_period, v_direction_id, 'partenariats',
            'KPI généré automatiquement depuis les partenariats')
    ON CONFLICT (direction_id, kpi_name, period) DO UPDATE SET kpi_value = v_count;
  END LOOP;
END $$;