-- Create ratings table for landlord/tenant reviews
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rated_user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contract_id, reviewer_id)
);

-- Create property_diagnostics table for mandatory French diagnostics
CREATE TABLE IF NOT EXISTS public.property_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL UNIQUE REFERENCES public.properties(id) ON DELETE CASCADE,
  diagnostics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ratings table
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for ratings
CREATE POLICY "Users can view ratings for contracts they're part of"
ON public.ratings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contracts
    WHERE id = contract_id
    AND (tenant_id = auth.uid() OR landlord_id = auth.uid())
  )
);

CREATE POLICY "Users can create ratings for their contracts"
ON public.ratings
FOR INSERT
WITH CHECK (
  reviewer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.contracts
    WHERE id = contract_id
    AND (tenant_id = auth.uid() OR landlord_id = auth.uid())
    AND status = 'active'
  )
);

CREATE POLICY "Admins can manage all ratings"
ON public.ratings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on property_diagnostics table
ALTER TABLE public.property_diagnostics ENABLE ROW LEVEL SECURITY;

-- RLS policies for property_diagnostics
CREATE POLICY "Property owners can manage their diagnostics"
ON public.property_diagnostics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE id = property_id
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Tenants can view diagnostics for applied properties"
ON public.property_diagnostics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_applications ta
    JOIN public.properties p ON ta.property_id = p.id
    WHERE p.id = property_id
    AND ta.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.properties
    WHERE id = property_id
  )
);

CREATE POLICY "Admins can manage all diagnostics"
ON public.property_diagnostics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger for ratings
CREATE TRIGGER update_ratings_updated_at
BEFORE UPDATE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create updated_at trigger for property_diagnostics
CREATE TRIGGER update_property_diagnostics_updated_at
BEFORE UPDATE ON public.property_diagnostics
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();