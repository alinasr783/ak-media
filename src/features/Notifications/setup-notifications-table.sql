-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid not null default gen_random_uuid (),
  type character varying(50) not null,
  title character varying(255) not null,
  message text null,
  clinic_id uuid not null,
  patient_id uuid null,
  appointment_id uuid null,
  is_read boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  related_id character varying(255) null,
  constraint notifications_pkey primary key (id)
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_clinic_id on public.notifications using btree (clinic_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notifications_patient_id on public.notifications using btree (patient_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notifications_appointment_id on public.notifications using btree (appointment_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notifications_is_read on public.notifications using btree (is_read) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at on public.notifications using btree (created_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notifications_type on public.notifications using btree (type) TABLESPACE pg_default;

-- Enable RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only read notifications for their clinic
CREATE POLICY "Users can read clinic notifications"
ON notifications
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.clinic_id = notifications.clinic_id
        AND u.id = auth.uid()
    )
);

-- Users can only update notifications for their clinic
CREATE POLICY "Users can update clinic notifications"
ON notifications
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.clinic_id = notifications.clinic_id
        AND u.id = auth.uid()
    )
);

-- Users can only delete notifications for their clinic
CREATE POLICY "Users can delete clinic notifications"
ON notifications
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.clinic_id = notifications.clinic_id
        AND u.id = auth.uid()
    )
);

-- Grant permissions
GRANT ALL ON TABLE notifications TO authenticated;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample notifications for testing
INSERT INTO notifications (clinic_id, title, message, type, read, appointment_id)
SELECT 
    c.clinic_uuid,
    'حجز جديد',
    'لديك حجز جديد من أحمد محمد في 10:30 صباحاً',
    'appointment',
    false,
    '123e4567-e89b-12d3-a456-426614174000'::uuid
FROM clinics c
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO notifications (clinic_id, title, message, type, read, appointment_id)
SELECT 
    c.clinic_uuid,
    'دفع تم استلامه',
    'تم استلام دفع بقيمة 250 ريال سعودي من خالد عبدالله',
    'payment',
    false,
    '123e4567-e89b-12d3-a456-426614174001'::uuid
FROM clinics c
LIMIT 1
ON CONFLICT DO NOTHING;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';