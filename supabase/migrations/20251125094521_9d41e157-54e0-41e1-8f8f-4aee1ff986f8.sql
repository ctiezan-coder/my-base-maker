-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.training_trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(training_id, trainer_id)
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_training_trainers_training_id ON public.training_trainers(training_id);
CREATE INDEX IF NOT EXISTS idx_training_trainers_trainer_id ON public.training_trainers(trainer_id);

-- Enable RLS
ALTER TABLE public.training_trainers ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Everyone can view training_trainers"
ON public.training_trainers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and managers can manage training_trainers"
ON public.training_trainers
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- Remove the old trainer_id column from trainings table
ALTER TABLE public.trainings DROP COLUMN IF EXISTS trainer_id;