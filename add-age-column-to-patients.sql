-- Add age column to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS age INTEGER;

-- Add index on age column for faster queries
CREATE INDEX IF NOT EXISTS idx_patients_age ON patients(age);

-- Update existing patients to calculate age from date_of_birth
UPDATE patients 
SET age = EXTRACT(YEAR FROM AGE(date_of_birth))
WHERE date_of_birth IS NOT NULL AND age IS NULL;