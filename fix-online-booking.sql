-- Comprehensive Fix for Online Booking Issues
-- Run this SQL in your Supabase SQL Editor

-- 1. Ensure the clinics table exists with all required columns
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  booking_price DECIMAL(10, 2) DEFAULT 0.00,
  available_time JSONB,
  online_booking_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ensure the online_booking_enabled column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clinics' AND column_name = 'online_booking_enabled'
  ) THEN
    ALTER TABLE clinics ADD COLUMN online_booking_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 3. Ensure the clinic_id column is properly indexed
CREATE INDEX IF NOT EXISTS idx_clinics_clinic_id ON clinics(clinic_id);

-- 4. Refresh the schema cache by recreating the column with the same definition
-- This helps resolve the "column not found in schema cache" error
DO $$
BEGIN
  -- Only attempt to alter if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clinics' AND column_name = 'online_booking_enabled'
  ) THEN
    ALTER TABLE clinics ALTER COLUMN online_booking_enabled TYPE BOOLEAN USING online_booking_enabled::BOOLEAN;
    ALTER TABLE clinics ALTER COLUMN online_booking_enabled SET DEFAULT true;
  END IF;
END $$;

-- 5. Ensure proper RLS (Row Level Security) is enabled
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- 6. Ensure the public policy exists for accessing clinics
-- Policy: Doctors can read their clinic via clinic_id
DROP POLICY IF EXISTS "Doctors can read their clinic" ON clinics;
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

-- Policy: Doctors can update their clinic via clinic_id
DROP POLICY IF EXISTS "Doctors can update their clinic" ON clinics;
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

-- Policy: Allow insert during signup
DROP POLICY IF EXISTS "Allow clinic insert during signup" ON clinics;
CREATE POLICY "Allow clinic insert during signup"
ON clinics
FOR INSERT
WITH CHECK (true);

-- Policy: Secretaries can read clinics they belong to
DROP POLICY IF EXISTS "Secretaries can read their clinic" ON clinics;
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

-- Policy: Public can read clinics by clinic_id for booking page
DROP POLICY IF EXISTS "Public can read clinics by clinic_id for booking" ON clinics;
CREATE POLICY "Public can read clinics by clinic_id for booking"
ON clinics
FOR SELECT
USING (true);

-- 7. Create a test clinic record if none exists
-- This is helpful for testing purposes
INSERT INTO clinics (clinic_id, name, address, booking_price, online_booking_enabled)
SELECT 
  1234567890 as clinic_id,
  'عيادة تجريبيّة' as name,
  'عنوان العيادة التجريبيّة' as address,
  0.00 as booking_price,
  true as online_booking_enabled
WHERE NOT EXISTS (
  SELECT 1 FROM clinics LIMIT 1
);

-- 8. Refresh the schema cache for the clinics table
-- Note: This is a workaround to force Supabase to refresh its schema cache
-- You may need to restart your Supabase project or wait a few minutes for the cache to refresh

-- 9. Verify the setup
-- Check if the table and columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'clinics'
ORDER BY ordinal_position;
