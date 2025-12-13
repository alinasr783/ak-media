-- Comprehensive Fix for Supabase Schema Cache Issues
-- Run this SQL in your Supabase SQL Editor

-- 1. Ensure the online_booking_enabled column exists with proper constraints
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS online_booking_enabled BOOLEAN DEFAULT true;

-- 2. Set default values for any existing rows that might have NULL
UPDATE clinics 
SET online_booking_enabled = true 
WHERE online_booking_enabled IS NULL;

-- 3. Refresh the schema cache by recreating the column with explicit type
-- This forces Supabase to refresh its internal schema cache
DO $$
BEGIN
  -- Only attempt this if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clinics' AND column_name = 'online_booking_enabled'
  ) THEN
    -- Alter the column to ensure proper typing
    ALTER TABLE clinics 
    ALTER COLUMN online_booking_enabled TYPE BOOLEAN USING online_booking_enabled::BOOLEAN;
    
    -- Ensure default value is set
    ALTER TABLE clinics 
    ALTER COLUMN online_booking_enabled SET DEFAULT true;
  END IF;
END $$;

-- 4. Ensure all required RLS policies exist
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Doctors can read their clinic" ON clinics;
DROP POLICY IF EXISTS "Doctors can update their clinic" ON clinics;
DROP POLICY IF EXISTS "Allow clinic insert during signup" ON clinics;
DROP POLICY IF EXISTS "Secretaries can read their clinic" ON clinics;
DROP POLICY IF EXISTS "Public can read clinics by clinic_id for booking" ON clinics;

-- Recreate all policies
CREATE POLICY "Doctors can read their clinic"
ON clinics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'doctor'
    AND u.clinic_id = clinics.clinic_id
  )
);

CREATE POLICY "Doctors can update their clinic"
ON clinics
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'doctor'
    AND u.clinic_id = clinics.clinic_id
  )
);

CREATE POLICY "Allow clinic insert during signup"
ON clinics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Secretaries can read their clinic"
ON clinics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'secretary'
    AND u.clinic_id = clinics.clinic_id
  )
);

CREATE POLICY "Public can read clinics by clinic_id for booking"
ON clinics
FOR SELECT
USING (true);

-- 5. Verify the column exists and has correct properties
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  is_updatable
FROM information_schema.columns
WHERE table_name = 'clinics' 
AND column_name = 'online_booking_enabled';

-- 6. Check if there are any clinics in the database
SELECT COUNT(*) as clinic_count FROM clinics;

-- 7. Show the first clinic record (if any exist)
SELECT * FROM clinics LIMIT 1;