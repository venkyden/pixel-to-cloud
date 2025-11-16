-- Create lease_terminations table for end of lease notices
-- Compliant with French Law 89-462 Articles 12, 15, and 22

CREATE TABLE IF NOT EXISTS public.lease_terminations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  landlord_id UUID NOT NULL,
  
  -- Notice details
  notice_type TEXT NOT NULL CHECK (notice_type IN ('tenant_3months', 'tenant_1month', 'landlord_6months')),
  notice_date DATE NOT NULL,
  lease_start_date DATE,
  termination_date DATE NOT NULL,
  
  -- Party information
  tenant_name TEXT NOT NULL,
  landlord_name TEXT NOT NULL,
  property_address TEXT NOT NULL,
  
  -- Financial
  deposit_amount NUMERIC,
  deposit_returned BOOLEAN DEFAULT FALSE,
  deposit_return_date DATE,
  
  -- Additional details
  termination_reason TEXT,
  special_conditions TEXT,
  
  -- Document status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'acknowledged', 'completed')),
  document_url TEXT,
  sent_date DATE,
  acknowledged_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lease_terminations ENABLE ROW LEVEL SECURITY;

-- Tenants can view and create their own termination notices
CREATE POLICY "Tenants can view own terminations"
  ON public.lease_terminations
  FOR SELECT
  USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can create terminations"
  ON public.lease_terminations
  FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenants can update own terminations"
  ON public.lease_terminations
  FOR UPDATE
  USING (auth.uid() = tenant_id);

-- Landlords can view and create termination notices for their properties
CREATE POLICY "Landlords can view property terminations"
  ON public.lease_terminations
  FOR SELECT
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can create terminations"
  ON public.lease_terminations
  FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update property terminations"
  ON public.lease_terminations
  FOR UPDATE
  USING (auth.uid() = landlord_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all terminations"
  ON public.lease_terminations
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_lease_terminations_updated_at
  BEFORE UPDATE ON public.lease_terminations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create notification trigger for new termination notices
CREATE OR REPLACE FUNCTION public.notify_lease_termination()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify the other party when a termination notice is created
  IF NEW.tenant_id != NEW.landlord_id THEN
    -- If tenant is creating the notice, notify landlord
    IF auth.uid() = NEW.tenant_id THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        NEW.landlord_id,
        'Lease Termination Notice',
        'A tenant has submitted a lease termination notice for ' || NEW.property_address,
        'warning',
        '/landlord'
      );
    -- If landlord is creating the notice, notify tenant
    ELSIF auth.uid() = NEW.landlord_id THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        NEW.tenant_id,
        'Lease Termination Notice',
        'Your landlord has sent you a lease termination notice for ' || NEW.property_address,
        'warning',
        '/tenant'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_on_lease_termination
  AFTER INSERT ON public.lease_terminations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_lease_termination();

-- Create index for performance
CREATE INDEX idx_lease_terminations_tenant ON public.lease_terminations(tenant_id);
CREATE INDEX idx_lease_terminations_landlord ON public.lease_terminations(landlord_id);
CREATE INDEX idx_lease_terminations_property ON public.lease_terminations(property_id);
CREATE INDEX idx_lease_terminations_status ON public.lease_terminations(status);