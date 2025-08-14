# Detailed Supabase Admin Reset Guide

## Check Connection to Supabase

First, let's make sure your application is connecting to the right Supabase instance:

1. Open your `.env` file in the project and check the `VITE_SUPABASE_URL` value
2. Ensure it matches your actual Supabase project URL (e.g., `https://imhtjggudeidvmpgwjho.supabase.co`)
3. Double-check the `VITE_SUPABASE_ANON_KEY` is correct as well

## Reset Admin Password in Supabase Dashboard

### 1. Access Your Supabase Project

1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Log in to your Supabase account
3. Select the project you're using for Bonaire Makelaars

### 2. Access Authentication Section

1. In the left sidebar, click on **Authentication**
2. Then click on **Users** to see the list of users

### 3. Reset Admin Password (Updated Method)

1. Find the user with email `s.admin@bonairemakelaars.com` in the list
2. Click on the user's row to open their details panel
3. In the user details panel, you'll see a section for password
4. Click on **Reset Password**
5. You'll have options to:
   - **Send password recovery email**
   - **Generate new password** (or manually set a password)

6. If using "Generate new password":
   - Enter `SuperSecure2025!` as the new password
   - Click "Reset Password" or "Update"

7. If the options look different or you don't see these exact buttons:
   - Look for any button or option related to password management
   - You might see "Actions" or a gear icon instead of three dots

### 4. Alternative: Use Password Reset Email

If you have access to the s.admin@bonairemakelaars.com email:

1. Click "Send password recovery email"
2. Check the email inbox
3. Click the password reset link
4. Set the password to `SuperSecure2025!`

## If You Can't Find the Admin User

If you don't see the admin user in the list:

1. Click **New User** or **+ User** button at the top
2. Enter:
   - Email: `s.admin@bonairemakelaars.com`
   - Password: `SuperSecure2025!`
3. Click "Create User" or equivalent

## Fix Database Access Using the API

Since direct SQL modifications of the auth schema aren't allowed, let's create a small script that uses the Supabase API to help diagnose and fix the issues:

```javascript
// Save this as fix-admin-api.js
import { createClient } from '@supabase/supabase-js';

// Supabase connection (get these values from your .env file)
const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0OTc5NDIsImV4cCI6MjA2NDA3Mzk0Mn0.ArTpMCR1hUP0P0EwQCCfjogswFvEbWZMXxidjNBwyIQ';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check DB connection and fix profiles
async function fixAdminProfile() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection by getting profiles count
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('count');
    
    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError.message);
    } else {
      console.log('✅ Successfully connected to Supabase and accessed profiles table');
    }
    
    // Try to sign in as admin
    console.log('\n🔑 Testing admin login API directly...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 's.admin@bonairemakelaars.com',
      password: 'SuperSecure2025!'
    });
    
    if (signInError) {
      console.error('❌ Admin login failed:', signInError.message);
      
      if (signInError.message.includes('Email not confirmed')) {
        console.log('⚠️ Admin email not confirmed. Use the Supabase Dashboard to confirm the email.');
      } else if (signInError.message.includes('Invalid login credentials')) {
        console.log('⚠️ Wrong password or user doesn\'t exist. Reset the password in Supabase Dashboard.');
      } else if (signInError.message.includes('Database error')) {
        console.log('⚠️ Database schema error. This requires fixing in the Supabase Dashboard.');
      }
    } else {
      console.log('✅ Successfully logged in as admin!');
      
      // Update admin profile if login successful
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: signInData.user.id,
          email: 's.admin@bonairemakelaars.com',
          role: 'admin',
          display_name: 'Admin User'
        });
        
      if (updateError) {
        console.log('❌ Failed to update admin profile:', updateError.message);
      } else {
        console.log('✅ Admin profile updated successfully!');
      }
    }
    
  } catch (err) {
    console.error('❌ General error:', err.message);
  }
}

// Run the function
fixAdminProfile();
```

## Check Your Application's Login Implementation

The error might be in your application code. Check:

1. Open `src/services/supabaseService.ts` or similar authentication files
2. Look for the login function
3. Make sure it's using `signInWithPassword` correctly:

```typescript
// Example of correct login implementation
async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}
```

## Other Troubleshooting Steps

1. **Try a different browser**: Clear cookies and cache or use a private/incognito window

2. **Check console for detailed errors**: Open browser developer tools (F12) and look for specific errors

3. **Verify database structure**: Make sure your application's database schema matches what your code expects

4. **Reset all Supabase credentials**: Generate new API keys in Supabase Dashboard if needed
