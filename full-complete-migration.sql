-- Full complete migration script for Tabibi database
-- Run this in your Supabase SQL editor to set up all required tables and columns

-- 1. Create patients table if it doesn't exist
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on patients clinic_id
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);

-- 2. Create treatment_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS treatment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  session_price DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on treatment_templates clinic_id
CREATE INDEX IF NOT EXISTS idx_treatment_templates_clinic_id ON treatment_templates(clinic_id);

-- 3. Create patient_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS patient_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES treatment_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  total_sessions INTEGER NOT NULL DEFAULT 1,
  completed_sessions INTEGER NOT NULL DEFAULT 0,
  total_price DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for patient_plans
CREATE INDEX IF NOT EXISTS idx_patient_plans_clinic_id ON patient_plans(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_plans_patient_id ON patient_plans(patient_id);

-- 4. Create financial_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  patient_plan_id UUID REFERENCES patient_plans(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add patient_plan_id column to visits table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visits' AND column_name = 'patient_plan_id'
  ) THEN
    ALTER TABLE visits ADD COLUMN patient_plan_id UUID REFERENCES patient_plans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 6. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_financial_records_clinic_id ON financial_records(clinic_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_appointment_id ON financial_records(appointment_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_patient_id ON financial_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_recorded_at ON financial_records(recorded_at);
CREATE INDEX IF NOT EXISTS idx_visits_patient_plan_id ON visits(patient_plan_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_patient_plan_id ON financial_records(patient_plan_id);

-- 7. Enable RLS on new tables if not already enabled
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- 8. Add RLS policies for patients table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can read patients from their clinic'
  ) THEN
    CREATE POLICY "Users can read patients from their clinic"
    ON patients
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = patients.clinic_id
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can insert patients to their clinic'
  ) THEN
    CREATE POLICY "Users can insert patients to their clinic"
    ON patients
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = patients.clinic_id
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can update patients from their clinic'
  ) THEN
    CREATE POLICY "Users can update patients from their clinic"
    ON patients
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = patients.clinic_id
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can delete patients from their clinic'
  ) THEN
    CREATE POLICY "Users can delete patients from their clinic"
    ON patients
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = patients.clinic_id
      )
    );
  END IF;
END $$;

-- 9. Add RLS policies for treatment_templates table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can read treatment templates from their clinic'
  ) THEN
    CREATE POLICY "Users can read treatment templates from their clinic"
    ON treatment_templates
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = treatment_templates.clinic_id
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can insert treatment templates to their clinic'
  ) THEN
    CREATE POLICY "Users can insert treatment templates to their clinic"
    ON treatment_templates
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = treatment_templates.clinic_id
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can update treatment templates from their clinic'
  ) THEN
    CREATE POLICY "Users can update treatment templates from their clinic"
    ON treatment_templates
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = treatment_templates.clinic_id
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can delete treatment templates from their clinic'
  ) THEN
    CREATE POLICY "Users can delete treatment templates from their clinic"
    ON treatment_templates
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = treatment_templates.clinic_id
      )
    );
  END IF;
END $$;

-- 10. Add RLS policies for patient_plans table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can read patient plans from their clinic'
  ) THEN
    CREATE POLICY "Users can read patient plans from their clinic"
    ON patient_plans
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = patient_plans.clinic_id
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can insert patient plans to their clinic'
  ) THEN
    CREATE POLICY "Users can insert patient plans to their clinic"
    ON patient_plans
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = patient_plans.clinic_id
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can update patient plans from their clinic'
  ) THEN
    CREATE POLICY "Users can update patient plans from their clinic"
    ON patient_plans
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = patient_plans.clinic_id
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can delete patient plans from their clinic'
  ) THEN
    CREATE POLICY "Users can delete patient plans from their clinic"
    ON patient_plans
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = patient_plans.clinic_id
      )
    );
  END IF;
END $$;

-- 11. Add RLS policies for financial_records table if they don't exist
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

-- 12. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Create triggers to automatically update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_patients_updated_at'
  ) THEN
    CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_treatment_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_treatment_templates_updated_at
    BEFORE UPDATE ON treatment_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_patient_plans_updated_at'
  ) THEN
    CREATE TRIGGER update_patient_plans_updated_at
    BEFORE UPDATE ON patient_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 14. Refresh the schema cache
NOTIFY pgrst, 'reload schema';