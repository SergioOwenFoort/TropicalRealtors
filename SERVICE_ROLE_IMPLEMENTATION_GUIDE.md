# Service Role Approach Implementation Guide

This guide explains how to implement the service role approach to fix your authentication issues while maintaining security.

## Overview

The service role approach uses Supabase's built-in role-based security model:

1. Regular users interact with the database using the anon/authenticated roles (limited permissions)
2. Administrative operations use the service role (elevated permissions)
3. Your application code manages when to use each role

## Step 1: Run the Service Role Fix Script

First, run the `service_role_fix.sql` script in the Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query" and paste the contents of `service_role_fix.sql`
4. **IMPORTANT:** Before running, make sure you're using the **service role key**:
   - Look for a dropdown near the top of the SQL Editor
   - Select "service_role" instead of "anon"
5. Run the script and check for any errors

This script will:
- Fix the admin user in auth.users
- Link profiles correctly
- Set up proper RLS policies
- Fix permissions

## Step 2: Update Your Application Code

Now you need to modify your application code to use the service role for admin operations:

### 1. Store Your Service Role Key Securely

Add your service role key to your environment variables (but NEVER in client-side code):

```
# Server-side .env file only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Create Two Supabase Clients

```typescript
// src/services/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Regular client for normal user operations
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Admin client - ONLY USE SERVER-SIDE
// This should only be imported in server-side code
export const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### 3. Create Admin API Endpoints

For admin operations, create server endpoints that use the service role client:

```typescript
// Example server-side admin endpoint
import { adminSupabase } from '../services/supabase';

export async function resetUserPassword(userId: string, newPassword: string) {
  // First verify the requesting user is an admin
  const { data: session } = await adminSupabase.auth.getSession();
  const user = session?.user;
  
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  // Check if user is admin
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    throw new Error('Not authorized');
  }
  
  // Perform admin operation with service role
  return await adminSupabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );
}
```

### 4. Create Admin Routes in Your Frontend

```typescript
// Example admin route handler
import { useState } from 'react';

export function AdminResetPassword() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  
  const handleReset = async () => {
    try {
      // Call your server API that uses the service role
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          password,
        }),
        // Include credentials to send session cookie
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset password');
      }
      
      alert('Password reset successful');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    }
  };
  
  return (
    // Form UI here
  );
}
```

## Step 3: Test Admin Login

After implementing these changes:

1. Try logging in with:
   - Email: s.admin@bonairemakelaars.com
   - Password: SuperSecure2025!

2. If login is successful:
   - Test that admin functions work correctly
   - Verify that regular user permissions are restricted properly

## Security Best Practices

1. **Never expose service role key in client-side code**
2. **Always verify admin role before performing admin operations**
3. **Implement proper error handling and logging**
4. **Use HTTPS for all API requests**
5. **Regularly audit admin actions**

## Troubleshooting

If you still have issues:

1. **Check SQL Script Output**: Look for errors when running the service role fix script
2. **Verify Environment Variables**: Make sure your service role key is correct
3. **Check Network Requests**: Inspect network traffic for auth-related requests
4. **Check Browser Console**: Look for JavaScript errors during login
5. **Examine Server Logs**: Look for errors in your server logs
