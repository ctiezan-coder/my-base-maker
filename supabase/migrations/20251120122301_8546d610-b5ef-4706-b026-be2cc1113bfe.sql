-- Add INSERT policy for imputations to allow users to create imputations
CREATE POLICY "Users can create imputations with direction access"
ON public.imputations
FOR INSERT
TO authenticated
WITH CHECK (
  user_has_direction_access(auth.uid(), direction_id) 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);