# Fixing Supabase Auth Permissions

This document explains the "permission denied for schema auth" error and how to resolve it in a secure way.

## Understanding the Issue

The "permission denied for schema auth" error occurs because:

1. The `auth` schema is managed internally by Supabase
2. Regular database roles don't have direct access to modify the auth schema
3. This is intentional for security - protecting the auth system from direct manipulation

When your application's RLS policies use functions like `auth.uid()`, `auth.role()`, or `auth.email()`, they need permission to access the auth schema. If that permission is missing, you'll get the error.

## Solution Approaches

### Option 1: Quick Fix (Implemented in fix_auth_permission_denied.sql)

This approach bypasses the need for auth schema access by:
- Creating policies that don't depend on auth functions
- Creating custom helper functions in the public schema
- Temporarily allowing broader access to enable login

After running the script and verifying login works:
1. Try logging in with your admin account
2. If login works, you can then implement more restrictive policies

### Option 2: Service Role Approach (More Secure)

For a more secure long-term solution:

1. Use the service role key for administrative operations
2. Modify your backend code to handle admin operations with service role
3. Keep RLS policies for regular users

```typescript
// Example of using service role in your code
import { createClient } from '@supabase/supabase-js';

// Regular client for user operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for administrative operations
const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

// Use adminClient for operations that need auth schema access
async function resetUserPassword(userId, newPassword) {
  return await adminClient.auth.admin.updateUserById(userId, { password: newPassword });
}
```

### Option 3: Contact Supabase Support

If this is a hosted Supabase instance and you continue having issues:

1. Contact Supabase support with your project details
2. Explain the "permission denied for schema auth" error
3. Request assistance with permissions or auth schema issues

## Best Practices Moving Forward

1. **Minimize Direct Auth Schema Access**: Design your app to minimize direct access to auth schema
2. **Use Service Role Sparingly**: Only use service role for admin operations that require it
3. **Separate Admin Routes**: Create separate API endpoints for admin operations
4. **Test Policy Changes Carefully**: When modifying RLS policies, test thoroughly

## Troubleshooting After Fix

If you still have issues after running the fix script:

1. Check if your admin profile exists in the public.profiles table
2. Verify the profiles table has the correct structure
3. Ensure your environment variables match your Supabase project
4. Try resetting your password through the Supabase dashboard UI
