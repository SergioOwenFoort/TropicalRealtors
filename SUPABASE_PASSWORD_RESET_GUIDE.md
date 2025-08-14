# Instructions to Reset Admin Password in Supabase Dashboard

Since direct SQL access to the `auth` schema is restricted in Supabase, you'll need to use the Supabase Dashboard to reset your admin password. Here's how:

## 1. Access the Authentication Section

1. Log into the [Supabase Dashboard](https://app.supabase.com)
2. Select your project "bonairemakelaars" 
3. In the left sidebar, click on "Authentication"

## 2. Reset the Admin Password

### Option A: Using the Users Interface

1. Click on "Users" in the Authentication section
2. Find the user with email `s.admin@bonairemakelaars.com`
3. Click on the three dots (...) next to the user
4. Select "Reset password"
5. You'll be given two options:
   - **Send password recovery email**: This will send a reset link to the user's email
   - **Generate password**: This will create a new password immediately

6. If you choose "Generate password":
   - Set the new password to `SuperSecure2025!`
   - Click "Update password"

### Option B: Creating a New Admin User (if the user doesn't exist)

If you can't find the admin user:

1. Click "Invite user" at the top right
2. Enter the email: `s.admin@bonairemakelaars.com`
3. Choose the "Send email invite" option
4. Click "Invite"
5. Check the email inbox for the invitation
6. Follow the link and set the password to `SuperSecure2025!`

## 3. Update the Admin Profile

After resetting the password, run the following SQL in the SQL Editor to ensure the admin profile is set correctly:

```sql
-- Ensure admin profile exists and has admin role
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

-- Verify the profile was created/updated
SELECT * FROM public.profiles 
WHERE email = 's.admin@bonairemakelaars.com';
```

## 4. Fix Any RLS Issues

Run the `limited_fix.sql` script to fix any Row Level Security issues that might be preventing login.

## If You're Still Getting "Database error querying schema"

This error often indicates issues with authentication functions in your database. Since you can't modify these directly, you may need to:

1. Contact Supabase support with the error details
2. Consider recreating the project if possible
3. Check if your database is on an older version and might need an upgrade
