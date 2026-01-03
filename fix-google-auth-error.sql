-- Fix Google Signup Error (Database error saving new user)
-- This error happens when a database trigger fails during user creation.
-- Run this script in your Supabase SQL Editor to fix the issue.

-- 1. Drop the problematic trigger causing the error
DROP TRIGGER IF EXISTS create_preferences_on_user_signup ON auth.users;
DROP FUNCTION IF EXISTS create_user_preferences();

-- 2. Ensure the table exists
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_mode TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Re-create the function with "Safe Mode" (SECURITY DEFINER + Error Handling)
-- This ensures that even if the preference creation fails, the user account is still created.
CREATE OR REPLACE FUNCTION public.create_user_preferences()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Try to create preferences
  BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- If it fails, just log it and continue. Do NOT fail the user signup.
    RAISE WARNING 'Failed to create user preferences: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Re-create the trigger
CREATE TRIGGER create_preferences_on_user_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_user_preferences();
