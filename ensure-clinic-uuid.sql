-- Safe SQL Script to Ensure clinic_uuid Values Exist
-- Run this in your Supabase SQL Editor

-- Backup current data (optional but recommended)
-- CREATE TABLE clinics_backup AS SELECT * FROM clinics;

-- Check current state
SELECT 
    id, 
    clinic_id, 
    clinic_uuid, 
    name,
    CASE 
        WHEN clinic_uuid IS NULL THEN 'MISSING'
        WHEN clinic_uuid = '00000000-0000-0000-0000-000000000000' THEN 'INVALID'
        ELSE 'VALID'
    END as uuid_status
FROM clinics;

-- Update clinics where clinic_uuid is NULL or invalid
-- Use the id field as the fallback UUID
UPDATE clinics 
SET clinic_uuid = id
WHERE clinic_uuid IS NULL 
   OR clinic_uuid = '00000000-0000-0000-0000-000000000000'
   OR clinic_uuid = '';

-- Verify the update
SELECT 
    id, 
    clinic_id, 
    clinic_uuid, 
    name
FROM clinics
WHERE clinic_uuid IS NOT NULL 
  AND clinic_uuid != '00000000-0000-0000-0000-000000000000';

-- Create index on clinic_uuid for better performance
CREATE INDEX IF NOT EXISTS idx_clinics_clinic_uuid ON clinics(clinic_uuid);

-- Test the specific clinic that was causing issues
SELECT 
    id, 
    clinic_id, 
    clinic_uuid, 
    name
FROM clinics 
WHERE clinic_uuid = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f'
   OR id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';