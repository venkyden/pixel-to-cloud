-- Create documents storage bucket for tenant applications and verifications
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- RLS policies for documents bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Landlords can view tenant documents for their properties"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM tenant_applications ta
    JOIN properties p ON p.id = ta.property_id
    WHERE p.owner_id = auth.uid()
    AND (storage.foldername(name))[1] = ta.user_id::text
  )
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND has_role(auth.uid(), 'admin')
);

-- Add signature fields to property_inspections table
ALTER TABLE property_inspections
ADD COLUMN IF NOT EXISTS landlord_signature_url TEXT,
ADD COLUMN IF NOT EXISTS tenant_signature_url TEXT,
ADD COLUMN IF NOT EXISTS landlord_signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tenant_signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS inspection_data JSONB,
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

-- Create contracts table for generated lease agreements
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  landlord_id UUID NOT NULL,
  application_id UUID REFERENCES tenant_applications(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL DEFAULT 'standard', -- standard, furnished, commercial
  monthly_rent NUMERIC NOT NULL,
  deposit_amount NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  duration_months INTEGER,
  contract_data JSONB NOT NULL, -- All contract details
  pdf_url TEXT, -- Generated PDF URL
  tenant_signed_at TIMESTAMP WITH TIME ZONE,
  landlord_signed_at TIMESTAMP WITH TIME ZONE,
  tenant_signature_url TEXT,
  landlord_signature_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, pending_signatures, active, terminated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on contracts
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- RLS policies for contracts
CREATE POLICY "Users can view their own contracts"
ON contracts FOR SELECT
TO authenticated
USING (
  auth.uid() = tenant_id 
  OR auth.uid() = landlord_id 
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Landlords can create contracts"
ON contracts FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = landlord_id
  AND EXISTS (
    SELECT 1 FROM properties 
    WHERE id = contracts.property_id 
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own contracts"
ON contracts FOR UPDATE
TO authenticated
USING (
  auth.uid() = tenant_id 
  OR auth.uid() = landlord_id 
  OR has_role(auth.uid(), 'admin')
);

-- Trigger for updated_at
CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Function to notify contract signature
CREATE OR REPLACE FUNCTION notify_contract_signature()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Notify when tenant signs
  IF OLD.tenant_signed_at IS NULL AND NEW.tenant_signed_at IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      NEW.landlord_id,
      'Contract Signed by Tenant',
      'The tenant has signed the lease contract',
      'success',
      '/landlord'
    );
  END IF;
  
  -- Notify when landlord signs
  IF OLD.landlord_signed_at IS NULL AND NEW.landlord_signed_at IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
      NEW.tenant_id,
      'Contract Signed by Landlord',
      'The landlord has signed the lease contract',
      'success',
      '/tenant'
    );
  END IF;
  
  -- Notify both when contract becomes active (both signatures)
  IF NEW.tenant_signed_at IS NOT NULL 
     AND NEW.landlord_signed_at IS NOT NULL 
     AND NEW.status = 'active'
     AND OLD.status != 'active' THEN
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES 
      (NEW.tenant_id, 'Contract Active', 'Your lease contract is now active', 'success', '/tenant'),
      (NEW.landlord_id, 'Contract Active', 'The lease contract is now active', 'success', '/landlord');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_contract_signature_trigger
AFTER UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION notify_contract_signature();