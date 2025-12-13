-- Setup Clinic for User
-- Run this SQL in your Supabase SQL Editor

-- 1. First, let's see what users exist and their clinic_id associations
SELECT id, user_id, email, clinic_id, role FROM users;

-- 2. Check what clinics currently exist
SELECT id, clinic_id, name, address FROM clinics;

-- 3. Find users that have clinic_id but no matching clinic record
SELECT 
    u.id,
    u.email,
    u.clinic_id,
    CASE 
        WHEN c.clinic_id IS NULL THEN 'No matching clinic'
        ELSE 'Clinic exists'
    END as clinic_status
FROM users u
LEFT JOIN clinics c ON u.clinic_id = c.clinic_id
WHERE u.clinic_id IS NOT NULL;

-- 4. Create a clinic record for the problematic clinic_id
-- Since we saw clinic_id '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f' in the error,
-- but it seems to be a UUID stored as BIGINT, we'll create a simple numeric clinic
INSERT INTO clinics (clinic_id, name, address, booking_price, online_booking_enabled)
VALUES 
    (1001, 'عيادة الأمراض الجلدية', 'شارع الملك فهد، الرياض', 150.00, true),
    (1002, 'عيادة الأسنان', 'شارع الملك عبدالعزيز، جدة', 200.00, true),
    (1003, 'عيادة طب الأطفال', 'شارع الإمام سعود، الدمام', 120.00, true)
ON CONFLICT DO NOTHING;

-- 5. Update users to associate them with existing clinics
-- This will assign the first clinic (1001) to all users that don't have a valid clinic
UPDATE users 
SET clinic_id = 1001
WHERE clinic_id IS NULL 
   OR clinic_id NOT IN (SELECT clinic_id FROM clinics)
   OR clinic_id = '';

-- 6. Verify the final setup
SELECT 
    u.id as user_id,
    u.email,
    u.clinic_id,
    c.name as clinic_name,
    c.address as clinic_address
FROM users u
JOIN clinics c ON u.clinic_id = c.clinic_id;

-- 7. Ensure the online_booking_enabled column exists and is properly set
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS online_booking_enabled BOOLEAN DEFAULT true;

-- 8. Set default values for any existing rows that might have NULL
UPDATE clinics 
SET online_booking_enabled = true 
WHERE online_booking_enabled IS NULL;

-- 9. Final verification - check that we can query clinics
SELECT id, clinic_id, name, address, booking_price, online_booking_enabled FROM clinics;