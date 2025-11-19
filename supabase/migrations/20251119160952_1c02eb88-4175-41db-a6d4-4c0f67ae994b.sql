
-- Supprimer l'ancienne contrainte
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_type_check;

-- Ajouter une nouvelle contrainte avec tous les types d'événements pertinents
ALTER TABLE events ADD CONSTRAINT events_event_type_check 
CHECK (event_type = ANY (ARRAY[
  'foire',
  'salon', 
  'conférence',
  'forum',
  'atelier',
  'formation',
  'séminaire',
  'webinaire',
  'exposition',
  'réunion',
  'autre'
]));
