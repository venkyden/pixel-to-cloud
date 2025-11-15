-- Add document URL columns to tenant_applications table
ALTER TABLE public.tenant_applications
ADD COLUMN IF NOT EXISTS government_id_url text,
ADD COLUMN IF NOT EXISTS income_proof_url text,
ADD COLUMN IF NOT EXISTS bank_statement_url text;