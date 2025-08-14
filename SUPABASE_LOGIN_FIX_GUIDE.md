# Fixing Supabase Admin Login Issues

This guide provides solutions for resolving the "Database error querying schema" issue that prevents admin login.

## Understanding the Problem

When you see "Database error querying schema" during login, it typically indicates one of these issues:

1. The auth functions in the database (`auth.uid()`, `auth.role()`, `auth.email()`) are broken
2. Row Level Security (RLS) policies are incorrectly configured
3. The admin user's profile in the `public.profiles` table is missing or not linked correctly
4. There are permission issues with the Supabase schema

## Step-by-Step Fix Process

### 1. Run the Comprehensive Fix Script

I've created a comprehensive SQL fix script that addresses all possible causes:

1. Open the Supabase dashboard for your project
2. Go to the SQL Editor
3. Open the `fix_login_comprehensive.sql` script from this project
4. Run the entire script

This script:

- Recreates the core auth functions (`auth.uid()`, `auth.role()`, `auth.email()`)
- Resets the admin password to "SuperSecure2025!"
- Ensures the admin profile exists and is linked correctly
- Fixes all RLS policies on critical tables
- Grants appropriate permissions to all roles

### 2. Run the Auth Diagnostic Tool

After running the SQL fix, run the diagnostic tool to verify the fix:

```bash
npm run diagnose-auth
```

This will:

- Test the connection to Supabase
- Check if auth services are working
- Verify database tables are accessible
- Test admin login with the reset password
- Check if the admin profile exists
- Provide recommendations if issues persist

### 3. Manual Fixes (If Needed)

If the issue persists after running the comprehensive fix, try these manual steps:

#### Reset Admin Password Through Supabase Dashboard

1. Go to Authentication > Users
2. Find the admin user (`s.admin@bonairemakelaars.com`)
3. Click on the three dots (⋮) and select "Reset password"
4. Enter a new password (e.g., "SuperSecure2025!")
5. Check "Send email instructions" if you want to notify the admin

#### Fix Profile Linkage

Make sure the admin profile exists and is correctly linked:

```sql
-- Run in SQL Editor
INSERT INTO public.profiles (id, email, role, display_name)
SELECT 
  id,
  email,
  'admin',
  'Admin User'
FROM auth.users
WHERE email = 's.admin@bonairemakelaars.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', display_name = 'Admin User';
```

#### Fix Row Level Security

Ensure RLS is correctly configured:

```sql
-- Run in SQL Editor
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Basic read policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
```

### 4. Last Resort Options

If all else fails:

#### Contact Supabase Support

Reach out to Supabase support with:

- Your project reference
- Specific error messages
- Steps you've already taken

#### Create a New Project

As a last resort, you may need to:

1. Create a new Supabase project
2. Export data from the current project
3. Import data into the new project
4. Update environment variables to point to the new project

## Prevention Tips

To prevent this issue in the future:

1. Never manually delete or modify core auth functions
2. Always test RLS policies thoroughly before applying them
3. Keep a backup of working SQL scripts
4. Use the Supabase dashboard for user management when possible

## Troubleshooting Checklist

- [ ] Ran the comprehensive fix script
- [ ] Verified admin user exists in auth.users
- [ ] Verified admin profile exists in public.profiles
- [ ] Confirmed RLS policies are correct
- [ ] Checked all auth functions are properly defined
- [ ] Ran the auth diagnostic tool
- [ ] Tried manual password reset
