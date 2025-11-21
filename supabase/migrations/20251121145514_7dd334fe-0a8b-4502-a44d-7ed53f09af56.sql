-- Create disputes table for mediation system
CREATE TYPE public.dispute_status AS ENUM ('open', 'investigating', 'mediation_scheduled', 'resolved', 'closed');
CREATE TYPE public.dispute_category AS ENUM ('rent_payment', 'property_damage', 'lease_terms', 'maintenance', 'deposit', 'noise', 'other');

CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  landlord_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  
  -- Dispute details
  category public.dispute_category NOT NULL,
  title TEXT NOT NULL CHECK (length(title) <= 200),
  description TEXT NOT NULL CHECK (length(description) <= 2000),
  status public.dispute_status NOT NULL DEFAULT 'open',
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 5),
  
  -- Evidence and resolution
  evidence_urls TEXT[] DEFAULT '{}',
  resolution_notes TEXT,
  mediator_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Landlords can view disputes for their properties
CREATE POLICY "Landlords can view property disputes"
ON public.disputes
FOR SELECT
USING (auth.uid() = landlord_id OR has_role(auth.uid(), 'admin'));

-- Tenants can view their disputes
CREATE POLICY "Tenants can view own disputes"
ON public.disputes
FOR SELECT
USING (auth.uid() = tenant_id OR has_role(auth.uid(), 'admin'));

-- Landlords and tenants can create disputes
CREATE POLICY "Landlords can create disputes"
ON public.disputes
FOR INSERT
WITH CHECK (
  auth.uid() = landlord_id 
  AND EXISTS (
    SELECT 1 FROM properties 
    WHERE id = property_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Tenants can create disputes"
ON public.disputes
FOR INSERT
WITH CHECK (auth.uid() = tenant_id);

-- Both parties can update disputes
CREATE POLICY "Parties can update disputes"
ON public.disputes
FOR UPDATE
USING (
  auth.uid() = landlord_id 
  OR auth.uid() = tenant_id 
  OR has_role(auth.uid(), 'admin')
);

-- Create dispute timeline table for audit trail
CREATE TABLE public.dispute_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dispute_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view dispute timeline"
ON public.dispute_timeline
FOR SELECT
USING (
  dispute_id IN (
    SELECT id FROM disputes 
    WHERE auth.uid() = landlord_id 
    OR auth.uid() = tenant_id 
    OR has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Users can create timeline entries"
ON public.dispute_timeline
FOR INSERT
WITH CHECK (
  dispute_id IN (
    SELECT id FROM disputes 
    WHERE auth.uid() = landlord_id OR auth.uid() = tenant_id
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_disputes_updated_at
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for performance
CREATE INDEX idx_disputes_landlord ON public.disputes(landlord_id);
CREATE INDEX idx_disputes_tenant ON public.disputes(tenant_id);
CREATE INDEX idx_disputes_property ON public.disputes(property_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_dispute_timeline_dispute ON public.dispute_timeline(dispute_id);