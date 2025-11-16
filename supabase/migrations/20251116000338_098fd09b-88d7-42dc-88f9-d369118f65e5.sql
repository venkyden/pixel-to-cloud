-- Fix rent_schedules RLS: Replace DELETE policy with soft delete approach
-- Drop the existing DELETE policy
DROP POLICY IF EXISTS "Landlords can delete rent schedules" ON public.rent_schedules;

-- Update existing UPDATE policy to allow deactivation
DROP POLICY IF EXISTS "Landlords can update rent schedules" ON public.rent_schedules;

CREATE POLICY "Landlords can update rent schedules"
ON public.rent_schedules FOR UPDATE
USING (auth.uid() = landlord_id OR has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = landlord_id OR has_role(auth.uid(), 'admin'));

-- Create notification trigger for rent schedule deactivation
CREATE OR REPLACE FUNCTION public.notify_rent_schedule_deactivation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify if schedule is being deactivated
  IF OLD.active = true AND NEW.active = false THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.tenant_id,
      'Rent Schedule Deactivated',
      'Your automatic rent payment schedule has been deactivated by the landlord',
      'warning',
      '/tenant'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS notify_rent_schedule_deactivation_trigger ON public.rent_schedules;
CREATE TRIGGER notify_rent_schedule_deactivation_trigger
  AFTER UPDATE ON public.rent_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_rent_schedule_deactivation();