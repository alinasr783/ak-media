-- Ensure Clinic Data Script
-- Run this SQL in your Supabase SQL Editor to make sure clinics and users are properly set up

-- 1. Check current users and their clinic associations
SELECT id, email, clinic_id, role FROM users;

-- 2. Check current clinics
SELECT id, clinic_id, name, address FROM clinics;

-- 3. If no clinics exist, create a sample clinic
-- Using a simple numeric clinic_id as defined in the schema
INSERT INTO clinics (clinic_id, name, address, booking_price, online_booking_enabled)
SELECT 
  659031876 as clinic_id,  -- This matches the clinic_id from your error
  'عيادة الأمراض الجلدية' as name,
  'شارع الملك فهد، الرياض' as address,
  150.00 as booking_price,
  true as online_booking_enabled
WHERE NOT EXISTS (
  SELECT 1 FROM clinics WHERE clinic_id = 659031876
);

-- 4. If users don't have clinic_id set, associate them with the clinic
UPDATE users 
SET clinic_id = 659031876
WHERE clinic_id IS NULL;

-- 5. Verify the setup
SELECT 
  u.id as user_id,
  u.email,
  u.clinic_id,
  c.name as clinic_name
FROM users u
LEFT JOIN clinics c ON u.clinic_id = c.clinic_id;

-- 6. Ensure the online_booking_enabled column exists and is properly set
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS online_booking_enabled BOOLEAN DEFAULT true;

-- 7. Set default values for any existing rows that might have NULL
UPDATE clinics 
SET online_booking_enabled = true 
WHERE online_booking_enabled IS NULL;

-- 8. Final verification - check that we can query clinics
SELECT id, clinic_id, name, address, booking_price, online_booking_enabled FROM clinics;