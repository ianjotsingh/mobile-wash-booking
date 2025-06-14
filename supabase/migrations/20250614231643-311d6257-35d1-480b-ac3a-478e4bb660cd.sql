
-- Add the missing 'state' column to the companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS state TEXT;

-- Also add any other potentially missing columns that might be needed
ALTER TABLE companies ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT;
