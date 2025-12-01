-- Mise à jour de la politique RLS pour les demandes de congés
-- Seuls les employés avec permission RH (user ou supérieur) peuvent créer des demandes

DROP POLICY IF EXISTS "Employees can create leave requests with module permission" ON public.leave_requests;

CREATE POLICY "Employees can create leave requests with module permission"
ON public.leave_requests
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees
    WHERE employees.id = leave_requests.employee_id
    AND employees.user_id = auth.uid()
  )
  AND has_any_module_permission(auth.uid(), 'rh', 'user')
);