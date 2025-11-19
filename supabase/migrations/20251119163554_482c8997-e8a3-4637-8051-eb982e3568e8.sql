-- Fonction pour créer automatiquement un projet et une imputation pour les formations
CREATE OR REPLACE FUNCTION public.create_project_and_tracking_for_training()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id uuid;
  v_direction_name text;
BEGIN
  -- Récupérer le nom de la direction
  SELECT name INTO v_direction_name FROM directions WHERE id = NEW.direction_id;
  
  -- Créer un projet pour la formation
  SELECT id INTO v_project_id 
  FROM projects 
  WHERE name = 'Formation: ' || NEW.title 
  AND direction_id = NEW.direction_id;
  
  IF v_project_id IS NULL THEN
    INSERT INTO projects (
      name,
      description,
      direction_id,
      start_date,
      end_date,
      status,
      priority_level,
      created_by
    ) VALUES (
      'Formation: ' || NEW.title,
      COALESCE(NEW.description, 'Projet créé automatiquement depuis la formation ' || NEW.title),
      NEW.direction_id,
      NEW.start_date::date,
      NEW.end_date::date,
      'en cours',
      '3',
      NEW.created_by
    ) RETURNING id INTO v_project_id;
    
    -- Créer une imputation pour le suivi & évaluation
    INSERT INTO imputations (
      date_reception,
      provenance,
      objet,
      imputation,
      direction_id,
      etat,
      date_imputation,
      observations,
      created_by
    ) VALUES (
      COALESCE(NEW.start_date::date, CURRENT_DATE),
      'Formation',
      'Formation: ' || NEW.title,
      v_direction_name || ' - ' || NEW.title || ' (' || NEW.training_type || ')',
      NEW.direction_id,
      'En cours',
      CURRENT_DATE,
      'Type: ' || NEW.training_type || 
      '. Lieu: ' || COALESCE(NEW.location, 'Non spécifié') ||
      CASE WHEN NEW.max_participants IS NOT NULL THEN '. Participants max: ' || NEW.max_participants::text ELSE '' END,
      NEW.created_by
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour les formations
CREATE TRIGGER trigger_create_project_from_training
AFTER INSERT OR UPDATE ON trainings
FOR EACH ROW
EXECUTE FUNCTION create_project_and_tracking_for_training();

-- Fonction pour créer automatiquement un projet et une imputation pour les événements
CREATE OR REPLACE FUNCTION public.create_project_and_tracking_for_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id uuid;
  v_direction_name text;
BEGIN
  -- Récupérer le nom de la direction
  SELECT name INTO v_direction_name FROM directions WHERE id = NEW.direction_id;
  
  -- Créer un projet pour l'événement
  SELECT id INTO v_project_id 
  FROM projects 
  WHERE name = 'Événement: ' || NEW.title 
  AND direction_id = NEW.direction_id;
  
  IF v_project_id IS NULL THEN
    INSERT INTO projects (
      name,
      description,
      direction_id,
      start_date,
      end_date,
      status,
      priority_level,
      created_by
    ) VALUES (
      'Événement: ' || NEW.title,
      COALESCE(NEW.description, 'Projet créé automatiquement depuis l''événement ' || NEW.title),
      NEW.direction_id,
      NEW.start_date::date,
      NEW.end_date::date,
      'en cours',
      '1',
      NEW.created_by
    ) RETURNING id INTO v_project_id;
    
    -- Créer une imputation pour le suivi & évaluation
    INSERT INTO imputations (
      date_reception,
      provenance,
      objet,
      imputation,
      direction_id,
      etat,
      date_imputation,
      observations,
      created_by
    ) VALUES (
      COALESCE(NEW.start_date::date, CURRENT_DATE),
      'Événement',
      'Événement: ' || NEW.title,
      v_direction_name || ' - ' || NEW.title || ' (' || NEW.event_type || ')',
      NEW.direction_id,
      'En cours',
      CURRENT_DATE,
      'Type: ' || NEW.event_type || 
      '. Lieu: ' || COALESCE(NEW.location, 'Non spécifié') ||
      CASE WHEN NEW.max_participants IS NOT NULL THEN '. Participants max: ' || NEW.max_participants::text ELSE '' END,
      NEW.created_by
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour les événements
CREATE TRIGGER trigger_create_project_from_event
AFTER INSERT OR UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION create_project_and_tracking_for_event();

-- Fonction pour créer automatiquement un projet et une imputation pour les connexions business
CREATE OR REPLACE FUNCTION public.create_project_and_tracking_for_connection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id uuid;
  v_direction_name text;
BEGIN
  -- Récupérer le nom de la direction
  SELECT name INTO v_direction_name FROM directions WHERE id = NEW.direction_id;
  
  -- Créer un projet seulement si le statut est "Contrat signé" ou "En cours"
  IF NEW.status IN ('Contrat signé', 'En cours') THEN
    SELECT id INTO v_project_id 
    FROM projects 
    WHERE name = 'Connexion Business: ' || NEW.pme_name || ' - ' || NEW.partner_name
    AND direction_id = NEW.direction_id;
    
    IF v_project_id IS NULL THEN
      INSERT INTO projects (
        name,
        description,
        direction_id,
        start_date,
        status,
        priority_level,
        created_by
      ) VALUES (
        'Connexion Business: ' || NEW.pme_name || ' - ' || NEW.partner_name,
        'Connexion business entre ' || NEW.pme_name || ' et ' || NEW.partner_name || ' (' || NEW.destination_country || ')',
        NEW.direction_id,
        NEW.connection_date,
        'en cours',
        '1',
        NEW.created_by
      ) RETURNING id INTO v_project_id;
      
      -- Créer une imputation pour le suivi & évaluation
      INSERT INTO imputations (
        date_reception,
        provenance,
        objet,
        imputation,
        direction_id,
        etat,
        date_imputation,
        observations,
        created_by
      ) VALUES (
        NEW.connection_date,
        'Connexion Business',
        'Connexion: ' || NEW.pme_name || ' - ' || NEW.partner_name,
        v_direction_name || ' - ' || NEW.pme_name || ' vers ' || NEW.destination_country,
        NEW.direction_id,
        'En cours',
        CURRENT_DATE,
        'Secteur: ' || NEW.sector || 
        '. Valeur contrat: ' || NEW.contract_value::text || ' ' || COALESCE(NEW.currency, '€') ||
        CASE WHEN NEW.jobs_created IS NOT NULL THEN '. Emplois créés: ' || NEW.jobs_created::text ELSE '' END,
        NEW.created_by
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour les connexions business
CREATE TRIGGER trigger_create_project_from_connection
AFTER INSERT OR UPDATE ON business_connections
FOR EACH ROW
EXECUTE FUNCTION create_project_and_tracking_for_connection();

-- Fonction pour créer automatiquement un projet et une imputation pour les opportunités d'export
CREATE OR REPLACE FUNCTION public.create_project_and_tracking_for_opportunity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id uuid;
  v_direction_name text;
BEGIN
  -- Récupérer le nom de la direction
  SELECT name INTO v_direction_name FROM directions WHERE id = NEW.direction_id;
  
  -- Créer un projet seulement si le statut est "EN_COURS"
  IF NEW.status = 'EN_COURS' AND NEW.direction_id IS NOT NULL THEN
    SELECT id INTO v_project_id 
    FROM projects 
    WHERE name = 'Opportunité Export: ' || NEW.title
    AND direction_id = NEW.direction_id;
    
    IF v_project_id IS NULL THEN
      INSERT INTO projects (
        name,
        description,
        direction_id,
        start_date,
        end_date,
        status,
        priority_level,
        created_by
      ) VALUES (
        'Opportunité Export: ' || NEW.title,
        COALESCE(NEW.description, 'Projet créé automatiquement depuis l''opportunité ' || NEW.title),
        NEW.direction_id,
        CURRENT_DATE,
        NEW.deadline,
        'en cours',
        '1',
        NEW.created_by
      ) RETURNING id INTO v_project_id;
      
      -- Créer une imputation pour le suivi & évaluation
      INSERT INTO imputations (
        date_reception,
        provenance,
        objet,
        imputation,
        direction_id,
        etat,
        date_imputation,
        observations,
        created_by
      ) VALUES (
        CURRENT_DATE,
        'Opportunité Export',
        'Opportunité: ' || NEW.title,
        v_direction_name || ' - ' || NEW.title || ' (' || NEW.destination_country || ')',
        NEW.direction_id,
        'En cours',
        CURRENT_DATE,
        'Secteur: ' || NEW.sector || 
        '. Région: ' || NEW.region ||
        '. Valeur estimée: ' || NEW.estimated_value::text || ' ' || COALESCE(NEW.currency, '€') ||
        '. Deadline: ' || NEW.deadline::text,
        NEW.created_by
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour les opportunités d'export
CREATE TRIGGER trigger_create_project_from_opportunity
AFTER INSERT OR UPDATE ON export_opportunities
FOR EACH ROW
EXECUTE FUNCTION create_project_and_tracking_for_opportunity();

-- Traiter les formations existantes
DO $$
DECLARE
  training_record RECORD;
BEGIN
  FOR training_record IN 
    SELECT * FROM trainings
  LOOP
    BEGIN
      PERFORM create_project_and_tracking_for_training()
      FROM (SELECT training_record.*) AS NEW;
    EXCEPTION WHEN OTHERS THEN
      CONTINUE;
    END;
  END LOOP;
END $$;

-- Traiter les événements existants
DO $$
DECLARE
  event_record RECORD;
BEGIN
  FOR event_record IN 
    SELECT * FROM events
  LOOP
    BEGIN
      PERFORM create_project_and_tracking_for_event()
      FROM (SELECT event_record.*) AS NEW;
    EXCEPTION WHEN OTHERS THEN
      CONTINUE;
    END;
  END LOOP;
END $$;

-- Traiter les connexions business existantes avec statut actif
DO $$
DECLARE
  connection_record RECORD;
BEGIN
  FOR connection_record IN 
    SELECT * FROM business_connections
    WHERE status IN ('Contrat signé', 'En cours')
  LOOP
    BEGIN
      PERFORM create_project_and_tracking_for_connection()
      FROM (SELECT connection_record.*) AS NEW;
    EXCEPTION WHEN OTHERS THEN
      CONTINUE;
    END;
  END LOOP;
END $$;

-- Traiter les opportunités existantes en cours
DO $$
DECLARE
  opportunity_record RECORD;
BEGIN
  FOR opportunity_record IN 
    SELECT * FROM export_opportunities
    WHERE status = 'EN_COURS' AND direction_id IS NOT NULL
  LOOP
    BEGIN
      PERFORM create_project_and_tracking_for_opportunity()
      FROM (SELECT opportunity_record.*) AS NEW;
    EXCEPTION WHEN OTHERS THEN
      CONTINUE;
    END;
  END LOOP;
END $$;