-- Add budget_id column to purchase_orders table
ALTER TABLE public.purchase_orders 
ADD COLUMN budget_id UUID REFERENCES public.budgets(id) ON DELETE SET NULL;

-- Add mission_id column to purchase_orders table
ALTER TABLE public.purchase_orders 
ADD COLUMN mission_id UUID REFERENCES public.mission_orders(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_purchase_orders_budget_id ON public.purchase_orders(budget_id);
CREATE INDEX idx_purchase_orders_mission_id ON public.purchase_orders(mission_id);

-- Create function to auto-create budget entry when purchase order is validated
CREATE OR REPLACE FUNCTION create_budget_entry_from_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- When purchase order status changes to 'Validée' or 'Reçue' and has a budget
  IF (NEW.status IN ('Validée', 'Reçue') AND OLD.status NOT IN ('Validée', 'Reçue')) 
     AND NEW.budget_id IS NOT NULL THEN
    INSERT INTO public.budget_entries (
      budget_id,
      amount,
      description,
      entry_date
    ) VALUES (
      NEW.budget_id,
      NEW.total_amount,
      'Commande ' || NEW.order_number || COALESCE(' - ' || NEW.description, ''),
      NEW.order_date
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto budget entry creation
CREATE TRIGGER trigger_purchase_budget_entry
AFTER UPDATE ON public.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION create_budget_entry_from_purchase();