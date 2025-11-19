-- Corriger la création des enums avec la bonne syntaxe PostgreSQL

-- Créer phase_communication enum
DO $$ BEGIN
  CREATE TYPE phase_communication AS ENUM ('Avant événement', 'Pendant événement', 'Après événement');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Créer niveau_categorisation enum
DO $$ BEGIN
  CREATE TYPE niveau_categorisation AS ENUM ('Niveau 1', 'Niveau 2', 'Niveau 3');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Créer statut_workflow enum
DO $$ BEGIN
  CREATE TYPE statut_workflow AS ENUM ('Demande', 'En cours', 'Validé', 'Livré', 'Annulé');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Créer type_activite enum
DO $$ BEGIN
  CREATE TYPE type_activite AS ENUM (
    'Séminaire',
    'Formation', 
    'Signature de convention',
    'Foire / Salon',
    'Panel',
    'Appel à Manifestations d''Intérêts',
    'Cérémonie',
    'Masterclass',
    'Forum économique',
    'Mission officielle',
    'Journée Portes Ouvertes',
    'Autre'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Créer role_agence enum
DO $$ BEGIN
  CREATE TYPE role_agence AS ENUM ('Organisateur', 'Co-organisateur', 'Participant', 'Intervenant');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ajouter les colonnes manquantes si elles n'existent pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'categorie_niveau') THEN
    ALTER TABLE media_content ADD COLUMN categorie_niveau niveau_categorisation DEFAULT 'Niveau 3';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'phase_communication') THEN
    ALTER TABLE media_content ADD COLUMN phase_communication phase_communication;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'type_activite') THEN
    ALTER TABLE media_content ADD COLUMN type_activite type_activite;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'role_agence') THEN
    ALTER TABLE media_content ADD COLUMN role_agence role_agence;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'objectifs') THEN
    ALTER TABLE media_content ADD COLUMN objectifs TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'cibles') THEN
    ALTER TABLE media_content ADD COLUMN cibles TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'enjeux') THEN
    ALTER TABLE media_content ADD COLUMN enjeux TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'date_evenement') THEN
    ALTER TABLE media_content ADD COLUMN date_evenement DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'heure_evenement') THEN
    ALTER TABLE media_content ADD COLUMN heure_evenement TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'lieu_evenement') THEN
    ALTER TABLE media_content ADD COLUMN lieu_evenement TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'delai_traitement_semaines') THEN
    ALTER TABLE media_content ADD COLUMN delai_traitement_semaines INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'budget_estime') THEN
    ALTER TABLE media_content ADD COLUMN budget_estime NUMERIC;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'statut_workflow') THEN
    ALTER TABLE media_content ADD COLUMN statut_workflow statut_workflow DEFAULT 'Demande';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'date_demande') THEN
    ALTER TABLE media_content ADD COLUMN date_demande DATE DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'date_livraison_prevue') THEN
    ALTER TABLE media_content ADD COLUMN date_livraison_prevue DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'date_livraison_effective') THEN
    ALTER TABLE media_content ADD COLUMN date_livraison_effective DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'event_id') THEN
    ALTER TABLE media_content ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'partnership_id') THEN
    ALTER TABLE media_content ADD COLUMN partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'entites_externes') THEN
    ALTER TABLE media_content ADD COLUMN entites_externes TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'supports_demandes') THEN
    ALTER TABLE media_content ADD COLUMN supports_demandes TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_content' AND column_name = 'observations') THEN
    ALTER TABLE media_content ADD COLUMN observations TEXT;
  END IF;
END $$;

-- Créer des index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_media_content_categorie_niveau ON media_content(categorie_niveau);
CREATE INDEX IF NOT EXISTS idx_media_content_phase_communication ON media_content(phase_communication);
CREATE INDEX IF NOT EXISTS idx_media_content_statut_workflow ON media_content(statut_workflow);
CREATE INDEX IF NOT EXISTS idx_media_content_event_id ON media_content(event_id);
CREATE INDEX IF NOT EXISTS idx_media_content_partnership_id ON media_content(partnership_id);
CREATE INDEX IF NOT EXISTS idx_media_content_date_evenement ON media_content(date_evenement);