-- Run this script in your Supabase SQL Editor to rebuild the table correctly!

-- 1. Hard reset: Drop the old table that is missing the columns
DROP TABLE IF EXISTS public.profiles;

-- 2. Create the exact profiles table required by the application
CREATE TABLE public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  age integer,
  blood_group text,
  height numeric,
  weight numeric,
  emergency_contact text,
  chronic_diseases text[],
  allergies text[],
  current_medications text[],
  updated_at timestamp with time zone,
  
  constraint profiles_age_check check (age > 0)
);

-- 3. Turn on Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Re-apply Permissions
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING ( auth.uid() = id );

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING ( auth.uid() = id );

-- 5. Force Supabase API schema cache to refresh!
NOTIFY pgrst, 'reload schema';
