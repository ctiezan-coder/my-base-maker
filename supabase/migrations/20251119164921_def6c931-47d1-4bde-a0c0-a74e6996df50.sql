-- Supprimer les directions "Service Communication" et "Marchés & Compétitivité"
-- et nettoyer toutes les références associées

-- 1. Mettre à NULL les références dans les tables liées
UPDATE companies SET direction_id = NULL 
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE profiles SET direction_id = NULL, direction = NULL
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE documents SET direction_id = (SELECT id FROM directions WHERE name = 'Direction Générale' LIMIT 1)
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE events SET direction_id = (SELECT id FROM directions WHERE name = 'Direction Générale' LIMIT 1)
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE trainings SET direction_id = (SELECT id FROM directions WHERE name = 'Direction Générale' LIMIT 1)
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE kpi_tracking SET direction_id = (SELECT id FROM directions WHERE name = 'Direction Générale' LIMIT 1)
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE projects SET direction_id = (SELECT id FROM directions WHERE name = 'Direction Générale' LIMIT 1)
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE partnerships SET direction_id = (SELECT id FROM directions WHERE name = 'Direction Générale' LIMIT 1)
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE media_content SET direction_id = (SELECT id FROM directions WHERE name = 'Direction Générale' LIMIT 1)
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE folders SET direction_id = (SELECT id FROM directions WHERE name = 'Direction Générale' LIMIT 1)
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE export_opportunities SET direction_id = NULL
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE potential_markets SET direction_id = NULL
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE business_connections SET direction_id = NULL
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE market_statistics SET direction_id = NULL
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

UPDATE imputations SET direction_id = NULL
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

-- 2. Supprimer les assignations de rôles pour ces directions
DELETE FROM user_role_assignments
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

DELETE FROM permission_history
WHERE direction_id IN (
  SELECT id FROM directions 
  WHERE name IN ('Service Communication', 'Marchés & Compétitivité')
);

-- 3. Supprimer les directions
DELETE FROM directions 
WHERE name IN ('Service Communication', 'Marchés & Compétitivité');