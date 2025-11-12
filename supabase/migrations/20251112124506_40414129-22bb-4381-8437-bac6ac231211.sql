-- Create landlord verifications table
CREATE TABLE public.landlord_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  ownership_document_url TEXT,
  government_id_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landlord_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for landlord_verifications
CREATE POLICY "Users can view own verifications"
  ON public.landlord_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verifications"
  ON public.landlord_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verifications"
  ON public.landlord_verifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add expires_at to tenant_applications for timeout automation
ALTER TABLE public.tenant_applications
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create escrow payments table
CREATE TABLE public.escrow_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.tenant_applications(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  deposit_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT '€',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  escrow_released_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.escrow_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for escrow_payments
CREATE POLICY "Users can view related escrow payments"
  ON public.escrow_payments
  FOR SELECT
  USING (
    auth.uid() = tenant_id OR 
    auth.uid() = landlord_id OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Tenants can create escrow payments"
  ON public.escrow_payments
  FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Landlords can update escrow payments"
  ON public.escrow_payments
  FOR UPDATE
  USING (
    auth.uid() = landlord_id OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Create updated_at trigger for new tables
CREATE TRIGGER update_landlord_verifications_updated_at
  BEFORE UPDATE ON public.landlord_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_escrow_payments_updated_at
  BEFORE UPDATE ON public.escrow_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function for automatic application timeout
CREATE OR REPLACE FUNCTION public.check_application_timeout()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default expiration to 7 days from creation if not set
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timeout setting
CREATE TRIGGER set_application_timeout
  BEFORE INSERT ON public.tenant_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.check_application_timeout();

-- Create function to auto-expire applications
CREATE OR REPLACE FUNCTION public.expire_old_applications()
RETURNS void AS $$
BEGIN
  UPDATE public.tenant_applications
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < now()
    AND expires_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;