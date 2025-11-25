-- Mettre à jour les politiques RLS pour permettre aux admins de voir et supprimer toutes les données

-- Companies: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all companies" ON public.companies;
CREATE POLICY "Admins can view all companies"
ON public.companies
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all companies" ON public.companies;
CREATE POLICY "Admins can delete all companies"
ON public.companies
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Projects: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
CREATE POLICY "Admins can view all projects"
ON public.projects
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all projects" ON public.projects;
CREATE POLICY "Admins can delete all projects"
ON public.projects
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Events: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
CREATE POLICY "Admins can view all events"
ON public.events
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all events" ON public.events;
CREATE POLICY "Admins can delete all events"
ON public.events
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trainings: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all trainings" ON public.trainings;
CREATE POLICY "Admins can view all trainings"
ON public.trainings
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all trainings" ON public.trainings;
CREATE POLICY "Admins can delete all trainings"
ON public.trainings
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Partnerships: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all partnerships" ON public.partnerships;
CREATE POLICY "Admins can view all partnerships"
ON public.partnerships
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all partnerships" ON public.partnerships;
CREATE POLICY "Admins can delete all partnerships"
ON public.partnerships
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Imputations: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all imputations" ON public.imputations;
CREATE POLICY "Admins can view all imputations"
ON public.imputations
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all imputations" ON public.imputations;
CREATE POLICY "Admins can delete all imputations"
ON public.imputations
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Documents: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
CREATE POLICY "Admins can view all documents"
ON public.documents
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all documents" ON public.documents;
CREATE POLICY "Admins can delete all documents"
ON public.documents
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Media Content: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all media" ON public.media_content;
CREATE POLICY "Admins can view all media"
ON public.media_content
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all media" ON public.media_content;
CREATE POLICY "Admins can delete all media"
ON public.media_content
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- KPI Tracking: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all kpis" ON public.kpi_tracking;
CREATE POLICY "Admins can view all kpis"
ON public.kpi_tracking
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all kpis" ON public.kpi_tracking;
CREATE POLICY "Admins can delete all kpis"
ON public.kpi_tracking
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Export Opportunities: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all opportunities" ON public.export_opportunities;
CREATE POLICY "Admins can view all opportunities"
ON public.export_opportunities
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all opportunities" ON public.export_opportunities;
CREATE POLICY "Admins can delete all opportunities"
ON public.export_opportunities
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Business Connections: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all connections" ON public.business_connections;
CREATE POLICY "Admins can view all connections"
ON public.business_connections
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all connections" ON public.business_connections;
CREATE POLICY "Admins can delete all connections"
ON public.business_connections
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Purchase Orders: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all purchase orders" ON public.purchase_orders;
CREATE POLICY "Admins can view all purchase orders"
ON public.purchase_orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all purchase orders" ON public.purchase_orders;
CREATE POLICY "Admins can delete all purchase orders"
ON public.purchase_orders
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Suppliers: Admins peuvent voir et supprimer toutes les données
DROP POLICY IF EXISTS "Admins can view all suppliers" ON public.suppliers;
CREATE POLICY "Admins can view all suppliers"
ON public.suppliers
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all suppliers" ON public.suppliers;
CREATE POLICY "Admins can delete all suppliers"
ON public.suppliers
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Support Tickets: Admins peuvent voir et supprimer tous les tickets
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all tickets" ON public.support_tickets;
CREATE POLICY "Admins can delete all tickets"
ON public.support_tickets
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Employees: Admins peuvent voir et supprimer tous les employés
DROP POLICY IF EXISTS "Admins can view all employees" ON public.employees;
CREATE POLICY "Admins can view all employees"
ON public.employees
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all employees" ON public.employees;
CREATE POLICY "Admins can delete all employees"
ON public.employees
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Mission Orders: Admins peuvent voir et supprimer toutes les missions
DROP POLICY IF EXISTS "Admins can view all missions" ON public.mission_orders;
CREATE POLICY "Admins can view all missions"
ON public.mission_orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all missions" ON public.mission_orders;
CREATE POLICY "Admins can delete all missions"
ON public.mission_orders
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Accounting Accounts: Admins peuvent voir et supprimer tous les comptes
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounting_accounts;
CREATE POLICY "Admins can view all accounts"
ON public.accounting_accounts
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all accounts" ON public.accounting_accounts;
CREATE POLICY "Admins can delete all accounts"
ON public.accounting_accounts
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Accounting Entries: Admins peuvent voir et supprimer toutes les écritures
DROP POLICY IF EXISTS "Admins can view all entries" ON public.accounting_entries;
CREATE POLICY "Admins can view all entries"
ON public.accounting_entries
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all entries" ON public.accounting_entries;
CREATE POLICY "Admins can delete all entries"
ON public.accounting_entries
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Tasks: Admins peuvent voir et supprimer toutes les tâches
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks;
CREATE POLICY "Admins can view all tasks"
ON public.tasks
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all tasks" ON public.tasks;
CREATE POLICY "Admins can delete all tasks"
ON public.tasks
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Equipments: Admins peuvent voir et supprimer tous les équipements
DROP POLICY IF EXISTS "Admins can view all equipments" ON public.equipments;
CREATE POLICY "Admins can view all equipments"
ON public.equipments
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all equipments" ON public.equipments;
CREATE POLICY "Admins can delete all equipments"
ON public.equipments
FOR DELETE
USING (has_role(auth.uid(), 'admin'));