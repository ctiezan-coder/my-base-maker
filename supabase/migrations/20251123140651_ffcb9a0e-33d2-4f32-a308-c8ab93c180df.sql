-- Modifier les triggers KPI pour inclure les détails des événements/activités

-- 1. Mettre à jour le trigger pour les événements
CREATE OR REPLACE FUNCTION public.update_event_kpis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
  v_period date;
  v_event_list text;
BEGIN
  v_period := DATE_TRUNC('month', NEW.start_date::date);
  
  -- Compter les événements
  SELECT COUNT(*) INTO v_count
  FROM events
  WHERE direction_id = NEW.direction_id
  AND DATE_TRUNC('month', start_date::date) = v_period;
  
  -- Créer la liste des événements
  SELECT string_agg(
    '• ' || title || ' (' || event_type || ', ' || to_char(start_date, 'DD/MM/YYYY') || ')',
    E'\n'
    ORDER BY start_date
  ) INTO v_event_list
  FROM events
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
    'Nombre d''événements organisés',
    v_count,
    v_period,
    NEW.direction_id,
    'événements',
    'KPI généré automatiquement. Liste des événements:' || E'\n' || COALESCE(v_event_list, 'Aucun événement'),
    NEW.created_by
  )
  ON CONFLICT (direction_id, kpi_name, period) 
  DO UPDATE SET 
    kpi_value = v_count,
    notes = 'KPI généré automatiquement. Liste des événements:' || E'\n' || COALESCE(v_event_list, 'Aucun événement');
  
  RETURN NEW;
END;
$function$;

-- 2. Mettre à jour le trigger pour les formations
CREATE OR REPLACE FUNCTION public.update_training_kpis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
  v_period date;
  v_training_list text;
BEGIN
  v_period := DATE_TRUNC('month', NEW.start_date::date);
  
  -- Compter les formations
  SELECT COUNT(*) INTO v_count
  FROM trainings
  WHERE direction_id = NEW.direction_id
  AND DATE_TRUNC('month', start_date::date) = v_period;
  
  -- Créer la liste des formations
  SELECT string_agg(
    '• ' || title || ' (' || training_type || ', ' || to_char(start_date, 'DD/MM/YYYY') || ')',
    E'\n'
    ORDER BY start_date
  ) INTO v_training_list
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
    'KPI généré automatiquement. Liste des formations:' || E'\n' || COALESCE(v_training_list, 'Aucune formation'),
    NEW.created_by
  )
  ON CONFLICT (direction_id, kpi_name, period) 
  DO UPDATE SET 
    kpi_value = v_count,
    notes = 'KPI généré automatiquement. Liste des formations:' || E'\n' || COALESCE(v_training_list, 'Aucune formation');
  
  RETURN NEW;
END;
$function$;

-- 3. Mettre à jour le trigger pour les partenariats
CREATE OR REPLACE FUNCTION public.update_partnership_kpis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
  v_period date;
  v_partnership_list text;
BEGIN
  v_period := DATE_TRUNC('month', COALESCE(NEW.start_date, CURRENT_DATE));
  
  -- Compter les partenariats
  SELECT COUNT(*) INTO v_count
  FROM partnerships
  WHERE direction_id = NEW.direction_id
  AND DATE_TRUNC('month', COALESCE(start_date, created_at::date)) = v_period
  AND status IN ('actif', 'en cours', 'Actif', 'En cours');
  
  -- Créer la liste des partenariats
  SELECT string_agg(
    '• ' || partner_name || ' (' || COALESCE(partner_type, 'Type non spécifié') || ')',
    E'\n'
    ORDER BY partner_name
  ) INTO v_partnership_list
  FROM partnerships
  WHERE direction_id = NEW.direction_id
  AND DATE_TRUNC('month', COALESCE(start_date, created_at::date)) = v_period
  AND status IN ('actif', 'en cours', 'Actif', 'En cours');
  
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
    'Nombre de partenariats actifs',
    v_count,
    v_period,
    NEW.direction_id,
    'partenariats',
    'KPI généré automatiquement. Liste des partenariats:' || E'\n' || COALESCE(v_partnership_list, 'Aucun partenariat'),
    NEW.created_by
  )
  ON CONFLICT (direction_id, kpi_name, period) 
  DO UPDATE SET 
    kpi_value = v_count,
    notes = 'KPI généré automatiquement. Liste des partenariats:' || E'\n' || COALESCE(v_partnership_list, 'Aucun partenariat');
  
  RETURN NEW;
END;
$function$;

-- 4. Mettre à jour le trigger pour les connexions business
CREATE OR REPLACE FUNCTION public.update_connection_kpis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
  v_total_value numeric;
  v_period date;
  v_connection_list text;
BEGIN
  v_period := DATE_TRUNC('month', NEW.connection_date);
  
  -- Nombre de connexions
  SELECT COUNT(*) INTO v_count
  FROM business_connections
  WHERE direction_id = NEW.direction_id
  AND DATE_TRUNC('month', connection_date) = v_period
  AND status IN ('Contrat signé', 'En cours');
  
  -- Créer la liste des connexions
  SELECT string_agg(
    '• ' || pme_name || ' → ' || partner_name || ' (' || destination_country || ', ' || contract_value::text || ' ' || COALESCE(currency, '€') || ')',
    E'\n'
    ORDER BY connection_date DESC
  ) INTO v_connection_list
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
    'KPI généré automatiquement. Liste des connexions:' || E'\n' || COALESCE(v_connection_list, 'Aucune connexion'),
    NEW.created_by
  )
  ON CONFLICT (direction_id, kpi_name, period) 
  DO UPDATE SET 
    kpi_value = v_count,
    notes = 'KPI généré automatiquement. Liste des connexions:' || E'\n' || COALESCE(v_connection_list, 'Aucune connexion');
  
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
    'KPI généré automatiquement. Détails:' || E'\n' || COALESCE(v_connection_list, 'Aucune connexion'),
    NEW.created_by
  )
  ON CONFLICT (direction_id, kpi_name, period) 
  DO UPDATE SET 
    kpi_value = v_total_value,
    notes = 'KPI généré automatiquement. Détails:' || E'\n' || COALESCE(v_connection_list, 'Aucune connexion');
  
  RETURN NEW;
END;
$function$;