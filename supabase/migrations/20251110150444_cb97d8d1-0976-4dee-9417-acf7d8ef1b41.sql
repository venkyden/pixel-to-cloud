-- Add explicit DELETE policy to payments table to prevent deletion of financial records
-- Financial transaction records should never be hard-deleted for audit and compliance purposes
CREATE POLICY "No one can delete payments" ON payments
FOR DELETE USING (false);