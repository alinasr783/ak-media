-- Test Clinic Setup Script
-- Run this SQL in your Supabase SQL Editor to verify everything is working correctly

-- 1. First, let's check the current schema
\d users
\d clinics

-- 2. Check existing data
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'clinics' as table_name, COUNT(*) as row_count FROM clinics;

-- 3. Check users and their clinic associations
SELECT 
    id, 
    email, 
    clinic_id, 
    role,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 4. Check clinics
SELECT 
    id, 
    clinic_id, 
    name, 
    address, 
    booking_price, 
    online_booking_enabled,
    created_at
FROM clinics 
ORDER BY created_at DESC;

-- 5. Ensure we have a clinic with the specific ID from the error (659031876)
-- If not, create it
INSERT INTO clinics (clinic_id, name, address, booking_price, online_booking_enabled)
SELECT 
    659031876 as clinic_id,
    'عيادة اختبار النظام' as name,
    'عنوان عيادة الاختبار' as address,
    0.00 as booking_price,
    true as online_booking_enabled
WHERE NOT EXISTS (
    SELECT 1 FROM clinics WHERE clinic_id = 659031876
);

-- 6. Associate any users without clinic_id to this test clinic
UPDATE users 
SET clinic_id = 659031876
WHERE clinic_id IS NULL OR clinic_id = 0;

-- 7. Verify the online_booking_enabled column exists and is properly configured
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clinics' AND column_name = 'online_booking_enabled'
  ) THEN
    ALTER TABLE clinics ADD COLUMN online_booking_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 8. Set default values for any existing rows that might have NULL
UPDATE clinics 
SET online_booking_enabled = true 
WHERE online_booking_enabled IS NULL;

-- 9. Test querying the clinic that was causing issues
SELECT 
    id, 
    clinic_id, 
    name, 
    address, 
    booking_price, 
    online_booking_enabled
FROM clinics 
WHERE clinic_id = 659031876;

-- 10. Test joining users with clinics
SELECT 
    u.id as user_id,
    u.email,
    u.clinic_id,
    c.name as clinic_name,
    c.online_booking_enabled
FROM users u
LEFT JOIN clinics c ON u.clinic_id = c.clinic_id
ORDER BY u.created_at DESC;

-- 11. Final verification - check all required columns exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('users', 'clinics')
AND column_name IN ('clinic_id', 'online_booking_enabled')
ORDER BY table_name, column_name;