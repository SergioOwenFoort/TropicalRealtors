# Password Reset Email Issues - Resolution Guide

## Current Issues Identified

The password reset functionality is failing due to several issues:

1. **500 Server Errors**: Supabase auth endpoints returning server errors
2. **404 Error on password_reset_tokens**: Custom table doesn't exist in cloud database
3. **SMTP Configuration**: Supabase cloud instance doesn't have SMTP configured

## What I've Fixed

### 1. Simplified Reset Password Function
- ✅ Removed dependency on custom `password_reset_tokens` table
- ✅ Added proper error handling and fallbacks
- ✅ Improved logging for debugging
- ✅ Added conditional Resend email service usage

### 2. Enhanced Error Handling
- ✅ Graceful fallback from custom emails to Supabase built-in
- ✅ Better error messages for users
- ✅ Proper console logging for debugging

## What You Need to Do

### Option 1: Quick Fix - Configure Supabase SMTP (Recommended)

1. **Go to your Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/imhtjggudeidvmpgwjho
   - Go to **Authentication** → **Settings** → **SMTP Settings**

2. **Configure SMTP with Resend**:
   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP User: resend
   SMTP Password: [Your Resend API Key]
   Sender Name: Bonaire Makelaars
   Sender Email: noreply@bonairemakelaars.com
   ```

3. **Enable SMTP**:
   - Toggle "Enable Custom SMTP" to ON
   - Save the configuration

### Option 2: Alternative - Use Direct Resend Integration

1. **Set the environment variable**:
   ```bash
   $env:VITE_RESEND_API_KEY = "re_7GxDxqAA_7Z952vTSQm9yALuqrv9R8SPo"
   ```

2. **Restart your development server**:
   ```bash
   npm run dev
   ```

### Option 3: Database Migration (Optional)

If you want to use the custom token system, run this SQL in your Supabase SQL Editor:

```sql
-- Create table for custom password reset tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON public.password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Add RLS policies
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage password reset tokens"
ON public.password_reset_tokens
FOR ALL
TO service_role
USING (true);
```

## Testing the Fix

1. **Try the password reset**: Go to `/auth/reset-password`
2. **Enter an email address** of an existing user
3. **Check console logs** for detailed error information
4. **Check your email** (or Supabase logs) for the reset email

## Current Implementation Features

- ✅ **Dual email system**: Custom Resend emails with Supabase fallback
- ✅ **Graceful error handling**: Shows user-friendly messages
- ✅ **Security best practices**: No information disclosure about user existence
- ✅ **Comprehensive logging**: Detailed console logs for debugging
- ✅ **Responsive UI**: Clean, professional reset form

## Recommended Next Steps

1. **Configure Supabase SMTP** (Option 1) - This is the quickest fix
2. **Test the functionality** with a real email address
3. **Monitor console logs** for any remaining issues
4. **Optional**: Set up environment variable for Resend integration

The password reset should work immediately after configuring SMTP in your Supabase dashboard.
