-- Fonction pour créer des notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_reference_table text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_reference_table, p_reference_id);
END;
$$;

-- Trigger pour notifier les participants d'événements
CREATE OR REPLACE FUNCTION notify_event_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company record;
  v_event record;
BEGIN
  -- Récupérer l'événement
  SELECT * INTO v_event FROM events WHERE id = NEW.event_id;
  
  -- Récupérer l'entreprise et son créateur
  SELECT c.*, c.created_by 
  INTO v_company 
  FROM companies c 
  WHERE c.id = NEW.company_id;
  
  -- Notifier le créateur de l'entreprise
  IF v_company.created_by IS NOT NULL THEN
    PERFORM create_notification(
      v_company.created_by,
      'Participation à un événement',
      'L''opérateur ' || v_company.company_name || ' a été inscrit à l''événement ' || v_event.title,
      'info',
      'event_participants',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_event_participants ON event_participants;
CREATE TRIGGER trigger_notify_event_participants
  AFTER INSERT ON event_participants
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_participants();

-- Trigger pour notifier les inscriptions aux formations
CREATE OR REPLACE FUNCTION notify_training_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_training record;
BEGIN
  -- Récupérer la formation
  SELECT * INTO v_training FROM trainings WHERE id = NEW.training_id;
  
  -- Notifier tous les managers
  INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
  SELECT 
    ur.user_id,
    'Nouvelle inscription formation',
    'Nouvelle inscription de ' || NEW.participant_name || ' à la formation ' || v_training.title,
    'info',
    'training_registrations',
    NEW.id
  FROM user_roles ur
  WHERE ur.role IN ('admin', 'manager');
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_training_registration ON training_registrations;
CREATE TRIGGER trigger_notify_training_registration
  AFTER INSERT ON training_registrations
  FOR EACH ROW
  EXECUTE FUNCTION notify_training_registration();

-- Trigger pour notifier les nouvelles opportunités
CREATE OR REPLACE FUNCTION notify_new_opportunity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notifier tous les utilisateurs de la direction concernée
  IF NEW.direction_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
    SELECT 
      p.user_id,
      'Nouvelle opportunité d''export',
      'Nouvelle opportunité: ' || NEW.title || ' vers ' || NEW.destination_country,
      'success',
      'export_opportunities',
      NEW.id
    FROM profiles p
    WHERE p.direction_id = NEW.direction_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_opportunity ON export_opportunities;
CREATE TRIGGER trigger_notify_new_opportunity
  AFTER INSERT ON export_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_opportunity();

-- Trigger pour notifier les nouvelles imputations
CREATE OR REPLACE FUNCTION notify_new_imputation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notifier tous les utilisateurs de la direction concernée
  IF NEW.direction_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
    SELECT 
      p.user_id,
      'Nouvelle imputation',
      'Nouvelle imputation: ' || NEW.objet || ' (provenance: ' || NEW.provenance || ')',
      'info',
      'imputations',
      NEW.id
    FROM profiles p
    WHERE p.direction_id = NEW.direction_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_imputation ON imputations;
CREATE TRIGGER trigger_notify_new_imputation
  AFTER INSERT ON imputations
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_imputation();

-- Trigger pour notifier les changements de statut d'imputation
CREATE OR REPLACE FUNCTION notify_imputation_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notifier uniquement si l'état a changé
  IF OLD.etat IS DISTINCT FROM NEW.etat THEN
    -- Notifier le créateur
    IF NEW.created_by IS NOT NULL THEN
      PERFORM create_notification(
        NEW.created_by,
        'Statut d''imputation modifié',
        'L''imputation "' || NEW.objet || '" est passée en statut: ' || NEW.etat,
        'info',
        'imputations',
        NEW.id
      );
    END IF;
    
    -- Notifier aussi les managers de la direction
    INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
    SELECT DISTINCT
      ura.user_id,
      'Statut d''imputation modifié',
      'L''imputation "' || NEW.objet || '" est passée en statut: ' || NEW.etat,
      'info',
      'imputations',
      NEW.id
    FROM user_role_assignments ura
    WHERE ura.direction_id = NEW.direction_id
    AND ura.role IN ('manager', 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_imputation_status_change ON imputations;
CREATE TRIGGER trigger_notify_imputation_status_change
  AFTER UPDATE ON imputations
  FOR EACH ROW
  EXECUTE FUNCTION notify_imputation_status_change();

-- Trigger pour notifier les nouveaux partenariats
CREATE OR REPLACE FUNCTION notify_new_partnership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notifier tous les utilisateurs de la direction concernée
  INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
  SELECT 
    p.user_id,
    'Nouveau partenariat',
    'Nouveau partenariat avec ' || NEW.partner_name,
    'success',
    'partnerships',
    NEW.id
  FROM profiles p
  WHERE p.direction_id = NEW.direction_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_partnership ON partnerships;
CREATE TRIGGER trigger_notify_new_partnership
  AFTER INSERT ON partnerships
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_partnership();

-- Trigger pour notifier les nouveaux projets
CREATE OR REPLACE FUNCTION notify_new_project()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notifier tous les utilisateurs de la direction concernée
  INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
  SELECT 
    p.user_id,
    'Nouveau projet',
    'Nouveau projet: ' || NEW.name,
    'success',
    'projects',
    NEW.id
  FROM profiles p
  WHERE p.direction_id = NEW.direction_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_project ON projects;
CREATE TRIGGER trigger_notify_new_project
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_project();