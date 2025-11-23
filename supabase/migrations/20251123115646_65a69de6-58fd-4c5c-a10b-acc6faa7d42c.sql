-- Ajouter le champ assigned_to à la table imputations
ALTER TABLE public.imputations 
ADD COLUMN assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Créer un index pour les requêtes sur assigned_to
CREATE INDEX idx_imputations_assigned_to ON public.imputations(assigned_to);

-- Modifier le trigger pour notifier la personne assignée
CREATE OR REPLACE FUNCTION public.notify_new_imputation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Notifier la personne assignée si elle existe et si elle n'est pas déjà dans la direction
  IF NEW.assigned_to IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
    SELECT 
      NEW.assigned_to,
      'Nouvelle imputation vous est assignée',
      'Vous avez été assigné(e) à l''imputation: ' || NEW.objet || ' (provenance: ' || NEW.provenance || ')',
      'warning',
      'imputations',
      NEW.id
    WHERE NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = NEW.assigned_to 
      AND direction_id = NEW.direction_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Modifier le trigger de changement de statut pour notifier aussi la personne assignée
CREATE OR REPLACE FUNCTION public.notify_imputation_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    
    -- Notifier la personne assignée si elle est différente du créateur
    IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != NEW.created_by THEN
      PERFORM create_notification(
        NEW.assigned_to,
        'Statut d''imputation modifié',
        'L''imputation "' || NEW.objet || '" qui vous est assignée est passée en statut: ' || NEW.etat,
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
    AND ura.role IN ('manager', 'admin')
    AND ura.user_id NOT IN (
      SELECT unnest(ARRAY[NEW.created_by, NEW.assigned_to]) 
      WHERE NEW.created_by IS NOT NULL OR NEW.assigned_to IS NOT NULL
    );
  END IF;
  
  RETURN NEW;
END;
$function$;