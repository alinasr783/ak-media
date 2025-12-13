-- Migration script to add patient_plan_id column to visits table
-- Run this in your Supabase SQL editor

-- Add patient_plan_id column to visits table
ALTER TABLE visits 
ADD COLUMN IF NOT EXISTS patient_plan_id UUID REFERENCES patient_plans(id) ON DELETE SET NULL;

-- Create index on visits patient_plan_id
CREATE INDEX IF NOT EXISTS idx_visits_patient_plan_id ON visits(patient_plan_id);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';