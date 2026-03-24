-- Delete training registrations for trainings with 0 participants first (to avoid FK issues)
DELETE FROM training_registrations WHERE training_id IN (
  SELECT t.id FROM trainings t 
  LEFT JOIN training_registrations tr ON tr.training_id = t.id
  GROUP BY t.id HAVING count(tr.id) = 0
);

-- Delete trainings with no participants
DELETE FROM trainings WHERE id IN (
  SELECT t.id FROM trainings t 
  LEFT JOIN training_registrations tr ON tr.training_id = t.id
  GROUP BY t.id HAVING count(tr.id) = 0
);