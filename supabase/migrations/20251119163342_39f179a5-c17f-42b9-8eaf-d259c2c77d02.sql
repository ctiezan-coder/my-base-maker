-- Fonction pour créer automatiquement un projet et une imputation lors de la création/activation d'un partenariat
CREATE OR REPLACE FUNCTION public.create_project_and_tracking_for_partnership()
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
  
  -- Si le partenariat est actif (statut "actif" ou "en cours")
  IF NEW.status IN ('actif', 'en cours', 'Actif', 'En cours') THEN
    -- Vérifier si un projet existe déjà pour ce partenariat
    SELECT id INTO v_project_id 
    FROM projects 
    WHERE name = 'Partenariat: ' || NEW.partner_name 
    AND direction_id = NEW.direction_id;
    
    -- Si aucun projet n'existe, le créer
    IF v_project_id IS NULL THEN
      INSERT INTO projects (
        name,
        description,
        direction_id,
        budget,
        start_date,
        end_date,
        status,
        priority_level,
        created_by
      ) VALUES (
        'Partenariat: ' || NEW.partner_name,
        COALESCE(NEW.description, 'Projet créé automatiquement depuis le partenariat avec ' || NEW.partner_name),
        NEW.direction_id,
        NEW.budget,
        NEW.start_date,
        NEW.end_date,
        'en cours',
        NEW.priority_level,
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
        COALESCE(NEW.start_date, CURRENT_DATE),
        'Partenariat',
        'Partenariat avec ' || NEW.partner_name,
        v_direction_name || ' - ' || NEW.partner_name || ' (' || COALESCE(NEW.partner_type, 'Type non spécifié') || ')',
        NEW.direction_id,
        'En cours',
        CURRENT_DATE,
        'Type: ' || COALESCE(NEW.partner_type, 'Non spécifié') || 
        '. Contact: ' || COALESCE(NEW.contact_person, 'Non spécifié') ||
        CASE WHEN NEW.budget IS NOT NULL THEN '. Budget: ' || NEW.budget::text || ' FCFA' ELSE '' END,
        NEW.created_by
      );
      
      -- Créer un lien dans partnership_projects
      INSERT INTO partnership_projects (partnership_id, project_id)
      VALUES (NEW.id, v_project_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS trigger_create_project_from_partnership ON partnerships;

-- Créer le trigger sur la table partnerships
CREATE TRIGGER trigger_create_project_from_partnership
AFTER INSERT OR UPDATE OF status
ON partnerships
FOR EACH ROW
EXECUTE FUNCTION create_project_and_tracking_for_partnership();

-- Traiter tous les partenariats actifs existants
DO $$
DECLARE
  v_partnership record;
  v_project_id uuid;
  v_direction_name text;
BEGIN
  FOR v_partnership IN 
    SELECT * FROM partnerships 
    WHERE status IN ('actif', 'en cours', 'Actif', 'En cours')
  LOOP
    -- Récupérer le nom de la direction
    SELECT name INTO v_direction_name FROM directions WHERE id = v_partnership.direction_id;
    
    -- Vérifier si un projet existe déjà
    SELECT id INTO v_project_id 
    FROM projects 
    WHERE name = 'Partenariat: ' || v_partnership.partner_name 
    AND direction_id = v_partnership.direction_id;
    
    -- Si aucun projet n'existe, le créer
    IF v_project_id IS NULL THEN
      INSERT INTO projects (
        name,
        description,
        direction_id,
        budget,
        start_date,
        end_date,
        status,
        priority_level,
        created_by
      ) VALUES (
        'Partenariat: ' || v_partnership.partner_name,
        COALESCE(v_partnership.description, 'Projet créé automatiquement depuis le partenariat avec ' || v_partnership.partner_name),
        v_partnership.direction_id,
        v_partnership.budget,
        v_partnership.start_date,
        v_partnership.end_date,
        'en cours',
        v_partnership.priority_level,
        v_partnership.created_by
      ) RETURNING id INTO v_project_id;
      
      -- Créer une imputation
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
        COALESCE(v_partnership.start_date, CURRENT_DATE),
        'Partenariat',
        'Partenariat avec ' || v_partnership.partner_name,
        v_direction_name || ' - ' || v_partnership.partner_name || ' (' || COALESCE(v_partnership.partner_type, 'Type non spécifié') || ')',
        v_partnership.direction_id,
        'En cours',
        CURRENT_DATE,
        'Type: ' || COALESCE(v_partnership.partner_type, 'Non spécifié') || 
        '. Contact: ' || COALESCE(v_partnership.contact_person, 'Non spécifié') ||
        CASE WHEN v_partnership.budget IS NOT NULL THEN '. Budget: ' || v_partnership.budget::text || ' FCFA' ELSE '' END,
        v_partnership.created_by
      );
      
      -- Créer le lien
      INSERT INTO partnership_projects (partnership_id, project_id)
      VALUES (v_partnership.id, v_project_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;