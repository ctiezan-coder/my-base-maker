-- Fix the trigger to gracefully handle missing auth users
CREATE OR REPLACE FUNCTION public.notify_training_registration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_training record;
BEGIN
  SELECT * INTO v_training FROM trainings WHERE id = NEW.training_id;
  
  INSERT INTO notifications (user_id, title, message, type, reference_table, reference_id)
  SELECT 
    ur.user_id,
    'Nouvelle inscription formation',
    'Nouvelle inscription de ' || NEW.participant_name || ' à la formation ' || v_training.title,
    'info',
    'training_registrations',
    NEW.id
  FROM user_roles ur
  WHERE ur.role IN ('admin', 'manager')
  AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = ur.user_id);
  
  RETURN NEW;
END;
$function$;

DROP POLICY IF EXISTS "Users can view their registrations" ON training_registrations;
CREATE POLICY "Users can view training registrations" ON training_registrations
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'manager')
    OR (company_id IN (SELECT id FROM companies WHERE created_by = auth.uid()))
    OR (training_id IN (SELECT id FROM trainings WHERE created_by = auth.uid()))
    OR (training_id IN (SELECT id FROM trainings WHERE direction_id IN (
      SELECT direction_id FROM profiles WHERE user_id = auth.uid()
    )))
  );