-- Étape 1: Ajouter les nouvelles valeurs à l'enum app_module
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'achats' AND enumtypid = 'app_module'::regtype) THEN
    ALTER TYPE app_module ADD VALUE 'achats';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'support' AND enumtypid = 'app_module'::regtype) THEN
    ALTER TYPE app_module ADD VALUE 'support';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'rh' AND enumtypid = 'app_module'::regtype) THEN
    ALTER TYPE app_module ADD VALUE 'rh';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'missions' AND enumtypid = 'app_module'::regtype) THEN
    ALTER TYPE app_module ADD VALUE 'missions';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'comptabilite' AND enumtypid = 'app_module'::regtype) THEN
    ALTER TYPE app_module ADD VALUE 'comptabilite';
  END IF;
END $$;