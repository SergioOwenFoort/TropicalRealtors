# Netlify environment setup for Supabase

To fix blank pages caused by missing Supabase configuration, you must set these environment variables in Netlify and then redeploy.

Required variables (Frontend)

- VITE_SUPABASE_URL = `https://YOUR_PROJECT_ID.supabase.co`
- VITE_SUPABASE_ANON_KEY = YOUR_ANON_KEY

Optional variables (Only if used by features)

- SUPABASE_SERVICE_KEY = SERVICE_ROLE_KEY (server-only; do not prefix with VITE_)
- VITE_ADMIN_EMAIL, VITE_ADMIN_PASSWORD (if using admin helpers)
- VITE_GOOGLE_MAPS_API_KEY, VITE_RESEND_API_KEY, etc.

Where to add in Netlify

1) Site configuration → Build & deploy → Environment variables
2) Add variable → Name = VITE_SUPABASE_URL, Value = your Supabase URL
3) Add variable → Name = VITE_SUPABASE_ANON_KEY, Value = your anon key
4) Save; trigger a new deploy

Notes

- Vite only inlines variables prefixed with VITE_.
- If your repository root contains multiple projects, ensure Netlify "Base directory" is set to `tropicalrealtors.com` and Publish directory is `dist`.
- After changing env vars, do a fresh deploy so Vite rebuilds with the new values.
