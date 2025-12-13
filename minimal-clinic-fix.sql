-- Minimal Clinic Fix Script
-- Run this SQL in your Supabase SQL Editor

-- Check if the specific clinic exists
SELECT 
    id, 
    clinic_id, 
    clinic_id_bigint, 
    name, 
    address,
    online_booking_enabled
FROM clinics 
WHERE clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- If it doesn't exist, create it with minimal data
INSERT INTO clinics (
    clinic_id,
    clinic_id_bigint,
    name,
    address,
    booking_price,
    online_booking_enabled
) VALUES (
    '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',
    659031876,
    'عيادة الأمراض الجلدية',
    'شارع الملك فهد، الرياض',
    150.00,
    true
) ON CONFLICT (clinic_id) 
DO UPDATE SET
    clinic_id_bigint = 659031876,
    name = 'عيادة الأمراض الجلدية',
    address = 'شارع الملك فهد، الرياض',
    booking_price = 150.00,
    online_booking_enabled = true;

-- Verify it exists now
SELECT 
    id, 
    clinic_id, 
    clinic_id_bigint, 
    name, 
    address,
    online_booking_enabled
FROM clinics 
WHERE clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';