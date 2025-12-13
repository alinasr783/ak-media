-- Create Missing Clinic Record
-- Run this SQL in your Supabase SQL Editor

-- Check if the clinic with the specific UUID exists
SELECT 
    id, 
    clinic_id, 
    clinic_id_bigint, 
    clinic_uuid, 
    name, 
    address 
FROM clinics 
WHERE clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- If it doesn't exist, create it
INSERT INTO clinics (
    clinic_id, 
    clinic_id_bigint, 
    clinic_uuid, 
    name, 
    address, 
    booking_price, 
    online_booking_enabled,
    available_time
) VALUES (
    '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
    659031876,
    '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
    'عيادة الأمراض الجلدية',
    'شارع الملك فهد، الرياض',
    150.00,
    true,
    '{"saturday": {"start": "09:00", "end": "17:00", "off": false}, "sunday": {"start": "09:00", "end": "17:00", "off": false}, "monday": {"start": "09:00", "end": "17:00", "off": false}, "tuesday": {"start": "09:00", "end": "17:00", "off": false}, "wednesday": {"start": "09:00", "end": "17:00", "off": false}, "thursday": {"start": "09:00", "end": "17:00", "off": false}, "friday": {"start": "09:00", "end": "17:00", "off": true}}'
) ON CONFLICT (clinic_id) DO UPDATE SET
    clinic_id_bigint = 659031876,
    clinic_uuid = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
    name = 'عيادة الأمراض الجلدية',
    address = 'شارع الملك فهد، الرياض',
    booking_price = 150.00,
    online_booking_enabled = true;

-- Also ensure the numeric version exists
INSERT INTO clinics (
    clinic_id, 
    clinic_id_bigint, 
    clinic_uuid, 
    name, 
    address, 
    booking_price, 
    online_booking_enabled,
    available_time
) VALUES (
    '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
    659031876,
    '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
    'عيادة الأمراض الجلدية',
    'شارع الملك فهد، الرياض',
    150.00,
    true,
    '{"saturday": {"start": "09:00", "end": "17:00", "off": false}, "sunday": {"start": "09:00", "end": "17:00", "off": false}, "monday": {"start": "09:00", "end": "17:00", "off": false}, "tuesday": {"start": "09:00", "end": "17:00", "off": false}, "wednesday": {"start": "09:00", "end": "17:00", "off": false}, "thursday": {"start": "09:00", "end": "17:00", "off": false}, "friday": {"start": "09:00", "end": "17:00", "off": true}}'
) ON CONFLICT (clinic_id_bigint) DO UPDATE SET
    clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
    clinic_uuid = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
    name = 'عيادة الأمراض الجلدية',
    address = 'شارع الملك فهد، الرياض',
    booking_price = 150.00,
    online_booking_enabled = true;

-- Verify the clinic exists
SELECT 
    id, 
    clinic_id, 
    clinic_id_bigint, 
    clinic_uuid, 
    name, 
    address,
    online_booking_enabled
FROM clinics 
WHERE clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f' 
   OR clinic_id_bigint = 659031876;

-- Also check user association
SELECT 
    id, 
    email, 
    clinic_id, 
    role
FROM users 
WHERE clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f' 
   OR clinic_id = '659031876';