-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
);

-- RLS policies for verification documents
-- Users can upload their own verification documents
CREATE POLICY "Users can upload own verification documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own verification documents
CREATE POLICY "Users can view own verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own verification documents
CREATE POLICY "Users can update own verification documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own verification documents
CREATE POLICY "Users can delete own verification documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all verification documents
CREATE POLICY "Admins can view all verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);