# Google OAuth Redirect URI Fix

## 🚨 Current Error
```
Fout 400: redirect_uri_mismatch
redirect_uri=https://imhtjggudeidvmpgwjho.supabase.co/auth/v1/callback
```

## 🔧 Solution Steps

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Select your project (or create a new one)

### Step 2: Navigate to OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Find your OAuth 2.0 Client ID or create a new one
3. Click "Edit" on your OAuth client

### Step 3: Add Required Redirect URIs
Add these exact URIs to "Authorized redirect URIs":

**Production:**
```
https://imhtjggudeidvmpgwjho.supabase.co/auth/v1/callback
```

**Development (optional):**
```
http://localhost:5174/auth/callback
http://localhost:3000/auth/callback
```

### Step 4: Save Changes
1. Click "Save" in Google Cloud Console
2. Wait 5-10 minutes for changes to propagate

### Step 5: Test Again
1. Go to http://localhost:5174/auth/inloggen
2. Click "Inloggen met Google"
3. Should now work without redirect URI error

## 📋 Important Notes

- The redirect URI must match EXACTLY (including https://)
- Changes can take up to 10 minutes to take effect
- Your Supabase URL is: `https://imhtjggudeidvmpgwjho.supabase.co`
- The callback path is always: `/auth/v1/callback`

## 🔍 If You Don't Have Google OAuth Set Up Yet

If you haven't created Google OAuth credentials yet:

1. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

2. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "+ Create Credentials"
   - Select "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Name: "Tropical Realtors Website"

3. **Configure Application**:
   - **Authorized JavaScript origins**: `https://imhtjggudeidvmpgwjho.supabase.co`
   - **Authorized redirect URIs**: `https://imhtjggudeidvmpgwjho.supabase.co/auth/v1/callback`

4. **Get Credentials**:
   - Copy the Client ID and Client Secret
   - Add them to your Supabase Dashboard

## 🚀 Next Steps After Fix

Once the redirect URI is configured:
1. ✅ Google login will work
2. ✅ Users can register with Google
3. ✅ Automatic profile creation
4. ✅ Role-based dashboard access
