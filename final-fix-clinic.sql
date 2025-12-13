-- Final Fix for Clinic Data
-- Run this SQL in your Supabase SQL Editor

-- First, check if the clinic exists
SELECT 
    id, 
    clinic_id, 
    clinic_id_bigint, 
    name, 
    address,
    online_booking_enabled
FROM clinics 
WHERE clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- Check if any clinics exist at all
SELECT COUNT(*) as total_clinics FROM clinics;

-- Check users and their clinic associations
SELECT 
    id, 
    email, 
    clinic_id, 
    role
FROM users;

-- Create or update the missing clinic record
INSERT INTO clinics (
    clinic_id,
    clinic_id_bigint,
    name,
    address,
    booking_price,
    online_booking_enabled,
    available_time
) VALUES (
    '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
    659031876,
    'عيادة الأمراض الجلدية',
    'شارع الملك فهد، الرياض',
    150.00,
    true,
    '{"saturday": {"start": "09:00", "end": "17:00", "off": false}, "sunday": {"start": "09:00", "end": "17:00", "off": false}, "monday": {"start": "09:00", "end": "17:00", "off": false}, "tuesday": {"start": "09:00", "end": "17:00", "off": false}, "wednesday": {"start": "09:00", "end": "17:00", "off": false}, "thursday": {"start": "09:00", "end": "17:00", "off": false}, "friday": {"start": "09:00", "end": "17:00", "off": true}}'
) ON CONFLICT (clinic_id) 
DO UPDATE SET
    clinic_id_bigint = 659031876,
    name = 'عيادة الأمراض الجلدية',
    address = 'شارع الملك فهد، الرياض',
    booking_price = 150.00,
    online_booking_enabled = true;

-- Ensure users are associated with this clinic
UPDATE users 
SET clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f'
WHERE clinic_id IS NULL OR clinic_id = '';

-- Verify the fix worked
SELECT 
    id, 
    clinic_id, 
    clinic_id_bigint, 
    name, 
    address,
    online_booking_enabled
FROM clinics 
WHERE clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- Test querying by clinic_id_bigint as well
SELECT 
    id, 
    clinic_id, 
    clinic_id_bigint, 
    name, 
    address,
    online_booking_enabled
FROM clinics 
WHERE clinic_id_bigint = 659031876;