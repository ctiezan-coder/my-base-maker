-- Drop existing policies for support_tickets
DROP POLICY IF EXISTS "Users can create tickets with module permission" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update tickets with module permission" ON public.support_tickets;

-- Allow all authenticated users to create tickets (but set requester_id = auth.uid())
CREATE POLICY "All users can create support tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_id);

-- Only assigned users and managers can update tickets (not creators)
CREATE POLICY "Assigned users and managers can update tickets"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = assigned_to) 
  OR has_any_module_permission(auth.uid(), 'support'::app_module, 'manager'::app_role)
);

-- Note: DELETE policy already restricts to admins and managers only