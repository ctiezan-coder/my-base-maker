
-- Éliminer les doublons dans export_opportunities
-- Garder uniquement la ligne avec l'ID le plus récent (created_at le plus récent)
DELETE FROM export_opportunities a
USING export_opportunities b
WHERE a.id < b.id 
  AND a.title = b.title 
  AND a.destination_country = b.destination_country 
  AND a.sector = b.sector 
  AND a.deadline = b.deadline;

-- Ajouter une contrainte unique pour empêcher les futurs doublons d'opportunités
CREATE UNIQUE INDEX IF NOT EXISTS unique_opportunity 
ON export_opportunities(title, destination_country, deadline);

-- Éliminer les doublons dans companies basé sur RCCM (garder le plus ancien)
DELETE FROM companies a
USING companies b
WHERE a.id > b.id 
  AND a.rccm_number = b.rccm_number 
  AND a.rccm_number IS NOT NULL 
  AND a.rccm_number != '';

-- Ajouter une contrainte unique sur RCCM
CREATE UNIQUE INDEX IF NOT EXISTS unique_company_rccm 
ON companies(rccm_number) 
WHERE rccm_number IS NOT NULL AND rccm_number != '';

-- Éliminer les doublons dans events basé sur titre, date et direction
DELETE FROM events a
USING events b
WHERE a.id > b.id 
  AND a.title = b.title 
  AND a.start_date = b.start_date 
  AND a.direction_id = b.direction_id;

-- Ajouter une contrainte unique pour les événements
CREATE UNIQUE INDEX IF NOT EXISTS unique_event 
ON events(title, start_date, direction_id);

-- Éliminer les doublons dans trainings
DELETE FROM trainings a
USING trainings b
WHERE a.id > b.id 
  AND a.title = b.title 
  AND a.start_date = b.start_date 
  AND a.direction_id = b.direction_id;

-- Ajouter une contrainte unique pour les formations
CREATE UNIQUE INDEX IF NOT EXISTS unique_training 
ON trainings(title, start_date, direction_id);

-- Éliminer les doublons dans partnerships
DELETE FROM partnerships a
USING partnerships b
WHERE a.id > b.id 
  AND a.partner_name = b.partner_name 
  AND a.direction_id = b.direction_id
  AND COALESCE(a.start_date, '1900-01-01'::date) = COALESCE(b.start_date, '1900-01-01'::date);

-- Ajouter une contrainte unique pour les partenariats
CREATE UNIQUE INDEX IF NOT EXISTS unique_partnership 
ON partnerships(partner_name, direction_id, COALESCE(start_date, '1900-01-01'::date));

-- Éliminer les doublons dans business_connections
DELETE FROM business_connections a
USING business_connections b
WHERE a.id > b.id 
  AND a.pme_name = b.pme_name 
  AND a.partner_name = b.partner_name 
  AND a.connection_date = b.connection_date;

-- Ajouter une contrainte unique pour les connexions business
CREATE UNIQUE INDEX IF NOT EXISTS unique_business_connection 
ON business_connections(pme_name, partner_name, connection_date);

-- Éliminer les doublons dans potential_markets
DELETE FROM potential_markets a
USING potential_markets b
WHERE a.id > b.id 
  AND a.country = b.country 
  AND a.sector = b.sector 
  AND a.region = b.region;

-- Ajouter une contrainte unique pour les marchés potentiels
CREATE UNIQUE INDEX IF NOT EXISTS unique_potential_market 
ON potential_markets(country, sector, region);
