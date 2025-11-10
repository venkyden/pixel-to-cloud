-- Fix Critical Security Issues

-- Fix 1: Restrict profiles table visibility to own profile only
-- Currently allows public access with USING (true), exposing all emails and phone numbers
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Fix 2: Prevent privilege escalation by restricting role insertion
-- Only allow users to assign themselves 'tenant' or 'landlord' roles, not 'admin'
DROP POLICY IF EXISTS "Users can insert limited roles" ON public.user_roles;

CREATE POLICY "Users can insert limited roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role IN ('tenant'::app_role, 'landlord'::app_role)
);