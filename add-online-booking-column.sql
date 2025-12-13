-- Targeted Fix for Missing online_booking_enabled Column
-- Run this SQL in your Supabase SQL Editor

-- 1. Add the missing online_booking_enabled column to the clinics table
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS online_booking_enabled BOOLEAN DEFAULT true;

-- 2. Ensure the column has the correct default value
UPDATE clinics 
SET online_booking_enabled = true 
WHERE online_booking_enabled IS NULL;

-- 3. Ensure the public policy exists for accessing clinics
-- First drop any existing policy with the same name
DROP POLICY IF EXISTS "Public can read clinics by clinic_id for booking" ON clinics;

-- Create the policy that allows public read access
CREATE POLICY "Public can read clinics by clinic_id for booking"
ON clinics
FOR SELECT
USING (true);

-- 4. Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'clinics' AND column_name = 'online_booking_enabled';