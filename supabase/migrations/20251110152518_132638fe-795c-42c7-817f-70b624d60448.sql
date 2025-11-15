-- Create storage bucket for property videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-videos',
  'property-videos',
  false,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
);

-- Allow tenants to upload videos for their applications
CREATE POLICY "Users can upload their own property videos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'property-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own videos
CREATE POLICY "Users can view their own property videos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'property-videos' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR auth.uid() IN (
      SELECT owner_id FROM properties 
      WHERE id::text = (storage.foldername(name))[2]
    )
  )
);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own property videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'property-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create property inspections table
CREATE TABLE public.property_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('check-in', 'check-out')),
  video_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_inspections ENABLE ROW LEVEL SECURITY;

-- Users can create their own inspections
CREATE POLICY "Users can create inspections"
ON public.property_inspections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users and property owners can view inspections
CREATE POLICY "Users can view related inspections"
ON public.property_inspections
FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid() IN (
    SELECT owner_id FROM properties WHERE id = property_id
  )
);

-- Create index
CREATE INDEX idx_property_inspections_property ON public.property_inspections(property_id);
CREATE INDEX idx_property_inspections_user ON public.property_inspections(user_id);