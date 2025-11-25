-- Étape 2: Mettre à jour les politiques RLS pour utiliser les permissions basées sur les modules

-- Mettre à jour les politiques RLS pour purchase_orders
DROP POLICY IF EXISTS "Managers can manage purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Users can view purchase orders" ON purchase_orders;

CREATE POLICY "Users can manage purchase orders with module permission"
ON purchase_orders
FOR ALL
TO authenticated
USING (has_any_module_permission(auth.uid(), 'achats'::app_module, 'manager'::app_role))
WITH CHECK (has_any_module_permission(auth.uid(), 'achats'::app_module, 'manager'::app_role));

CREATE POLICY "Users can view purchase orders with module permission"
ON purchase_orders
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'achats'::app_module, 'user'::app_role));

-- Mettre à jour les politiques RLS pour suppliers
DROP POLICY IF EXISTS "Managers can manage suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can view suppliers" ON suppliers;

CREATE POLICY "Users can manage suppliers with module permission"
ON suppliers
FOR ALL
TO authenticated
USING (has_any_module_permission(auth.uid(), 'achats'::app_module, 'manager'::app_role))
WITH CHECK (has_any_module_permission(auth.uid(), 'achats'::app_module, 'manager'::app_role));

CREATE POLICY "Users can view suppliers with module permission"
ON suppliers
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'achats'::app_module, 'user'::app_role));

-- Mettre à jour les politiques RLS pour support_tickets
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view their tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can update their tickets" ON support_tickets;
DROP POLICY IF EXISTS "Managers can delete tickets" ON support_tickets;

CREATE POLICY "Users can create tickets with module permission"
ON support_tickets
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = requester_id AND 
  has_any_module_permission(auth.uid(), 'support'::app_module, 'user'::app_role)
);

CREATE POLICY "Users can view tickets with module permission"
ON support_tickets
FOR SELECT
TO authenticated
USING (
  auth.uid() = requester_id OR 
  auth.uid() = assigned_to OR 
  has_any_module_permission(auth.uid(), 'support'::app_module, 'manager'::app_role)
);

CREATE POLICY "Users can update tickets with module permission"
ON support_tickets
FOR UPDATE
TO authenticated
USING (
  auth.uid() = requester_id OR 
  auth.uid() = assigned_to OR 
  has_any_module_permission(auth.uid(), 'support'::app_module, 'manager'::app_role)
);

CREATE POLICY "Managers can delete tickets with module permission"
ON support_tickets
FOR DELETE
TO authenticated
USING (has_any_module_permission(auth.uid(), 'support'::app_module, 'manager'::app_role));

-- Mettre à jour les politiques RLS pour equipments
DROP POLICY IF EXISTS "Managers can manage equipments" ON equipments;
DROP POLICY IF EXISTS "Users can view equipments" ON equipments;

CREATE POLICY "Users can manage equipments with module permission"
ON equipments
FOR ALL
TO authenticated
USING (has_any_module_permission(auth.uid(), 'support'::app_module, 'manager'::app_role))
WITH CHECK (has_any_module_permission(auth.uid(), 'support'::app_module, 'manager'::app_role));

CREATE POLICY "Users can view equipments with module permission"
ON equipments
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'support'::app_module, 'user'::app_role));

-- Mettre à jour les politiques RLS pour employees
DROP POLICY IF EXISTS "Admins can manage employees" ON employees;
DROP POLICY IF EXISTS "Users can view employees" ON employees;

CREATE POLICY "Users can manage employees with module permission"
ON employees
FOR ALL
TO authenticated
USING (has_any_module_permission(auth.uid(), 'rh'::app_module, 'manager'::app_role))
WITH CHECK (has_any_module_permission(auth.uid(), 'rh'::app_module, 'manager'::app_role));

CREATE POLICY "Users can view employees with module permission"
ON employees
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'rh'::app_module, 'user'::app_role));

-- Mettre à jour les politiques RLS pour leave_requests
DROP POLICY IF EXISTS "Employees can create leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Employees can view their leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Managers can manage leave requests" ON leave_requests;

CREATE POLICY "Employees can create leave requests with module permission"
ON leave_requests
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = leave_requests.employee_id 
    AND employees.user_id = auth.uid()
  ) AND
  has_any_module_permission(auth.uid(), 'rh'::app_module, 'user'::app_role)
);

CREATE POLICY "Employees can view leave requests with module permission"
ON leave_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = leave_requests.employee_id 
    AND employees.user_id = auth.uid()
  ) OR
  has_any_module_permission(auth.uid(), 'rh'::app_module, 'manager'::app_role)
);

CREATE POLICY "Managers can manage leave requests with module permission"
ON leave_requests
FOR ALL
TO authenticated
USING (has_any_module_permission(auth.uid(), 'rh'::app_module, 'manager'::app_role))
WITH CHECK (has_any_module_permission(auth.uid(), 'rh'::app_module, 'manager'::app_role));

-- Mettre à jour les politiques RLS pour mission_orders
DROP POLICY IF EXISTS "Employees can view their missions" ON mission_orders;
DROP POLICY IF EXISTS "Managers can manage missions" ON mission_orders;
DROP POLICY IF EXISTS "Users can create mission orders" ON mission_orders;

CREATE POLICY "Users can create mission orders with module permission"
ON mission_orders
FOR INSERT
TO authenticated
WITH CHECK (has_any_module_permission(auth.uid(), 'missions'::app_module, 'user'::app_role));

CREATE POLICY "Employees can view their missions with module permission"
ON mission_orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = mission_orders.employee_id 
    AND employees.user_id = auth.uid()
  ) OR
  has_any_module_permission(auth.uid(), 'missions'::app_module, 'manager'::app_role)
);

CREATE POLICY "Managers can manage missions with module permission"
ON mission_orders
FOR ALL
TO authenticated
USING (has_any_module_permission(auth.uid(), 'missions'::app_module, 'manager'::app_role))
WITH CHECK (has_any_module_permission(auth.uid(), 'missions'::app_module, 'manager'::app_role));

-- Mettre à jour les politiques RLS pour mission_attachments
DROP POLICY IF EXISTS "Users can view attachments" ON mission_attachments;
DROP POLICY IF EXISTS "Managers can manage attachments" ON mission_attachments;
DROP POLICY IF EXISTS "Users can insert attachments" ON mission_attachments;
DROP POLICY IF EXISTS "Users can delete own attachments" ON mission_attachments;

CREATE POLICY "Users can view attachments with module permission"
ON mission_attachments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mission_orders mo
    JOIN employees e ON e.id = mo.employee_id
    WHERE mo.id = mission_attachments.mission_order_id
    AND (e.user_id = auth.uid() OR has_any_module_permission(auth.uid(), 'missions'::app_module, 'user'::app_role))
  )
);

CREATE POLICY "Users can insert attachments with module permission"
ON mission_attachments
FOR INSERT
TO authenticated
WITH CHECK (has_any_module_permission(auth.uid(), 'missions'::app_module, 'user'::app_role));

CREATE POLICY "Users can delete attachments with module permission"
ON mission_attachments
FOR DELETE
TO authenticated
USING (
  auth.uid() = uploaded_by OR 
  has_any_module_permission(auth.uid(), 'missions'::app_module, 'manager'::app_role)
);

-- Mettre à jour les politiques RLS pour accounting_accounts
DROP POLICY IF EXISTS "Admins can manage accounts" ON accounting_accounts;
DROP POLICY IF EXISTS "Users can view accounts" ON accounting_accounts;

CREATE POLICY "Users can manage accounts with module permission"
ON accounting_accounts
FOR ALL
TO authenticated
USING (has_any_module_permission(auth.uid(), 'comptabilite'::app_module, 'manager'::app_role))
WITH CHECK (has_any_module_permission(auth.uid(), 'comptabilite'::app_module, 'manager'::app_role));

CREATE POLICY "Users can view accounts with module permission"
ON accounting_accounts
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'comptabilite'::app_module, 'user'::app_role));

-- Mettre à jour les politiques RLS pour accounting_entries
DROP POLICY IF EXISTS "Users can view entries" ON accounting_entries;

CREATE POLICY "Users can manage entries with module permission"
ON accounting_entries
FOR ALL
TO authenticated
USING (has_any_module_permission(auth.uid(), 'comptabilite'::app_module, 'manager'::app_role))
WITH CHECK (has_any_module_permission(auth.uid(), 'comptabilite'::app_module, 'manager'::app_role));

CREATE POLICY "Users can view entries with module permission"
ON accounting_entries
FOR SELECT
TO authenticated
USING (has_any_module_permission(auth.uid(), 'comptabilite'::app_module, 'user'::app_role));