# SUPABASE AUTH RESET GUIDE

## CRITICAL WARNING
This will DELETE ALL EXISTING USERS and reset the authentication system completely.
Only do this if you're okay with losing all user accounts.

## Steps to Reset Supabase Auth:

### 1. Backup Current Data (Optional)
If you have important user data, export it first:
- Go to your Supabase Dashboard
- Navigate to Database > Tables
- Export any user-related data from public.users or public.profiles

### 2. Reset Auth Schema
**Method A: Via Supabase Dashboard**
1. Go to https://supabase.com/dashboard/projects
2. Select your project: imhtjggudeidvmpgwjho
3. Go to Settings > General
4. Scroll down to "Danger Zone"
5. Click "Reset auth schema" (this will completely reset authentication)

**Method B: Via SQL (Alternative)**
Run this in the SQL Editor (Database > SQL Editor):
```sql
-- WARNING: This will delete ALL users and auth data
DROP SCHEMA IF EXISTS auth CASCADE;
CREATE SCHEMA auth;
-- Then restart your Supabase project
```

### 3. After Reset
1. All users will be deleted
2. Create a new admin user via Supabase Dashboard > Authentication > Users
3. Test login functionality
4. Re-create any necessary user accounts

### 4. Test the Reset
Use the test scripts we created to verify everything works

## Alternative: Create New Supabase Project
If reset doesn't work:
1. Create a new Supabase project
2. Update .env file with new URL and keys
3. Import your property/business data
4. Start fresh with authentication

Would you like me to proceed with the reset, or do you want to create a new project?
