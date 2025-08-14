# Supabase Email Configuration Debug Guide

## Step 1: Check SMTP Configuration in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: **Settings** → **Auth** → **SMTP Settings**
3. Verify the following settings:

### For Resend SMTP:
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP Username: resend
SMTP Password: re_7GxDxqAA_7Z952vTSQm9yALuqrv9R8SPo (your Resend API key)
Sender Name: Bonaire Makelaars
Sender Email: noreply@bonairemakelaars.com (or any verified domain)
```

## Step 2: Check Email Templates

1. Go to: **Settings** → **Auth** → **Email Templates**
2. Find **"Password Recovery"** template
3. Make sure it's enabled and contains: `{{ .ConfirmationURL }}`

## Step 3: Verify Domain (if using custom domain)

If using bonairemakelaars.com emails:
1. Check Resend dashboard for domain verification
2. Ensure DNS records are properly configured

## Step 4: Test with Gmail/Generic Email

Try with a simple Gmail address first to rule out domain issues.

## Common Issues:

1. **"Unable to process request"** = Usually SMTP not configured
2. **Missing email template** = Templates not set up
3. **Domain verification** = Custom domain not verified
4. **Rate limiting** = Too many requests

Let me know what you find in your Supabase SMTP settings!
