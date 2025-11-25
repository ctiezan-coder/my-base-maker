-- Migrate trainer_ids array to training_trainers junction table
-- This migration fixes the inconsistency where trainings table has both
-- trainer_ids (array) and the new training_trainers junction table

-- Step 1: Migrate existing data from trainer_ids to training_trainers
DO $$
DECLARE
  training_record RECORD;
  trainer_id_value UUID;
BEGIN
  -- Loop through all trainings that have trainer_ids
  FOR training_record IN
    SELECT id, trainer_ids
    FROM public.trainings
    WHERE trainer_ids IS NOT NULL AND array_length(trainer_ids, 1) > 0
  LOOP
    -- For each trainer_id in the array, create a record in training_trainers
    FOREACH trainer_id_value IN ARRAY training_record.trainer_ids
    LOOP
      -- Insert only if it doesn't already exist (to avoid duplicates)
      INSERT INTO public.training_trainers (training_id, trainer_id)
      VALUES (training_record.id, trainer_id_value)
      ON CONFLICT (training_id, trainer_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Step 2: Drop the trainer_ids column from trainings table
ALTER TABLE public.trainings DROP COLUMN IF EXISTS trainer_ids;

-- Step 3: Add comment for documentation
COMMENT ON TABLE public.training_trainers IS
'Junction table for many-to-many relationship between trainings and trainers. Replaces the deprecated trainer_ids array column.';
