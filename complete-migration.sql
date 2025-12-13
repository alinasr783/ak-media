-- Complete migration script for Tabibi database
-- Run this in your Supabase SQL editor to set up all required tables and columns

-- 1. Create financial_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add patient_plan_id column to visits table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visits' AND column_name = 'patient_plan_id'
  ) THEN
    ALTER TABLE visits ADD COLUMN patient_plan_id UUID REFERENCES patient_plans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Add patient_plan_id column to financial_records table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_records' AND column_name = 'patient_plan_id'
  ) THEN
    ALTER TABLE financial_records ADD COLUMN patient_plan_id UUID REFERENCES patient_plans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_financial_records_clinic_id ON financial_records(clinic_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_appointment_id ON financial_records(appointment_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_patient_id ON financial_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_recorded_at ON financial_records(recorded_at);
CREATE INDEX IF NOT EXISTS idx_visits_patient_plan_id ON visits(patient_plan_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_patient_plan_id ON financial_records(patient_plan_id);

-- 5. Enable RLS on financial_records if not already enabled
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- 6. Add RLS policies for financial_records if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can read financial records from their clinic'
  ) THEN
    CREATE POLICY "Users can read financial records from their clinic"
    ON financial_records
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = financial_records.clinic_id
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can insert financial records to their clinic'
  ) THEN
    CREATE POLICY "Users can insert financial records to their clinic"
    ON financial_records
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = financial_records.clinic_id
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can update financial records from their clinic'
  ) THEN
    CREATE POLICY "Users can update financial records from their clinic"
    ON financial_records
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = financial_records.clinic_id
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can delete financial records from their clinic'
  ) THEN
    CREATE POLICY "Users can delete financial records from their clinic"
    ON financial_records
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = financial_records.clinic_id
      )
    );
  END IF;
END $$;

-- 7. Refresh the schema cache
NOTIFY pgrst, 'reload schema';