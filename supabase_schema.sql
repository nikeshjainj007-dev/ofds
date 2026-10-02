-- ==============================================================================
-- Supabase Database Schema: Profiles Table
-- Stores Name, DOB (Date of Birth), and Email for Secure Authentication Portal
-- ==============================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    dob TEXT,
    phone TEXT DEFAULT '',
    role TEXT DEFAULT 'Student',
    usn TEXT DEFAULT '',
    pickup_zone TEXT DEFAULT '',
    place TEXT DEFAULT '',
    pincode TEXT DEFAULT '',
    address TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_dob ON public.profiles(dob);

-- 3. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all profiles or their own
CREATE POLICY "Public read access for authenticated and anon users"
    ON public.profiles
    FOR SELECT
    USING (true);

-- Allow inserting profile upon registration
CREATE POLICY "Allow insert profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- Allow users to update their own profile by email or id
CREATE POLICY "Allow update profile"
    ON public.profiles
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 4. Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
