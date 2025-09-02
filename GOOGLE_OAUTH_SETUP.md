# Google OAuth Setup Guide for Bonaire Makelaars

## 🎉 Current Status
✅ **Google OAuth is already configured and working in your Supabase project!**

## 📋 What You Have
- ✅ Google OAuth enabled in Supabase
- ✅ Frontend integration complete (LoginPage & RegisterPage)
- ✅ Backend authentication handlers ready
- ✅ Profile creation triggers in place

## 🔧 How It Works

### Frontend Integration
Your app has Google login buttons on both:
- **Login Page**: `/auth/inloggen`
- **Register Page**: `/auth/registreren`

### Authentication Flow
1. User clicks "Inloggen met Google" button
2. Redirected to Google OAuth consent screen
3. After approval, redirected back to your app
4. Supabase automatically creates user in `auth.users`
5. Your trigger automatically creates profile in `profiles` table
6. User is logged in and redirected to appropriate dashboard

### User Management
- Google users will appear in your admin dashboard
- They get the default role of "user"
- You can change their roles using the admin panel

## 🛠️ Optional: Custom Google Project Setup

If you want to use your own Google OAuth application instead of the default Supabase configuration:

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API in "APIs & Services" > "Library"

### Step 2: Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add these **Authorized redirect URIs**:
   ```
   https://imhtjggudeidvmpgwjho.supabase.co/auth/v1/callback
   http://localhost:5174/auth/callback
   ```
5. Note your Client ID and Client Secret

### Step 3: Update Supabase Settings
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Authentication" > "Providers" > "Google"
4. Enter your Google Client ID and Secret
5. Save changes

### Step 4: Update Environment Variables
Replace the placeholder values in your `.env` file:
```env
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
```

## 🧪 Testing Google Login

### Manual Test
1. Start your development server: `npm run dev`
2. Go to `http://localhost:5174/auth/inloggen`
3. Click "Inloggen met Google"
4. Complete Google OAuth flow
5. Check if you appear in admin dashboard

### Automated Test
Run the test script:
```bash
node test-google-auth.js
```

## 🔍 Troubleshooting

### Common Issues

**"Provider not enabled" error:**
- Enable Google provider in Supabase Dashboard
- Check if credentials are properly configured

**"Redirect URI mismatch" error:**
- Verify redirect URIs in Google Cloud Console
- Ensure they match your Supabase auth callback URL

**User created but no profile:**
- Check if profile creation trigger is working
- Run the profile creation fix script if needed

**Google login works but user role is wrong:**
- Default role is "user" for Google signups
- Change role manually in admin dashboard

## 🚀 Next Steps

Your Google authentication is ready! Users can now:
1. ✅ Sign up with Google account
2. ✅ Login with Google account  
3. ✅ Access role-based dashboards
4. ✅ Appear in your admin user management

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify Supabase configuration in dashboard
3. Test with the provided test script
4. Check network requests in browser dev tools

---

**Last Updated**: September 2, 2025  
**Status**: ✅ Fully Functional
