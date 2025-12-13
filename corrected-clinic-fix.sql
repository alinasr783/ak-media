-- Corrected Clinic Fix Script Based on Actual Database Structure
-- Run this SQL in your Supabase SQL Editor

-- First, let's examine the actual table structure
-- Based on your data, it seems the clinics table has:
-- id (primary key UUID)
-- clinic_id (UUID - this is what we query by)
-- clinic_uuid (another UUID field)
-- name, address, etc.

-- Check what clinics currently exist
SELECT 
    id, 
    clinic_id, 
    clinic_uuid, 
    name, 
    address,
    online_booking_enabled
FROM clinics;

-- Check users and their clinic associations
SELECT 
    id, 
    email, 
    clinic_id, 
    role
FROM users;

-- Create or update the clinic record with the correct structure
-- Based on your data, the clinic_id is a UUID, not a BIGINT
INSERT INTO clinics (
    id,
    clinic_id,
    clinic_uuid,
    name,
    address,
    booking_price,
    online_booking_enabled
) VALUES (
    'd7893b23-adac-436b-96ce-685242f1d019',  -- This is the primary key ID
    '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f',  -- This is what we query by
    'd7893b23-adac-436b-96ce-685242f1d019',  -- This matches the ID
    'عيادة الأمراض الجلدية',
    'شارع الملك فهد، الرياض',
    150.00,
    true
) ON CONFLICT (clinic_id) 
DO UPDATE SET
    id = 'd7893b23-adac-436b-96ce-685242f1d019',
    clinic_uuid = 'd7893b23-adac-436b-96ce-685242f1d019',
    name = 'عيادة الأمراض الجلدية',
    address = 'شارع الملك فهد، الرياض',
    booking_price = 150.00,
    online_booking_enabled = true;

-- Ensure users are associated with this clinic
-- Users table uses clinic_id as UUID based on your data
UPDATE users 
SET clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f'
WHERE clinic_id IS NULL OR clinic_id = '' OR LENGTH(clinic_id) < 10;

-- Verify the fix worked
SELECT 
    id, 
    clinic_id, 
    clinic_uuid, 
    name, 
    address,
    online_booking_enabled
FROM clinics 
WHERE clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';

-- Test the specific query that was failing in the API
SELECT 
    id, 
    clinic_id, 
    clinic_uuid, 
    name, 
    address,
    online_booking_enabled
FROM clinics 
WHERE clinic_id = '7cf3a2a3-ee02-4a21-934f-be27f0e20d8f';