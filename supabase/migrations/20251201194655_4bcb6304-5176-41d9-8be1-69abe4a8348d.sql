-- Mise à jour de la politique RLS pour les demandes de congés
-- Tous les employés authentifiés peuvent créer des demandes de congé

DROP POLICY IF EXISTS "Employees can create leave requests with module permission" ON public.leave_requests;

CREATE POLICY "Employees can create leave requests"
ON public.leave_requests
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees
    WHERE employees.id = leave_requests.employee_id
    AND employees.user_id = auth.uid()
  )
);