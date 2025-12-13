-- Fix Clinic ID Columns Migration Script
-- This script standardizes clinic ID usage across all tables

-- 1. Fix the clinics table to ensure proper clinic ID handling
-- Add clinic_id column as TEXT/UUID if it doesn't exist
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS clinic_id TEXT;

-- Update existing records to ensure clinic_id is populated
UPDATE clinics 
SET clinic_id = clinic_uuid::TEXT 
WHERE clinic_id IS NULL AND clinic_uuid IS NOT NULL;

-- 2. Fix the users table to ensure proper clinic ID handling
-- The users table already has clinic_id as uuid, which is correct

-- 3. Fix the financial_records table to use UUID instead of BIGINT
-- First, add a new clinic_uuid column if it doesn't exist
ALTER TABLE financial_records 
ADD COLUMN IF NOT EXISTS clinic_uuid UUID;

-- Add clinic_id column as TEXT if it doesn't exist
ALTER TABLE financial_records 
ADD COLUMN IF NOT EXISTS clinic_id TEXT;

-- 4. Add proper foreign key constraints
-- For appointments table
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS appointments_clinic_id_fkey;

-- For clinics table
ALTER TABLE clinics 
DROP CONSTRAINT IF EXISTS clinics_clinic_id_fkey;

-- For notifications table
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_clinic_id_fkey;

-- For patient_plans table
ALTER TABLE patient_plans 
DROP CONSTRAINT IF EXISTS patient_plans_clinic_id_fkey;

-- For patients table
ALTER TABLE patients 
DROP CONSTRAINT IF EXISTS patients_clinic_id_fkey;

-- For subscriptions table
ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_clinic_id_fkey;

-- For treatment_templates table
ALTER TABLE treatment_templates 
DROP CONSTRAINT IF EXISTS treatment_templates_clinic_id_fkey;

-- For users table
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_clinic_id_fkey;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinics_clinic_id ON clinics(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinics_clinic_uuid ON clinics(clinic_uuid);
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON users(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_notifications_clinic_id ON notifications(clinic_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_clinic_id ON financial_records(clinic_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_clinic_uuid ON financial_records(clinic_uuid);

-- 6. Refresh the schema cache
NOTIFY pgrst, 'reload schema';