-- SQL Test Query to Verify the Fix
-- Run this in your Supabase SQL Editor

-- Test 1: Verify the clinic exists with correct clinic_uuid
SELECT 
    id, 
    clinic_id, 
    clinic_uuid, 
    name, 
    online_booking_enabled
FROM clinics 
WHERE clinic_uuid = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- Test 2: Update the clinic using clinic_uuid (this should work now)
UPDATE clinics 
SET online_booking_enabled = true
WHERE clinic_uuid = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- Test 3: Verify the update worked
SELECT 
    id, 
    clinic_id, 
    clinic_uuid, 
    name, 
    online_booking_enabled
FROM clinics 
WHERE clinic_uuid = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- Test 4: Check the join between users and clinics
SELECT 
    u.id as user_id,
    u.email,
    u.clinic_id as user_clinic_uuid,
    c.name as clinic_name,
    c.online_booking_enabled
FROM users u
JOIN clinics c ON u.clinic_id = c.clinic_uuid
WHERE u.clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';