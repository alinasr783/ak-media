-- Ensure Clinic Record Exists
-- Run this SQL in your Supabase SQL Editor

-- Check if any clinics exist
SELECT COUNT(*) as clinic_count FROM clinics;

-- If no clinics exist, create a sample clinic
-- Note: The clinic_id appears to be a UUID string, not a numeric ID
-- We'll need to extract the numeric part or use a different approach
INSERT INTO clinics (clinic_id, name, address, booking_price, online_booking_enabled)
SELECT 
  1234567890 as clinic_id,  -- Using a simple numeric ID
  'عيادة تجريبيّة' as name,
  'عنوان العيادة التجريبيّة' as address,
  0.00 as booking_price,
  true as online_booking_enabled
WHERE NOT EXISTS (
  SELECT 1 FROM clinics LIMIT 1
);

-- Verify the clinic exists
SELECT * FROM clinics LIMIT 5;

-- Also ensure the users table has a record for this clinic
-- This is just for verification - you may need to adjust based on your actual user data
SELECT * FROM users LIMIT 5;