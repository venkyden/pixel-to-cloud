-- Fix overly permissive RLS policy on property_diagnostics
-- Drop the policy with the security flaw
DROP POLICY IF EXISTS "Tenants can view diagnostics for applied properties" ON public.property_diagnostics;

-- Create corrected policy that only shows diagnostics for properties the user has applied to
CREATE POLICY "Tenants can view diagnostics for applied properties"
ON public.property_diagnostics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_applications ta
    WHERE ta.property_id = property_diagnostics.property_id
    AND ta.user_id = auth.uid()
  )
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_property_diagnostics_property_id 
ON public.property_diagnostics(property_id);