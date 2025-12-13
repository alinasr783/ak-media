-- Fix Clinic Data Consistency Script
-- Run this SQL in your Supabase SQL Editor to fix the data inconsistency issues

-- 1. First, let's examine the current data structure
SELECT 
    id, 
    clinic_id, 
    clinic_id_bigint, 
    clinic_uuid, 
    name, 
    address 
FROM clinics 
LIMIT 10;

SELECT 
    id, 
    email, 
    clinic_id, 
    role 
FROM users 
LIMIT 10;

-- 2. Ensure all clinics have clinic_id_bigint populated
-- For clinics that have clinic_id as UUID but missing clinic_id_bigint
UPDATE clinics 
SET clinic_id_bigint = 659031876
WHERE clinic_id_bigint IS NULL AND clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- 3. For any other clinics with UUID clinic_id but missing clinic_id_bigint
-- Create a simple hash-based numeric ID
UPDATE clinics 
SET clinic_id_bigint = ABS(hashtext(LEFT(clinic_id::text, 10))) % 1000000000 + 1000
WHERE clinic_id_bigint IS NULL AND clinic_id IS NOT NULL AND clinic_id != '';

-- 4. Ensure all users have clinic_id populated correctly
-- If users have clinic_id as UUID, populate clinic_id_bigint
UPDATE users 
SET clinic_id = 659031876
WHERE clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- 5. For any other users with UUID clinic_id, map to their numeric equivalent
UPDATE users 
SET clinic_id = (
    SELECT clinic_id_bigint 
    FROM clinics 
    WHERE clinics.clinic_id = users.clinic_id
)
WHERE clinic_id IS NOT NULL 
  AND clinic_id LIKE '%-%-%-%-%' 
  AND EXISTS (
    SELECT 1 
    FROM clinics 
    WHERE clinics.clinic_id = users.clinic_id
  );

-- 6. Ensure the online_booking_enabled column exists and is properly set
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS online_booking_enabled BOOLEAN DEFAULT true;

-- 7. Set default values for any existing rows that might have NULL
UPDATE clinics 
SET online_booking_enabled = true 
WHERE online_booking_enabled IS NULL;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinics_clinic_id_bigint ON clinics(clinic_id_bigint);
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON users(clinic_id);

-- 9. Test the fix by querying the problematic clinic
SELECT 
    id, 
    clinic_id, 
    clinic_id_bigint, 
    clinic_uuid, 
    name, 
    address, 
    online_booking_enabled
FROM clinics 
WHERE clinic_id_bigint = 659031876 OR clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- 10. Verify user-clinic associations
SELECT 
    u.id as user_id,
    u.email,
    u.clinic_id as user_clinic_id,
    c.clinic_id as clinic_uuid,
    c.clinic_id_bigint,
    c.name as clinic_name
FROM users u
LEFT JOIN clinics c ON (
    u.clinic_id = c.clinic_id_bigint OR 
    u.clinic_id::text = c.clinic_id::text
)
ORDER BY u.created_at DESC;

-- 11. Final verification - check all required columns exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('users', 'clinics')
AND column_name IN ('clinic_id', 'clinic_id_bigint', 'clinic_uuid', 'online_booking_enabled')
ORDER BY table_name, column_name;