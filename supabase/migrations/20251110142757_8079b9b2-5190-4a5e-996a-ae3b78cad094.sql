-- Add GDPR compliance tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gdpr_consent_given boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gdpr_consent_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS data_processing_consent boolean DEFAULT false;

-- Create data_deletion_requests table for GDPR right to erasure
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requested_at timestamp with time zone DEFAULT now() NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  completed_at timestamp with time zone,
  reason text,
  UNIQUE(user_id)
);

-- Enable RLS on data_deletion_requests
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can only view and insert their own deletion requests
CREATE POLICY "Users can view own deletion requests"
ON public.data_deletion_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deletion requests"
ON public.data_deletion_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create data_exports table for GDPR right to data portability
CREATE TABLE IF NOT EXISTS public.data_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requested_at timestamp with time zone DEFAULT now() NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  download_url text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on data_exports
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

-- Users can only view their own export requests
CREATE POLICY "Users can view own export requests"
ON public.data_exports
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own export requests"
ON public.data_exports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on audit_logs (only admins can view)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add comments for GDPR transparency
COMMENT ON TABLE public.profiles IS 'User profile data - GDPR compliant with consent tracking';
COMMENT ON COLUMN public.profiles.gdpr_consent_given IS 'User consent for data processing under GDPR';
COMMENT ON COLUMN public.profiles.gdpr_consent_date IS 'Date when GDPR consent was given';
COMMENT ON TABLE public.data_deletion_requests IS 'GDPR Article 17 - Right to erasure requests';
COMMENT ON TABLE public.data_exports IS 'GDPR Article 20 - Right to data portability requests';