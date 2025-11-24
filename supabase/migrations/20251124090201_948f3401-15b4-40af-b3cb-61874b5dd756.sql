-- ============================================
-- MODULE ACHATS (PURCHASES)
-- ============================================

-- Enum pour les statuts de commande
CREATE TYPE order_status AS ENUM ('Brouillon', 'Validée', 'En cours', 'Reçue', 'Clôturée', 'Annulée');

-- Enum pour les types de marché
CREATE TYPE procurement_type AS ENUM ('Gré à gré', 'Appel d''offres', 'Consultation');

-- Table des fournisseurs
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  tax_id TEXT,
  bank_account TEXT,
  rating NUMERIC CHECK (rating >= 0 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des commandes
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES public.suppliers(id),
  direction_id UUID REFERENCES public.directions(id),
  project_id UUID REFERENCES public.projects(id),
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status order_status NOT NULL DEFAULT 'Brouillon',
  procurement_type procurement_type NOT NULL,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'FCFA',
  description TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des lignes de commande
CREATE TABLE public.purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- MODULE SUPPORT & MAINTENANCE
-- ============================================

-- Enum pour la priorité des tickets
CREATE TYPE ticket_priority AS ENUM ('Basse', 'Moyenne', 'Haute', 'Urgente');

-- Enum pour le statut des tickets
CREATE TYPE ticket_status AS ENUM ('Ouvert', 'En cours', 'En attente', 'Résolu', 'Fermé');

-- Enum pour les catégories de tickets
CREATE TYPE ticket_category AS ENUM ('Informatique', 'Réseau', 'Matériel', 'Logiciel', 'Téléphonie', 'Automobile', 'Infrastructure', 'Autre');

-- Table des tickets de support
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category ticket_category NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'Moyenne',
  status ticket_status NOT NULL DEFAULT 'Ouvert',
  requester_id UUID NOT NULL,
  assigned_to UUID,
  direction_id UUID REFERENCES public.directions(id),
  equipment_id UUID,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Table des équipements
CREATE TABLE public.equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_type TEXT NOT NULL,
  name TEXT NOT NULL,
  serial_number TEXT,
  model TEXT,
  brand TEXT,
  purchase_date DATE,
  warranty_expiry DATE,
  assigned_to UUID,
  direction_id UUID REFERENCES public.directions(id),
  location TEXT,
  status TEXT NOT NULL DEFAULT 'Opérationnel',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- MODULE RESSOURCES HUMAINES
-- ============================================

-- Enum pour les types de contrat
CREATE TYPE contract_type AS ENUM ('CDI', 'CDD', 'Stage', 'Consultant', 'Temporaire');

-- Enum pour les statuts de congé
CREATE TYPE leave_status AS ENUM ('En attente', 'Approuvé', 'Refusé', 'Annulé');

-- Enum pour les types de congé
CREATE TYPE leave_type AS ENUM ('Congé annuel', 'Congé maladie', 'Congé maternité', 'Congé paternité', 'Permission', 'Autre');

-- Table des employés
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  employee_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  birth_date DATE,
  hire_date DATE NOT NULL,
  contract_type contract_type NOT NULL,
  position TEXT NOT NULL,
  direction_id UUID REFERENCES public.directions(id),
  manager_id UUID REFERENCES public.employees(id),
  salary NUMERIC,
  status TEXT NOT NULL DEFAULT 'Actif',
  address TEXT,
  emergency_contact TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des congés
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC NOT NULL,
  reason TEXT,
  status leave_status NOT NULL DEFAULT 'En attente',
  approved_by UUID REFERENCES public.employees(id),
  approval_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- MODULE MISSIONS
-- ============================================

-- Enum pour les statuts de mission
CREATE TYPE mission_status AS ENUM ('Brouillon', 'En attente validation', 'Validée', 'En cours', 'Terminée', 'Annulée');

-- Table des ordres de mission
CREATE TABLE public.mission_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_number TEXT NOT NULL UNIQUE,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  direction_id UUID REFERENCES public.directions(id),
  project_id UUID REFERENCES public.projects(id),
  purpose TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days NUMERIC NOT NULL,
  estimated_budget NUMERIC,
  actual_cost NUMERIC,
  advance_amount NUMERIC,
  status mission_status NOT NULL DEFAULT 'Brouillon',
  validated_by UUID REFERENCES public.employees(id),
  validation_date TIMESTAMPTZ,
  report TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- MODULE COMPTABILITÉ
-- ============================================

-- Enum pour les types d'écriture comptable
CREATE TYPE accounting_entry_type AS ENUM ('Débit', 'Crédit');

-- Table des comptes comptables
CREATE TABLE public.accounting_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  parent_account_id UUID REFERENCES public.accounting_accounts(id),
  balance NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des écritures comptables
CREATE TABLE public.accounting_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number TEXT NOT NULL UNIQUE,
  entry_date DATE NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounting_accounts(id),
  description TEXT NOT NULL,
  entry_type accounting_entry_type NOT NULL,
  amount NUMERIC NOT NULL,
  reference TEXT,
  direction_id UUID REFERENCES public.directions(id),
  project_id UUID REFERENCES public.projects(id),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_suppliers_name ON public.suppliers(name);
CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_direction ON public.purchase_orders(direction_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX idx_support_tickets_requester ON public.support_tickets(requester_id);
CREATE INDEX idx_equipments_type ON public.equipments(equipment_type);
CREATE INDEX idx_employees_direction ON public.employees(direction_id);
CREATE INDEX idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX idx_mission_orders_employee ON public.mission_orders(employee_id);
CREATE INDEX idx_accounting_entries_account ON public.accounting_entries(account_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view suppliers" ON public.suppliers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Managers can manage suppliers" ON public.suppliers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Purchase Orders
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view purchase orders" ON public.purchase_orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Managers can manage purchase orders" ON public.purchase_orders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Purchase Order Lines
ALTER TABLE public.purchase_order_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view order lines" ON public.purchase_order_lines FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Managers can manage order lines" ON public.purchase_order_lines FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Support Tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = assigned_to OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update their tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = assigned_to OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Managers can delete tickets" ON public.support_tickets FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Equipments
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view equipments" ON public.equipments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Managers can manage equipments" ON public.equipments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view employees" ON public.employees FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage employees" ON public.employees FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Leave Requests
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees can view their leave requests" ON public.leave_requests FOR SELECT USING (EXISTS (SELECT 1 FROM employees WHERE employees.id = leave_requests.employee_id AND employees.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Employees can create leave requests" ON public.leave_requests FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM employees WHERE employees.id = employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Managers can manage leave requests" ON public.leave_requests FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Mission Orders
ALTER TABLE public.mission_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees can view their missions" ON public.mission_orders FOR SELECT USING (EXISTS (SELECT 1 FROM employees WHERE employees.id = mission_orders.employee_id AND employees.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Users can create mission orders" ON public.mission_orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Managers can manage missions" ON public.mission_orders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Accounting Accounts
ALTER TABLE public.accounting_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accounts" ON public.accounting_accounts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage accounts" ON public.accounting_accounts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Accounting Entries
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view entries" ON public.accounting_entries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Managers can manage entries" ON public.accounting_entries FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipments_updated_at BEFORE UPDATE ON public.equipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mission_orders_updated_at BEFORE UPDATE ON public.mission_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounting_accounts_updated_at BEFORE UPDATE ON public.accounting_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();