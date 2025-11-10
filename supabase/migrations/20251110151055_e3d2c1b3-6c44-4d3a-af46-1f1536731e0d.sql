-- Create function to notify on new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    NEW.recipient_id,
    'New Message',
    'You have a new message',
    'message',
    '/messages'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new messages
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Create function to notify landlord of new applications
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER AS $$
DECLARE
  property_owner_id UUID;
BEGIN
  -- Get the property owner
  SELECT owner_id INTO property_owner_id
  FROM public.properties
  WHERE id = NEW.property_id;
  
  IF property_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      property_owner_id,
      'New Application',
      'You have a new tenant application',
      'property',
      '/landlord'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new applications
CREATE TRIGGER on_new_application
  AFTER INSERT ON public.tenant_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_application();

-- Create function to notify on application status changes
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      'Application Update',
      'Your application status has been updated to ' || NEW.status,
      CASE 
        WHEN NEW.status = 'approved' THEN 'success'
        WHEN NEW.status = 'rejected' THEN 'error'
        ELSE 'info'
      END,
      '/tenant'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for application status changes
CREATE TRIGGER on_application_status_change
  AFTER UPDATE ON public.tenant_applications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_application_status_change();

-- Create function to notify on new incidents
CREATE OR REPLACE FUNCTION notify_new_incident()
RETURNS TRIGGER AS $$
DECLARE
  property_owner_id UUID;
BEGIN
  -- Get the property owner
  SELECT owner_id INTO property_owner_id
  FROM public.properties
  WHERE id = NEW.property_id;
  
  IF property_owner_id IS NOT NULL AND property_owner_id != NEW.reported_by THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      property_owner_id,
      'New Incident Reported',
      NEW.title,
      'incident',
      '/incidents'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new incidents
CREATE TRIGGER on_new_incident
  AFTER INSERT ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_incident();

-- Create function to notify on incident status changes
CREATE OR REPLACE FUNCTION notify_incident_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    -- Notify the reporter
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.reported_by,
      'Incident Update',
      'Incident "' || NEW.title || '" status changed to ' || NEW.status,
      CASE 
        WHEN NEW.status = 'resolved' THEN 'success'
        WHEN NEW.status = 'in_progress' THEN 'info'
        ELSE 'warning'
      END,
      '/incidents'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for incident status changes
CREATE TRIGGER on_incident_status_change
  AFTER UPDATE ON public.incidents
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_incident_status_change();