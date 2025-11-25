-- Add trainer_id column to trainings table
ALTER TABLE public.trainings
ADD COLUMN IF NOT EXISTS trainer_id uuid REFERENCES public.trainers(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_trainings_trainer_id ON public.trainings(trainer_id);