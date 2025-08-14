-- Create the verify_admin_policies function
CREATE OR REPLACE FUNCTION public.verify_admin_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  -- Check if RLS is enabled on profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Ensure admin policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p
    JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles'
    AND p.polname ILIKE '%admin%'
  ) THEN
    DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
    CREATE POLICY "Admin full access to profiles" ON public.profiles
      USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
  END IF;

  -- Check if realtors table exists and has RLS enabled
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'realtors'
  ) THEN
    -- Check if RLS is enabled
    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'realtors' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Ensure admin policy exists for realtors
    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_policy p
      JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'realtors'
      AND p.polname ILIKE '%admin%'
    ) THEN
      DROP POLICY IF EXISTS "Admin can manage realtors" ON public.realtors;
      CREATE POLICY "Admin can manage realtors" ON public.realtors
        USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
    END IF;
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.verify_admin_policies() TO authenticated, anon, service_role;
