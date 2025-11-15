-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Only allow users to create notifications for themselves
CREATE POLICY "Users can create own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add a policy for service role to create system notifications
CREATE POLICY "Service role can create any notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);