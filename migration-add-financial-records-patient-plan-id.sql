-- Migration script to add patient_plan_id column to financial_records table
-- Run this in your Supabase SQL editor

-- Add patient_plan_id column to financial_records table
ALTER TABLE financial_records 
ADD COLUMN IF NOT EXISTS patient_plan_id UUID REFERENCES patient_plans(id) ON DELETE SET NULL;

-- Create index on financial_records patient_plan_id
CREATE INDEX IF NOT EXISTS idx_financial_records_patient_plan_id ON financial_records(patient_plan_id);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';