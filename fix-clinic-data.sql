-- Fix Clinic Data Issues
-- Run this SQL in your Supabase SQL Editor

-- 1. Check what clinics currently exist
SELECT id, clinic_id, name, address FROM clinics;

-- 2. Check what users exist and their clinic associations
SELECT id, user_id, email, clinic_id, role FROM users;

-- 3. If there are no clinics, create a sample one
-- We'll use a simple numeric clinic_id since that's what the schema expects
INSERT INTO clinics (clinic_id, name, address, booking_price, online_booking_enabled)
SELECT 
  1001 as clinic_id,
  'عيادة الأمراض الجلدية' as name,
  'شارع الملك فهد، الرياض' as address,
  150.00 as booking_price,
  true as online_booking_enabled
WHERE NOT EXISTS (
  SELECT 1 FROM clinics LIMIT 1
);

-- 4. If there are users but no clinic association, associate them with the clinic
UPDATE users 
SET clinic_id = 1001
WHERE clinic_id IS NULL OR clinic_id = '';

-- 5. Verify the setup
SELECT 
  u.id as user_id,
  u.email,
  u.clinic_id,
  c.name as clinic_name
FROM users u
LEFT JOIN clinics c ON u.clinic_id = c.clinic_id;

-- 6. Ensure the online_booking_enabled column exists
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS online_booking_enabled BOOLEAN DEFAULT true;

-- 7. Set default values for any existing rows that might have NULL
UPDATE clinics 
SET online_booking_enabled = true 
WHERE online_booking_enabled IS NULL;