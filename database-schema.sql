-- ====================================
-- Tabibi Authentication System - Database Schema
-- ====================================
-- This file contains the SQL schema for the users table
-- Execute these commands in your Supabase SQL Editor
-- ====================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'secretary')),
  clinic_id BIGINT NOT NULL,
  permissions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  booking_price DECIMAL(10, 2) DEFAULT 0.00,
  available_time JSONB,
  online_booking_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add online_booking_enabled column to existing clinics table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clinics' AND column_name = 'online_booking_enabled'
  ) THEN
    ALTER TABLE clinics ADD COLUMN online_booking_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add clinic_id column to patients table (if patients table exists, this will add the column)
-- Note: If the patients table doesn't exist yet, you'll need to create it first
DO $$ 
BEGIN
  -- Add clinic_id column to patients table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE patients ADD COLUMN clinic_id BIGINT;
  END IF;
  
  -- Add age column to patients table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'age'
  ) THEN
    ALTER TABLE patients ADD COLUMN age INTEGER;
  END IF;
END $$;

-- Create index on clinic_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON users(clinic_id);

-- Create index on role for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create index on clinics clinic_id
CREATE INDEX IF NOT EXISTS idx_clinics_clinic_id ON clinics(clinic_id);

-- Create index on patients clinic_id
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);

-- Create index on patients age
CREATE INDEX IF NOT EXISTS idx_patients_age ON patients(age);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  "from" TEXT NOT NULL DEFAULT 'clinic' CHECK ("from" IN ('booking', 'clinic')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add "from" column to existing appointments table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'from'
  ) THEN
    ALTER TABLE appointments ADD COLUMN "from" TEXT NOT NULL DEFAULT 'clinic' CHECK ("from" IN ('booking', 'clinic'));
  END IF;
END $$;

-- Create index on appointments clinic_id
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);

-- Create index on appointments patient_id
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);

-- Create index on appointments date
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);

-- Create index on appointments "from" column
CREATE INDEX IF NOT EXISTS idx_appointments_from ON appointments("from");

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Policy: Allow insert during signup
CREATE POLICY "Allow insert during signup"
ON users
FOR INSERT
WITH CHECK (true);

-- Policy: Doctors can read secretary data from their clinic
CREATE POLICY "Doctors can read secretary data"
ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'doctor'
    AND u.clinic_id = users.clinic_id
  )
);

-- Policy: Secretaries can read doctor data from their clinic
CREATE POLICY "Secretaries can read doctor data"
ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'secretary'
    AND u.clinic_id = users.clinic_id
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinics_updated_at
BEFORE UPDATE ON clinics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Clinics RLS Policies
-- Policy: Doctors can read their clinic via clinic_id
CREATE POLICY "Doctors can read their clinic"
ON clinics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'doctor'
    AND u.clinic_id = clinics.clinic_id
  )
);

-- Policy: Doctors can update their clinic via clinic_id
CREATE POLICY "Doctors can update their clinic"
ON clinics
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'doctor'
    AND u.clinic_id = clinics.clinic_id
  )
);

-- Policy: Allow insert during signup
CREATE POLICY "Allow clinic insert during signup"
ON clinics
FOR INSERT
WITH CHECK (true);

-- Policy: Secretaries can read clinics they belong to
CREATE POLICY "Secretaries can read their clinic"
ON clinics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'secretary'
    AND u.clinic_id = clinics.clinic_id
  )
);

-- Policy: Public can read clinics by clinic_id for booking page
CREATE POLICY "Public can read clinics by clinic_id for booking"
ON clinics
FOR SELECT
USING (true);

-- Patients RLS Policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see patients from their clinic
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

-- Policy: Users can insert patients to their clinic
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

-- Policy: Users can update patients from their clinic
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

-- Policy: Users can delete patients from their clinic
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

-- Appointments RLS Policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read appointments from their clinic
CREATE POLICY "Users can read appointments from their clinic"
ON appointments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = appointments.clinic_id
  )
);

-- Policy: Users can insert appointments to their clinic
CREATE POLICY "Users can insert appointments to their clinic"
ON appointments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = appointments.clinic_id
  )
);

-- Policy: Users can update appointments from their clinic
CREATE POLICY "Users can update appointments from their clinic"
ON appointments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = appointments.clinic_id
  )
);

-- Policy: Users can delete appointments from their clinic
CREATE POLICY "Users can delete appointments from their clinic"
ON appointments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = appointments.clinic_id
  )
);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  diagnosis TEXT NOT NULL,
  notes TEXT,
  medications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on visits clinic_id
CREATE INDEX IF NOT EXISTS idx_visits_clinic_id ON visits(clinic_id);

-- Create index on visits patient_id
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);

-- Create index on visits created_at
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);

-- Add a column to link visits to patient plans
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visits' AND column_name = 'patient_plan_id'
  ) THEN
    ALTER TABLE visits ADD COLUMN patient_plan_id UUID REFERENCES patient_plans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index on visits patient_plan_id
CREATE INDEX IF NOT EXISTS idx_visits_patient_plan_id ON visits(patient_plan_id);

-- Visits RLS Policies
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read visits from their clinic
CREATE POLICY "Users can read visits from their clinic"
ON visits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = visits.clinic_id
  )
);

-- Policy: Users can insert visits to their clinic
CREATE POLICY "Users can insert visits to their clinic"
ON visits
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = visits.clinic_id
  )
);

-- Policy: Users can update visits from their clinic
CREATE POLICY "Users can update visits from their clinic"
ON visits
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = visits.clinic_id
  )
);

-- Policy: Users can delete visits from their clinic
CREATE POLICY "Users can delete visits from their clinic"
ON visits
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = visits.clinic_id
  )
);

-- Create treatments_templates table
CREATE TABLE IF NOT EXISTS treatment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on treatment_templates clinic_id
CREATE INDEX IF NOT EXISTS idx_treatment_templates_clinic_id ON treatment_templates(clinic_id);

-- Treatment Templates RLS Policies
ALTER TABLE treatment_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read treatment templates from their clinic
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

-- Policy: Users can insert treatment templates to their clinic
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

-- Policy: Users can update treatment templates from their clinic
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

-- Policy: Users can delete treatment templates from their clinic
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

-- Create patient_plans table
CREATE TABLE IF NOT EXISTS patient_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES treatment_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on patient_plans clinic_id
CREATE INDEX IF NOT EXISTS idx_patient_plans_clinic_id ON patient_plans(clinic_id);

-- Create index on patient_plans patient_id
CREATE INDEX IF NOT EXISTS idx_patient_plans_patient_id ON patient_plans(patient_id);

-- Patient Plans RLS Policies
ALTER TABLE patient_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read patient plans from their clinic
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

-- Policy: Users can insert patient plans to their clinic
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

-- Policy: Users can update patient plans from their clinic
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

-- Policy: Users can delete patient plans from their clinic
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

-- Create online_bookings table for storing incoming booking requests
CREATE TABLE IF NOT EXISTS online_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on online_bookings clinic_id
CREATE INDEX IF NOT EXISTS idx_online_bookings_clinic_id ON online_bookings(clinic_id);

-- Create index on online_bookings status
CREATE INDEX IF NOT EXISTS idx_online_bookings_status ON online_bookings(status);

-- Online Bookings RLS Policies
ALTER TABLE online_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read online bookings from their clinic
CREATE POLICY "Users can read online bookings from their clinic"
ON online_bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = online_bookings.clinic_id
  )
);

-- Policy: Users can insert online bookings to their clinic
CREATE POLICY "Users can insert online bookings to their clinic"
ON online_bookings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = online_bookings.clinic_id
  )
);

-- Policy: Users can update online bookings from their clinic
CREATE POLICY "Users can update online bookings from their clinic"
ON online_bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = online_bookings.clinic_id
  )
);

-- Policy: Users can delete online bookings from their clinic
CREATE POLICY "Users can delete online bookings from their clinic"
ON online_bookings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = online_bookings.clinic_id
  )
);

-- Create function to automatically create appointments from accepted online bookings
CREATE OR REPLACE FUNCTION create_appointment_from_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    INSERT INTO appointments (
      clinic_id,
      patient_id,
      date,
      notes,
      price,
      "from"
    ) VALUES (
      NEW.clinic_id,
      NULL, -- Will be linked when patient is registered
      NEW.appointment_date,
      COALESCE(NEW.notes, ''),
      0, -- Price will be set when appointment is confirmed
      'booking'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create appointments from accepted online bookings
CREATE TRIGGER create_appointment_after_booking_acceptance
AFTER UPDATE ON online_bookings
FOR EACH ROW
EXECUTE FUNCTION create_appointment_from_booking();

-- Create financial_records table for tracking all financial transactions
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

-- Add a column to link financial records to patient plans
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_records' AND column_name = 'patient_plan_id'
  ) THEN
    ALTER TABLE financial_records ADD COLUMN patient_plan_id UUID REFERENCES patient_plans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index on financial_records clinic_id
CREATE INDEX IF NOT EXISTS idx_financial_records_clinic_id ON financial_records(clinic_id);

-- Create index on financial_records appointment_id
CREATE INDEX IF NOT EXISTS idx_financial_records_appointment_id ON financial_records(appointment_id);

-- Create index on financial_records patient_id
CREATE INDEX IF NOT EXISTS idx_financial_records_patient_id ON financial_records(patient_id);

-- Create index on financial_records recorded_at
CREATE INDEX IF NOT EXISTS idx_financial_records_recorded_at ON financial_records(recorded_at);

-- Create index on financial_records patient_plan_id
CREATE INDEX IF NOT EXISTS idx_financial_records_patient_plan_id ON financial_records(patient_plan_id);

-- Financial Records RLS Policies
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read financial records from their clinic
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

-- Policy: Users can insert financial records to their clinic
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

-- Policy: Users can update financial records from their clinic
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

-- Policy: Users can delete financial records from their clinic
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

-- Create subscriptions table for tracking clinic subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL,
  plan_id UUID REFERENCES plan_pricing(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'annual')),
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on subscriptions clinic_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_clinic_id ON subscriptions(clinic_id);

-- Create index on subscriptions status
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Create index on subscriptions current_period_end
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Subscriptions RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read subscriptions from their clinic
CREATE POLICY "Users can read subscriptions from their clinic"
ON subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = subscriptions.clinic_id
  )
);

-- Policy: Users can insert subscriptions to their clinic
CREATE POLICY "Users can insert subscriptions to their clinic"
ON subscriptions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = subscriptions.clinic_id
  )
);

-- Policy: Users can update subscriptions from their clinic
CREATE POLICY "Users can update subscriptions from their clinic"
ON subscriptions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = subscriptions.clinic_id
  )
);

-- Policy: Users can delete subscriptions from their clinic
CREATE POLICY "Users can delete subscriptions from their clinic"
ON subscriptions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = subscriptions.clinic_id
  )
);

-- Create plan_pricing table for subscription plans
CREATE TABLE IF NOT EXISTS plan_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  popular BOOLEAN DEFAULT false,
  features TEXT[],
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on plan_pricing price
CREATE INDEX IF NOT EXISTS idx_plan_pricing_price ON plan_pricing(price);

-- Plan Pricing RLS Policies
ALTER TABLE plan_pricing ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read plan pricing
CREATE POLICY "Users can read plan pricing"
ON plan_pricing
FOR SELECT
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_plan_pricing_updated_at'
  ) THEN
    CREATE TRIGGER update_plan_pricing_updated_at
    BEFORE UPDATE ON plan_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add missing columns to notifications table if they don't exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS appointment_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS patient_id UUID;

-- Create indexes for the new columns if they don't exist
CREATE INDEX IF NOT EXISTS idx_notifications_appointment_id ON notifications(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON notifications(patient_id);
-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
