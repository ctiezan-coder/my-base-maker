
-- Remove imputation auto-creation from partnership trigger
CREATE OR REPLACE FUNCTION public.create_project_and_tracking_for_partnership()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_project_id uuid;
BEGIN
  IF NEW.status IN ('actif', 'en cours', 'Actif', 'En cours') THEN
    SELECT id INTO v_project_id 
    FROM projects 
    WHERE name = 'Partenariat: ' || NEW.partner_name 
    AND direction_id = NEW.direction_id;
    
    IF v_project_id IS NULL THEN
      INSERT INTO projects (name, description, direction_id, budget, start_date, end_date, status, priority_level, created_by)
      VALUES ('Partenariat: ' || NEW.partner_name, COALESCE(NEW.description, 'Projet créé automatiquement depuis le partenariat avec ' || NEW.partner_name), NEW.direction_id, NEW.budget, NEW.start_date, NEW.end_date, 'en cours', NEW.priority_level, NEW.created_by)
      RETURNING id INTO v_project_id;
      
      INSERT INTO partnership_projects (partnership_id, project_id)
      VALUES (NEW.id, v_project_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Remove imputation auto-creation from training trigger
CREATE OR REPLACE FUNCTION public.create_project_and_tracking_for_training()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_project_id uuid;
BEGIN
  SELECT id INTO v_project_id 
  FROM projects 
  WHERE name = 'Formation: ' || NEW.title 
  AND direction_id = NEW.direction_id;
  
  IF v_project_id IS NULL THEN
    INSERT INTO projects (name, description, direction_id, start_date, end_date, status, priority_level, created_by)
    VALUES ('Formation: ' || NEW.title, COALESCE(NEW.description, 'Projet créé automatiquement depuis la formation ' || NEW.title), NEW.direction_id, NEW.start_date::date, NEW.end_date::date, 'en cours', '3', NEW.created_by);
  END IF;
  RETURN NEW;
END;
$function$;

-- Remove imputation auto-creation from event trigger
CREATE OR REPLACE FUNCTION public.create_project_and_tracking_for_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_project_id uuid;
BEGIN
  SELECT id INTO v_project_id 
  FROM projects 
  WHERE name = 'Événement: ' || NEW.title 
  AND direction_id = NEW.direction_id;
  
  IF v_project_id IS NULL THEN
    INSERT INTO projects (name, description, direction_id, start_date, end_date, status, priority_level, created_by)
    VALUES ('Événement: ' || NEW.title, COALESCE(NEW.description, 'Projet créé automatiquement depuis l''événement ' || NEW.title), NEW.direction_id, NEW.start_date::date, NEW.end_date::date, 'en cours', '1', NEW.created_by);
  END IF;
  RETURN NEW;
END;
$function$;

-- Remove imputation auto-creation from connection trigger
CREATE OR REPLACE FUNCTION public.create_project_and_tracking_for_connection()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_project_id uuid;
BEGIN
  IF NEW.status IN ('Contrat signé', 'En cours') THEN
    SELECT id INTO v_project_id 
    FROM projects 
    WHERE name = 'Connexion Business: ' || NEW.pme_name || ' - ' || NEW.partner_name
    AND direction_id = NEW.direction_id;
    
    IF v_project_id IS NULL THEN
      INSERT INTO projects (name, description, direction_id, start_date, status, priority_level, created_by)
      VALUES ('Connexion Business: ' || NEW.pme_name || ' - ' || NEW.partner_name, 'Connexion business entre ' || NEW.pme_name || ' et ' || NEW.partner_name || ' (' || NEW.destination_country || ')', NEW.direction_id, NEW.connection_date, 'en cours', '1', NEW.created_by);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Remove imputation auto-creation from opportunity trigger
CREATE OR REPLACE FUNCTION public.create_project_and_tracking_for_opportunity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_project_id uuid;
BEGIN
  IF NEW.status = 'EN_COURS' AND NEW.direction_id IS NOT NULL THEN
    SELECT id INTO v_project_id 
    FROM projects 
    WHERE name = 'Opportunité Export: ' || NEW.title
    AND direction_id = NEW.direction_id;
    
    IF v_project_id IS NULL THEN
      INSERT INTO projects (name, description, direction_id, start_date, end_date, status, priority_level, created_by)
      VALUES ('Opportunité Export: ' || NEW.title, COALESCE(NEW.description, 'Projet créé automatiquement depuis l''opportunité ' || NEW.title), NEW.direction_id, CURRENT_DATE, NEW.deadline, 'en cours', '1', NEW.created_by);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
