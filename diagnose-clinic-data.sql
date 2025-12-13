-- Diagnostic SQL Script to Check Clinic Data
-- Run this in your Supabase SQL Editor

-- Check if clinic exists with the specific UUID
SELECT 
    id, 
    clinic_id, 
    clinic_uuid, 
    name, 
    online_booking_enabled,
    created_at,
    updated_at
FROM clinics 
WHERE clinic_uuid = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f'
   OR clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f'
   OR id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- Check all clinics
SELECT 
    id, 
    clinic_id, 
    clinic_uuid, 
    name, 
    online_booking_enabled,
    created_at,
    updated_at
FROM clinics 
ORDER BY created_at DESC;

-- Check users and their clinic associations
SELECT 
    u.id,
    u.email,
    u.clinic_id as user_clinic_id,
    c.name as clinic_name
FROM users u
LEFT JOIN clinics c ON u.clinic_id = c.clinic_uuid
ORDER BY u.created_at DESC;

-- Check if online_booking_enabled column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'clinics' 
  AND column_name = 'online_booking_enabled';