-- Update RLS Policies to Use clinic_uuid
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Doctors can read their clinic" ON clinics;
DROP POLICY IF EXISTS "Doctors can update their clinic" ON clinics;
DROP POLICY IF EXISTS "Secretaries can read their clinic" ON clinics;

-- Create new policies using clinic_uuid
-- Policy: Doctors can read their clinic via clinic_uuid
CREATE POLICY "Doctors can read their clinic"
ON clinics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'doctor'
    AND u.clinic_id = clinics.clinic_uuid
  )
);

-- Policy: Doctors can update their clinic via clinic_uuid
CREATE POLICY "Doctors can update their clinic"
ON clinics
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'doctor'
    AND u.clinic_id = clinics.clinic_uuid
  )
);

-- Policy: Secretaries can read clinics they belong to via clinic_uuid
CREATE POLICY "Secretaries can read their clinic"
ON clinics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'secretary'
    AND u.clinic_id = clinics.clinic_uuid
  )
);

-- Also update users RLS policies if needed
-- Policy: Doctors can read secretary data from their clinic (using clinic_uuid)
DROP POLICY IF EXISTS "Doctors can read secretary data" ON users;
CREATE POLICY "Doctors can read secretary data"
ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'doctor'
    AND u.clinic_id = users.clinic_id
  )
);

-- Policy: Secretaries can read doctor data from their clinic (using clinic_uuid)
DROP POLICY IF EXISTS "Secretaries can read doctor data" ON users;
CREATE POLICY "Secretaries can read doctor data"
ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'secretary'
    AND u.clinic_id = users.clinic_id
  )
);