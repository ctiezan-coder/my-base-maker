-- Fonction pour attribuer automatiquement les permissions DAF et DG
CREATE OR REPLACE FUNCTION assign_daf_dg_permissions()
RETURNS TRIGGER AS $$
DECLARE
  daf_id uuid;
  dg_id uuid;
  module_name app_module;
BEGIN
  -- Récupérer l'ID de la Direction Administrative et Financière
  SELECT id INTO daf_id FROM directions WHERE name = 'Direction Administrative et Financière';
  
  -- Récupérer l'ID de la Direction Générale
  SELECT id INTO dg_id FROM directions WHERE name = 'Direction Générale';
  
  -- Si les directions existent, attribuer les permissions pour tous les modules
  IF daf_id IS NOT NULL THEN
    FOR module_name IN 
      SELECT unnest(enum_range(NULL::app_module))
    LOOP
      INSERT INTO user_role_assignments (user_id, direction_id, module, role)
      VALUES (NEW.user_id, daf_id, module_name, 'user')
      ON CONFLICT (user_id, direction_id, module) DO NOTHING;
    END LOOP;
  END IF;
  
  IF dg_id IS NOT NULL THEN
    FOR module_name IN 
      SELECT unnest(enum_range(NULL::app_module))
    LOOP
      INSERT INTO user_role_assignments (user_id, direction_id, module, role)
      VALUES (NEW.user_id, dg_id, module_name, 'user')
      ON CONFLICT (user_id, direction_id, module) DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer un trigger qui s'exécute après la création d'un profil
DROP TRIGGER IF EXISTS assign_daf_dg_on_profile_creation ON profiles;
CREATE TRIGGER assign_daf_dg_on_profile_creation
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_daf_dg_permissions();

-- Attribuer les permissions DAF et DG à tous les utilisateurs existants
DO $$
DECLARE
  daf_id uuid;
  dg_id uuid;
  user_record RECORD;
  module_name app_module;
BEGIN
  -- Récupérer les IDs des directions
  SELECT id INTO daf_id FROM directions WHERE name = 'Direction Administrative et Financière';
  SELECT id INTO dg_id FROM directions WHERE name = 'Direction Générale';
  
  -- Pour chaque utilisateur existant
  FOR user_record IN SELECT user_id FROM profiles
  LOOP
    -- Attribuer les permissions DAF
    IF daf_id IS NOT NULL THEN
      FOR module_name IN 
        SELECT unnest(enum_range(NULL::app_module))
      LOOP
        INSERT INTO user_role_assignments (user_id, direction_id, module, role)
        VALUES (user_record.user_id, daf_id, module_name, 'user')
        ON CONFLICT (user_id, direction_id, module) DO NOTHING;
      END LOOP;
    END IF;
    
    -- Attribuer les permissions DG
    IF dg_id IS NOT NULL THEN
      FOR module_name IN 
        SELECT unnest(enum_range(NULL::app_module))
      LOOP
        INSERT INTO user_role_assignments (user_id, direction_id, module, role)
        VALUES (user_record.user_id, dg_id, module_name, 'user')
        ON CONFLICT (user_id, direction_id, module) DO NOTHING;
      END LOOP;
    END IF;
  END LOOP;
END $$;