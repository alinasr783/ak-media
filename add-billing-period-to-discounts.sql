-- Add billing_period column to discounts table
-- This column determines whether the discount applies to monthly, annual, or both subscription types

ALTER TABLE public.discounts 
ADD COLUMN IF NOT EXISTS billing_period text DEFAULT 'both' 
CHECK (billing_period IN ('monthly', 'annual', 'both'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_discounts_billing_period 
ON public.discounts USING btree (billing_period);

-- Update existing discounts to work with both billing periods
UPDATE public.discounts 
SET billing_period = 'both' 
WHERE billing_period IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.discounts.billing_period IS 
'Determines which subscription billing period this discount applies to: monthly, annual, or both';
