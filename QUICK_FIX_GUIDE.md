# 🚨 IMMEDIATE ACTION REQUIRED - Netlify Build Fix

## ✅ What I Just Fixed:

1. **Removed hardcoded API key** from `emailServicePlugin.ts`
2. **Removed `.env.backup`** from git tracking
3. **Updated `.gitignore`** to prevent future leaks
4. **Added Supabase security migrations** (RLS, search_path fixes)
5. **Committed and pushed** all fixes to GitHub

---

## 🔑 YOUR ACTION: Add Environment Variables to Netlify

### Quick Steps:

1. **Go to Netlify**: https://app.netlify.com
2. **Select your site**: TropicalRealtors
3. **Navigate to**: Site settings → Environment variables
4. **Click**: Add a variable
5. **Add each variable below**:

```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key_here
VITE_HCAPTCHA_SECRET_KEY=your_hcaptcha_secret_key_here
VITE_RESEND_API_KEY=your_resend_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_ALLOWED_ORIGIN=https://tropicalrealtors.com
VITE_DOMAIN=tropicalrealtors.com
```

6. **Save** and trigger a new deploy

---

## ⚠️ THEN: Rotate Keys (URGENT)

Your keys were exposed in git history. Rotate them ASAP:

1. **Supabase anon key**: Dashboard → Settings → API → Reset
2. **hCaptcha keys**: Dashboard → Sites → Regenerate
3. **Resend API key**: Delete old, create new
4. **Google Maps key**: Restrict or regenerate

Then update the new keys in Netlify environment variables.

---

## ✅ Result:

- Netlify build will succeed
- No more secrets scanner errors
- Application works with env vars from Netlify

---

**See `SECURITY_FIXES_README.md` for complete details.**
