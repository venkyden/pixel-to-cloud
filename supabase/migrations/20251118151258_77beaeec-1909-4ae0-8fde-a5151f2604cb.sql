-- Create transaction_fees table for platform revenue tracking
CREATE TABLE IF NOT EXISTS public.transaction_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('application', 'contract', 'monthly_rent', 'deposit_release')),
  gross_amount NUMERIC NOT NULL CHECK (gross_amount >= 0),
  fee_amount NUMERIC NOT NULL CHECK (fee_amount >= 0),
  fee_percentage NUMERIC NOT NULL CHECK (fee_percentage >= 0 AND fee_percentage <= 1),
  net_amount NUMERIC NOT NULL CHECK (net_amount >= 0),
  description TEXT,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.tenant_applications(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transaction_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all transaction fees"
ON public.transaction_fees
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));