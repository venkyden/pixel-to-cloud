-- Add fields for automated rent collection
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS auto_collect boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS next_collection_date timestamp with time zone;

-- Create rent schedules table for automated collection
CREATE TABLE IF NOT EXISTS rent_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  landlord_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT '€',
  day_of_month integer NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  stripe_customer_id text,
  stripe_payment_method_id text,
  active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_collection_date timestamp with time zone,
  next_collection_date timestamp with time zone NOT NULL
);

-- Enable RLS on rent_schedules
ALTER TABLE rent_schedules ENABLE ROW LEVEL SECURITY;

-- Users can view related rent schedules
CREATE POLICY "Users can view related rent schedules"
ON rent_schedules FOR SELECT
USING (
  auth.uid() = tenant_id 
  OR auth.uid() = landlord_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Landlords can create rent schedules
CREATE POLICY "Landlords can create rent schedules"
ON rent_schedules FOR INSERT
WITH CHECK (
  auth.uid() = landlord_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Landlords can update rent schedules
CREATE POLICY "Landlords can update rent schedules"
ON rent_schedules FOR UPDATE
USING (
  auth.uid() = landlord_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Landlords can delete rent schedules
CREATE POLICY "Landlords can delete rent schedules"
ON rent_schedules FOR DELETE
USING (
  auth.uid() = landlord_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_rent_schedules_updated_at
BEFORE UPDATE ON rent_schedules
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();