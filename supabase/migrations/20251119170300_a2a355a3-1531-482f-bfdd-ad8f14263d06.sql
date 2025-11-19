-- Mise à jour des enums existants et création de nouveaux enums
DO $$ BEGIN
  -- Mettre à jour l'enum media_type avec les nouveaux supports de communication
  ALTER TYPE media_type RENAME TO media_type_old;
  
  CREATE TYPE media_type AS ENUM (
    'Newsletter',
    'Magazine', 
    'Article presse',
    'Communiqué de presse',
    'Dossier de presse',
    'Branding visuel',
    'Fond de scène',
    'Mur de photo',
    'Dépliant',
    'Flyer',
    'Kakemono',
    'Affiche',
    'Bannière web',
    'Post réseaux sociaux',
    'Film institutionnel',
    'Reportage',
    'Capsule vidéo',
    'Interview audio',
    'Photo professionnelle',
    'Couverture événement',
    'Support présentation',
    'Autre'
  );
  
  -- Mettre à jour la colonne
  ALTER TABLE media_content ALTER COLUMN media_type TYPE media_type USING media_type::text::media_type;
  
  -- Supprimer l'ancien type
  DROP TYPE media_type_old;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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

-- Ajouter les nouvelles colonnes à media_content
ALTER TABLE media_content
  ADD COLUMN IF NOT EXISTS categorie_niveau niveau_categorisation DEFAULT 'Niveau 3',
  ADD COLUMN IF NOT EXISTS phase_communication phase_communication,
  ADD COLUMN IF NOT EXISTS type_activite type_activite,
  ADD COLUMN IF NOT EXISTS role_agence role_agence,
  ADD COLUMN IF NOT EXISTS objectifs TEXT,
  ADD COLUMN IF NOT EXISTS cibles TEXT,
  ADD COLUMN IF NOT EXISTS enjeux TEXT,
  ADD COLUMN IF NOT EXISTS date_evenement DATE,
  ADD COLUMN IF NOT EXISTS heure_evenement TIME,
  ADD COLUMN IF NOT EXISTS lieu_evenement TEXT,
  ADD COLUMN IF NOT EXISTS delai_traitement_semaines INTEGER,
  ADD COLUMN IF NOT EXISTS budget_estime NUMERIC,
  ADD COLUMN IF NOT EXISTS statut_workflow statut_workflow DEFAULT 'Demande',
  ADD COLUMN IF NOT EXISTS date_demande DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS date_livraison_prevue DATE,
  ADD COLUMN IF NOT EXISTS date_livraison_effective DATE,
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS entites_externes TEXT[],
  ADD COLUMN IF NOT EXISTS supports_demandes TEXT[],
  ADD COLUMN IF NOT EXISTS observations TEXT;

-- Créer des index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_media_content_categorie_niveau ON media_content(categorie_niveau);
CREATE INDEX IF NOT EXISTS idx_media_content_phase_communication ON media_content(phase_communication);
CREATE INDEX IF NOT EXISTS idx_media_content_statut_workflow ON media_content(statut_workflow);
CREATE INDEX IF NOT EXISTS idx_media_content_event_id ON media_content(event_id);
CREATE INDEX IF NOT EXISTS idx_media_content_partnership_id ON media_content(partnership_id);
CREATE INDEX IF NOT EXISTS idx_media_content_date_evenement ON media_content(date_evenement);

-- Mettre à jour les commentaires de la table pour documentation
COMMENT ON TABLE media_content IS 'Table de gestion des supports de communication et briefs événementiels';
COMMENT ON COLUMN media_content.categorie_niveau IS 'Niveau stratégique: Niveau 1 (stratégique), Niveau 2 (sectoriel), Niveau 3 (proximité)';
COMMENT ON COLUMN media_content.phase_communication IS 'Phase de l''action de communication par rapport à l''événement';
COMMENT ON COLUMN media_content.statut_workflow IS 'Statut dans le workflow de validation et production';
COMMENT ON COLUMN media_content.delai_traitement_semaines IS 'Délai de traitement en semaines (6 pour full, 4 pour moyen, 2 pour basique)';

-- Ajouter une contrainte pour calculer la date de livraison prévue automatiquement
CREATE OR REPLACE FUNCTION calculate_livraison_prevue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_evenement IS NOT NULL AND NEW.delai_traitement_semaines IS NOT NULL THEN
    NEW.date_livraison_prevue := NEW.date_evenement - (NEW.delai_traitement_semaines || ' weeks')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_livraison_prevue ON media_content;
CREATE TRIGGER trigger_calculate_livraison_prevue
  BEFORE INSERT OR UPDATE ON media_content
  FOR EACH ROW
  EXECUTE FUNCTION calculate_livraison_prevue();