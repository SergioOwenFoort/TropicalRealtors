# 🚨 CRITICAL SECURITY NOTICE

## Exposed Secrets Detected

The following secrets were found hardcoded in documentation files and have been removed:

### Compromised Keys (ROTATE IMMEDIATELY):

1. **hCaptcha Keys**
   - Site Key: `c10e626e-fbfc-4864-8270-3b3aa1887d30`
   - Secret Key: `ES_be23ad6ec3cf4ffa96f208c5154d9d26`
   - **Action Required**: Generate new keys at https://dashboard.hcaptcha.com/

2. **Google Maps API Key**
   - Key: `AIzaSyCysIysyhWVN68q_fAUhv5XNlij8k64dmc`
   - **Action Required**: 
     - Regenerate at https://console.cloud.google.com/apis/credentials
     - Add domain restrictions immediately

3. **Supabase Anon Key**
   - Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Action Required**: Reset via Supabase dashboard (Settings > API)

4. **Resend API Key**
   - Key: `re_7GxDxqAA_7Z952vTSQm9yALuqrv9R8SPo`
   - **Action Required**: Revoke and regenerate at https://resend.com/api-keys

## Immediate Actions Required

### 1. Rotate All Keys (DO THIS NOW)

```bash
# hCaptcha
1. Go to: https://dashboard.hcaptcha.com/
2. Create new site
3. Update .env with new keys
4. Update Netlify environment variables

# Google Maps
1. Go to: https://console.cloud.google.com/apis/credentials
2. Delete old key
3. Create new key with domain restrictions:
   - tropicalrealtors.com/*
   - *.tropicalrealtors.com/*
4. Update .env and Netlify

# Supabase
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
2. Click "Reset anon key"
3. Update .env and Netlify

# Resend
1. Go to: https://resend.com/api-keys
2. Revoke compromised key
3. Generate new key
4. Update .env and Netlify
```

### 2. Update Git History

These secrets were committed to git. You need to:

```bash
# Option 1: Use git-filter-repo (recommended)
pip install git-filter-repo
git filter-repo --path SECURITY_FIXES_README.md --invert-paths
git filter-repo --path QUICK_FIX_GUIDE.md --invert-paths

# Option 2: Use BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files 'SECURITY_FIXES_README.md'
java -jar bfg.jar --delete-files 'QUICK_FIX_GUIDE.md'
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history)
git push origin --force --all
```

### 3. Check for Exposed Secrets Elsewhere

```bash
# Search for any remaining secrets
cd tropicalrealtors.com
grep -r "c10e626e-fbfc" .
grep -r "ES_be23ad6e" .
grep -r "AIzaSyCysIysyhWVN68q" .
grep -r "re_7GxDxqAA" .
```

### 4. Update .gitignore

Ensure these patterns are in `.gitignore`:

```gitignore
.env
.env.*
!.env.example
*.md.backup
*SECRET*
*secret*
*_KEY*
```

### 5. Scan GitHub for Leaks

If this repo was pushed to GitHub:

1. Enable **GitHub Secret Scanning**
2. Check **Security > Secret scanning alerts**
3. Revoke any detected secrets immediately

## Prevention Checklist

- [ ] All secrets rotated
- [ ] New keys added to `.env` (not committed)
- [ ] New keys added to Netlify environment variables
- [ ] Git history cleaned (optional but recommended)
- [ ] Documentation files cleaned (completed)
- [ ] API keys have domain/IP restrictions
- [ ] Team notified of compromised keys
- [ ] Monitor logs for unauthorized access

## Best Practices Going Forward

1. **Never hardcode secrets** in documentation
2. Use placeholders like `your_key_here`
3. Store secrets only in:
   - `.env` (local, gitignored)
   - Netlify environment variables
   - Password manager
4. Use secret scanning tools:
   - `git-secrets`
   - `truffleHog`
   - GitHub Advanced Security

## Need Help?

Contact your DevOps team or security officer immediately if:
- You suspect unauthorized API usage
- You see unusual charges
- You notice suspicious activity in logs

---

**Created**: November 4, 2025  
**Status**: URGENT - Secrets exposed in git history
