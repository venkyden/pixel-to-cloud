-- Add comment length constraint to ratings table
ALTER TABLE public.ratings
ADD CONSTRAINT comment_length_check 
CHECK (length(comment) <= 500 OR comment IS NULL);