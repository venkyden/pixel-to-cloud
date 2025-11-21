-- Add phone number format validation constraints
-- French phone numbers: +33[1-9][0-9]{8}

-- Add check constraint for French phone format
ALTER TABLE public.profiles
ADD CONSTRAINT phone_format_check 
CHECK (
  phone IS NULL 
  OR phone ~ '^\+33[1-9][0-9]{8}$'
);

-- Add length constraint as fallback
ALTER TABLE public.profiles
ADD CONSTRAINT phone_length_check 
CHECK (
  phone IS NULL 
  OR (length(phone) >= 12 AND length(phone) <= 15)
);