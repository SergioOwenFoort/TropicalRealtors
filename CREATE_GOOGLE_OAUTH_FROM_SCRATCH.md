## 🚀 Create Google OAuth Credentials from Scratch

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: "Tropical Realtors" 
4. Click "Create"

### Step 2: Enable Required APIs
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API" → Click "Enable"
3. Search for "People API" → Click "Enable" (optional but recommended)

### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have G Suite)
3. Fill in required information:
   - **App name**: Tropical Realtors
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Save and continue through the steps

### Step 4: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "Tropical Realtors Website"

### Step 5: Configure Authorized URIs
**Authorized JavaScript origins:**
```
https://imhtjggudeidvmpgwjho.supabase.co
http://localhost:5174
```

**Authorized redirect URIs:**
```
https://imhtjggudeidvmpgwjho.supabase.co/auth/v1/callback
http://localhost:5174/auth/callback
```

### Step 6: Save Credentials
1. Click "Create"
2. Copy the **Client ID** and **Client Secret**
3. Keep these safe - you'll need them for Supabase

### Step 7: Configure Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Authentication" → "Providers"
4. Find "Google" and toggle it ON
5. Enter your **Client ID** and **Client Secret**
6. The redirect URL should already be: `https://imhtjggudeidvmpgwjho.supabase.co/auth/v1/callback`
7. Save

### Step 8: Test
1. Wait 10 minutes for changes to propagate
2. Go to http://localhost:5174/auth/inloggen
3. Click "Inloggen met Google"
4. Should work without redirect URI error!
