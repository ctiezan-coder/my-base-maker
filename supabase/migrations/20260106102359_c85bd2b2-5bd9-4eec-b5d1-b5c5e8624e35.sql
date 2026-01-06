-- Create budgets table linking missions, employees and accounting
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_name VARCHAR(255) NOT NULL,
  mission_id UUID REFERENCES public.mission_orders(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  direction_id UUID REFERENCES public.directions(id) ON DELETE SET NULL,
  fiscal_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  allocated_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  consumed_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  remaining_amount NUMERIC(15,2) GENERATED ALWAYS AS (allocated_amount - consumed_amount) STORED,
  status VARCHAR(50) NOT NULL DEFAULT 'Actif',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view all budgets" 
ON public.budgets 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create budgets" 
ON public.budgets 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update budgets" 
ON public.budgets 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete budgets" 
ON public.budgets 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create budget_entries table to link budgets with accounting entries
CREATE TABLE public.budget_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  accounting_entry_id UUID REFERENCES public.accounting_entries(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  description TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.budget_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for budget_entries
CREATE POLICY "Users can view all budget entries" 
ON public.budget_entries 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create budget entries" 
ON public.budget_entries 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update budget entries" 
ON public.budget_entries 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete budget entries" 
ON public.budget_entries 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create function to update consumed_amount when budget_entries are added/modified
CREATE OR REPLACE FUNCTION update_budget_consumed_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.budgets 
    SET consumed_amount = consumed_amount + NEW.amount
    WHERE id = NEW.budget_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.budgets 
    SET consumed_amount = consumed_amount - OLD.amount + NEW.amount
    WHERE id = NEW.budget_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.budgets 
    SET consumed_amount = consumed_amount - OLD.amount
    WHERE id = OLD.budget_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic consumed_amount updates
CREATE TRIGGER trigger_update_budget_consumed
AFTER INSERT OR UPDATE OR DELETE ON public.budget_entries
FOR EACH ROW
EXECUTE FUNCTION update_budget_consumed_amount();