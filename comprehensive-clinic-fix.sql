-- Comprehensive Clinic Fix Script
-- Run this SQL in your Supabase SQL Editor

-- 1. First, let's check what tables exist and their structure
\d clinics
\d users

-- 2. Check if any clinics exist
SELECT COUNT(*) as total_clinics FROM clinics;

-- 3. Check existing clinics data
SELECT 
    id, 
    clinic_id, 
    clinic_id_bigint, 
    name, 
    address,
    online_booking_enabled,
    created_at
FROM clinics;

-- 4. Check users and their clinic associations
SELECT 
    id, 
    email, 
    clinic_id, 
    role,
    created_at
FROM users;

-- 5. Ensure the clinics table has all required columns
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS clinic_id_bigint BIGINT,
ADD COLUMN IF NOT EXISTS clinic_uuid UUID,
ADD COLUMN IF NOT EXISTS online_booking_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS available_time JSONB;

-- 6. Ensure the users table has the clinic_id column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS clinic_id TEXT;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinics_clinic_id ON clinics(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinics_clinic_id_bigint ON clinics(clinic_id_bigint);
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON users(clinic_id);

-- 8. Insert or update the specific clinic record that the system is looking for
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
) ON CONFLICT (clinic_id) 
DO UPDATE SET
    clinic_id_bigint = 659031876,
    clinic_uuid = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
    name = 'عيادة الأمراض الجلدية',
    address = 'شارع الملك فهد، الرياض',
    booking_price = 150.00,
    online_booking_enabled = true,
    available_time = '{"saturday": {"start": "09:00", "end": "17:00", "off": false}, "sunday": {"start": "09:00", "end": "17:00", "off": false}, "monday": {"start": "09:00", "end": "17:00", "off": false}, "tuesday": {"start": "09:00", "end": "17:00", "off": false}, "wednesday": {"start": "09:00", "end": "17:00", "off": false}, "thursday": {"start": "09:00", "end": "17:00", "off": false}, "friday": {"start": "09:00", "end": "17:00", "off": true}}';

-- 9. Also ensure a record exists with the numeric clinic_id
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
) ON CONFLICT (clinic_id_bigint) 
DO UPDATE SET
    clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
    clinic_uuid = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
    name = 'عيادة الأمراض الجلدية',
    address = 'شارع الملك فهد، الرياض',
    booking_price = 150.00,
    online_booking_enabled = true,
    available_time = '{"saturday": {"start": "09:00", "end": "17:00", "off": false}, "sunday": {"start": "09:00", "end": "17:00", "off": false}, "monday": {"start": "09:00", "end": "17:00", "off": false}, "tuesday": {"start": "09:00", "end": "17:00", "off": false}, "wednesday": {"start": "09:00", "end": "17:00", "off": false}, "thursday": {"start": "09:00", "end": "17:00", "off": false}, "friday": {"start": "09:00", "end": "17:00", "off": true}}';

-- 10. Ensure users are associated with this clinic
UPDATE users 
SET clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f'
WHERE clinic_id IS NULL OR clinic_id = '' OR LENGTH(clinic_id) < 10;

-- 11. Final verification - check that the clinic exists
SELECT 
    id, 
    clinic_id, 
    clinic_id_bigint, 
    clinic_uuid,
    name, 
    address,
    booking_price,
    online_booking_enabled,
    available_time,
    created_at
FROM clinics 
WHERE clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- 12. Verify user-clinic associations
SELECT 
    u.id as user_id,
    u.email,
    u.clinic_id as user_clinic_id,
    c.name as clinic_name
FROM users u
LEFT JOIN clinics c ON u.clinic_id = c.clinic_id
ORDER BY u.created_at DESC;

-- 13. Test the specific query that was failing
SELECT 
    id, 
    clinic_id, 
    name, 
    address,
    online_booking_enabled
FROM clinics 
WHERE clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';