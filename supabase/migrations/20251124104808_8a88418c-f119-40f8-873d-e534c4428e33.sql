-- Add mission_id and project_id to accounting_accounts table
ALTER TABLE public.accounting_accounts
ADD COLUMN mission_id UUID REFERENCES public.mission_orders(id) ON DELETE SET NULL,
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_accounting_accounts_mission_id ON public.accounting_accounts(mission_id);
CREATE INDEX idx_accounting_accounts_project_id ON public.accounting_accounts(project_id);