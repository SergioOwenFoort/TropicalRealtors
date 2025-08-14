# Troubleshooting Guide for Bonaire Makelaars Application

This document provides a detailed guide for troubleshooting common issues in the Bonaire Makelaars application, including role-based dashboard routing system errors and Supabase 500 server errors.

## Common Issues & Solutions

### Infinite Recursion in Profiles Policies (Error 42P17)

**Error Message:**

```text
infinite recursion detected in policy for relation "profiles"
```

This error occurs when a Row Level Security policy on the `profiles` table creates a circular reference that results in an infinite loop. This is typically caused by a policy that checks itself in a way that creates recursion.

**Solutions:**

1. **Run our policy fix script**:

   ```bash
   npm run fix-policies
   ```

2. **Apply SQL fixes manually**:
   - Log into the [Supabase Dashboard](https://app.supabase.io)
   - Navigate to your project > SQL Editor
   - Open and run the SQL from `supabase/quickFix.sql`

3. **Use admin login workaround**:
   - The application includes fallback logic for admin users
   - Sign in with `s.admin@bonairemakelaars.com` to access the admin dashboard
   - You can then fix policies through the Database Maintenance tab

### 500 Server Errors Related to Profiles Table

These errors typically occur when:

1. The `profiles` table constraint doesn't allow the 'business' role
2. The `favorites` column is missing from the profiles table
3. There's a policy issue preventing access to certain database resources

### Step 1: Run the SQL Validation Script

The first step is to run the validation SQL script to identify any database issues:

1. Open the Supabase SQL Editor
2. Run the following command:

   ```sql
   SELECT * FROM validate_profiles();
   ```
3. Review the results to identify the specific issues

### Step 2: Fix Database Issues

#### Option A: Using the Admin Dashboard

1. Log in as an admin user
2. Go to the Admin Dashboard
3. Navigate to the "Database Beheer" tab
4. Click on "Database Valideren" to check for issues
5. If issues are found, click on "Database Repareren" to automatically fix them

#### Option B: Using SQL

If the Admin UI is not available or not working, you can run the following SQL to fix common issues:

```sql
SELECT * FROM repair_profiles();
```

### Step 3: Verify Specific Components

#### Profiles Role Constraint

To specifically verify the role constraint:

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
AND pg_get_constraintdef(oid) LIKE '%role%';
```

The constraint should include 'business' among the allowed roles.

#### Business Role Policies

To verify business role policies:

```sql
SELECT policyname, tablename, cmd, qual
FROM pg_policies 
WHERE tablename = 'properties' 
AND policyname LIKE '%Business%';
```

#### Favorites Column

To check if the favorites column exists:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'favorites';
```

### Step 4: Manual Fixes

If automated fixes fail, you can manually run the following SQL commands:

#### Fix Role Constraint

```sql
-- Identify constraint name
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
AND pg_get_constraintdef(oid) LIKE '%role%';

-- Drop constraint (replace CONSTRAINT_NAME with the actual name)
ALTER TABLE profiles DROP CONSTRAINT CONSTRAINT_NAME;

-- Add new constraint with business role
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('user', 'realtor', 'owner', 'admin', 'business'));
```

#### Add Favorites Column

```sql
-- Add favorites column if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorites UUID[] DEFAULT ARRAY[]::UUID[];
```

#### Create Business Role Policies

```sql
-- Select policy
CREATE POLICY "Business users can read their own properties" 
ON public.properties 
FOR SELECT 
TO authenticated
USING (
  (auth.uid() = owner_id) AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'business'
  )
);

-- Update policy
CREATE POLICY "Business users can update their own properties" 
ON public.properties 
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = owner_id) AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'business'
  )
);

-- Insert policy
CREATE POLICY "Business users can insert properties" 
ON public.properties 
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'business'
  )
);

-- Delete policy
CREATE POLICY "Business users can delete their own properties" 
ON public.properties 
FOR DELETE
TO authenticated
USING (
  (auth.uid() = owner_id) AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'business'
  )
);
```

## Frontend Troubleshooting

### Dashboard Routing Issues

If users can't access the correct dashboard for their role:

1. Check that `useUserRole` hook is handling the role properly
2. Verify that the `useDashboardRoute` hook is returning the correct route
3. Make sure that appropriate guards (`AuthGuard`, `BusinessGuard`, etc.) are correctly applied in routes
4. Look for console errors that might indicate permission issues

### Error Handling Improvements

The application has been updated to handle 500 errors gracefully:

1. In `useUserRole` hook, we've added better error handling to prevent app crashes
2. In `useFavorites` hook, errors with the favorites column will now be handled gracefully
3. The `DatabaseMaintenance` component provides a UI for fixing these issues

## Advanced Troubleshooting

If problems persist:

1. Check Supabase logs for detailed error messages
2. Verify that RLS policies are correctly set up and active
3. Use browser developer tools to monitor network requests and inspect response errors
4. Ensure the correct version of SQL scripts have been run on all environments

## Need More Help?

If you're still experiencing issues after following these steps:

1. Check the full SQL validation results for more detailed information
2. Create a test business user and verify all permissions
3. Review the React component hierarchy to ensure guards are correctly applied
4. Consider running the full validation and repair SQL script after backing up your data

---

This guide should help resolve most common issues with the role-based dashboard routing system. If problems persist, please reach out to the development team with detailed error logs and the results of the validation queries.
