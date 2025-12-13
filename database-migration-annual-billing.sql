-- Migration: Add annual billing support to subscriptions table
-- This migration adds billing_period and amount columns to the subscriptions table

-- Add billing_period column with default 'monthly'
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS billing_period TEXT DEFAULT 'monthly' 
CHECK (billing_period IN ('monthly', 'annual'));

-- Add amount column to store the actual payment amount
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2);

-- Update existing subscriptions to have monthly billing period if null
UPDATE subscriptions 
SET billing_period = 'monthly' 
WHERE billing_period IS NULL;

-- Create index on billing_period for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_period ON subscriptions(billing_period);

-- Note: Run this migration on your Supabase database to enable annual billing feature
