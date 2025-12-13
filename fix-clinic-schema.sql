-- Fix Clinic Schema to Match Expected Structure
-- Run this SQL in your Supabase SQL Editor

-- 1. First, let's examine the current structure
\d clinics
\d users

-- 2. Check existing data
SELECT * FROM clinics LIMIT 5;
SELECT * FROM users LIMIT 5;

-- 3. Fix the clinics table structure to match what the application expects
-- The application expects clinic_id to be a BIGINT, not UUID

-- Add the missing clinic_id column as BIGINT if it doesn't exist properly
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS clinic_id_bigint BIGINT;

-- Populate the BIGINT clinic_id from the UUID clinic_id
-- For existing records, we'll create a simple mapping
UPDATE clinics 
SET clinic_id_bigint = ABS(hashtext(LEFT(clinic_id::text, 10))) % 1000000000 + 1000
WHERE clinic_id_bigint IS NULL AND clinic_id IS NOT NULL;

-- For users, we need to also add a BIGINT version
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS clinic_id_bigint BIGINT;

-- Populate user clinic_id_bigint from their clinic_id UUID
UPDATE users 
SET clinic_id_bigint = ABS(hashtext(LEFT(clinic_id::text, 10))) % 1000000000 + 1000
WHERE clinic_id_bigint IS NULL AND clinic_id IS NOT NULL;

-- 4. Ensure the online_booking_enabled column exists
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS online_booking_enabled BOOLEAN DEFAULT true;

-- 5. Set default values for any existing rows that might have NULL
UPDATE clinics 
SET online_booking_enabled = true 
WHERE online_booking_enabled IS NULL;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinics_clinic_id_bigint ON clinics(clinic_id_bigint);
CREATE INDEX IF NOT EXISTS idx_users_clinic_id_bigint ON users(clinic_id_bigint);

-- 7. Verify the changes
SELECT 
    c.id,
    c.clinic_id,
    c.clinic_id_bigint,
    c.name,
    u.email as admin_email,
    u.clinic_id_bigint as user_clinic_id
FROM clinics c
LEFT JOIN users u ON c.clinic_id_bigint = u.clinic_id_bigint
LIMIT 10;

-- 8. If no clinics exist, create sample data
INSERT INTO clinics (clinic_id, clinic_id_bigint, name, address, booking_price, online_booking_enabled)
SELECT 
    gen_random_uuid() as clinic_id,
    1001 as clinic_id_bigint,
    'عيادة الأمراض الجلدية' as name,
    'شارع الملك فهد، الرياض' as address,
    150 as booking_price,
    true as online_booking_enabled
WHERE NOT EXISTS (SELECT 1 FROM clinics WHERE clinic_id_bigint = 1001);

-- 9. Associate users with clinics if needed
UPDATE users 
SET clinic_id_bigint = 1001
WHERE clinic_id_bigint IS NULL 
   OR clinic_id_bigint NOT IN (SELECT clinic_id_bigint FROM clinics WHERE clinic_id_bigint IS NOT NULL);

-- 10. Final verification
SELECT 
    u.id as user_id,
    u.email,
    u.clinic_id,
    u.clinic_id_bigint,
    c.name as clinic_name
FROM users u
LEFT JOIN clinics c ON u.clinic_id_bigint = c.clinic_id_bigint
WHERE u.clinic_id_bigint IS NOT NULL;