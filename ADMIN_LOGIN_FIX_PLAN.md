# Admin Login Fix Plan

After analyzing your code and database setup, here's why you can authenticate but can't log in:

## Key Issues Identified:

1. **Password Mismatch:**
   - SQL script sets password to: `SuperSecure2025!`
   - Frontend code expects: `Admin@BonaireMakelaars2025!`

2. **Missing Database Function:**
   - Your code calls `supabase.rpc('verify_admin_policies')` which likely doesn't exist
   - This function is called during the admin verification process

3. **Potential Profile Mismatch:**
   - Admin authentication works (JWT is generated)
   - But the profiles table might not have a matching record with the admin role

## Fix Steps:

### Step 1: Run the Post-Authentication Diagnosis
Run the `post_auth_diagnosis.sql` script in Supabase SQL Editor to fix database-side issues.

### Step 2: Create the Missing RPC Function
Run this SQL in the Supabase SQL Editor:

```sql
-- Create the verify_admin_policies function that's called by your frontend
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
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.verify_admin_policies() TO authenticated, anon, service_role;
```

### Step 3: Fix the Password Mismatch
You have two options:

**Option A: Update SQL password to match frontend**
Run this SQL:
```sql
UPDATE auth.users 
SET encrypted_password = crypt('Admin@BonaireMakelaars2025!', gen_salt('bf'))
WHERE email = 's.admin@bonairemakelaars.com';
```

**Option B: Update frontend code to match SQL password**
Update this in your `useSupabaseAuthActions.ts` file:
```typescript
const ADMIN_PASSWORD = 'SuperSecure2025!';
```

### Step 4: Test Login Again
After applying these fixes, try logging in again as the admin.

## Preventing Future Issues:

1. **Avoid hardcoding credentials** in your frontend code
2. **Test database functions** before deployment 
3. **Set up proper error logging** for authentication issues
4. **Document your admin password** securely
