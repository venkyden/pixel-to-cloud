-- Fix search_path for functions - drop trigger first
DROP TRIGGER IF EXISTS set_application_timeout ON public.tenant_applications;
DROP FUNCTION IF EXISTS public.check_application_timeout();
DROP FUNCTION IF EXISTS public.expire_old_applications();

-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION public.check_application_timeout()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set default expiration to 7 days from creation if not set
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_old_applications()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tenant_applications
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < now()
    AND expires_at IS NOT NULL;
END;
$$;

-- Recreate trigger
CREATE TRIGGER set_application_timeout
  BEFORE INSERT ON public.tenant_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.check_application_timeout();