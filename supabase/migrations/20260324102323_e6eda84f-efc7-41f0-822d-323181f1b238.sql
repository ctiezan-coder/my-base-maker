-- Remove duplicate training (keep the one with registrations, or just keep one)
-- First check which one has registrations
DO $$
DECLARE
  v_keep_id uuid;
  v_delete_id uuid;
BEGIN
  -- Keep 7d54a3d8, delete 99d5ddb7
  v_keep_id := '7d54a3d8-7f9b-4eea-8098-13feb6257b3a';
  v_delete_id := '99d5ddb7-0415-4a05-b66f-7314157c20b5';
  
  -- Move any registrations from duplicate to the kept one
  UPDATE training_registrations SET training_id = v_keep_id WHERE training_id = v_delete_id;
  
  -- Delete the duplicate training
  DELETE FROM trainings WHERE id = v_delete_id;
END $$;