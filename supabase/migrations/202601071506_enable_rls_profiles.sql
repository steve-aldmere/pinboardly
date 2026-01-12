-- Enable RLS on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Profiles: user can select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: user can insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: user can update own" ON public.profiles;

-- Policy: Users can SELECT their own profile
CREATE POLICY "Profiles: user can select own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can INSERT their own profile
CREATE POLICY "Profiles: user can insert own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can UPDATE their own profile
CREATE POLICY "Profiles: user can update own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
