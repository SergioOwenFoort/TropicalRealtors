# 🔐 Admin Credentials Security Fix

## Date: October 20, 2025

---

## ✅ **CRITICAL SECURITY ISSUE RESOLVED**

### **Problem**: Admin Credentials Exposed in Frontend
**Before**: Admin email and password were stored as `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD` environment variables, which are compiled into the client-side JavaScript and accessible to anyone.

**Risk Level**: 🔴 **CRITICAL** - Complete system compromise possible

**After**: Admin credentials moved to backend-only environment variables, never exposed to client.

---

## 🛡️ **What Changed**

### 1. **Removed Frontend Admin Credentials**
**Files Modified**:
- `src/hooks/useSupabaseAuthActions.ts`
- `src/hooks/useServiceRoleAdmin.ts`
- `.env.example`

**Changes**:
```typescript
// BEFORE (❌ INSECURE):
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

// AFTER (✅ SECURE):
// Admin credentials removed from frontend
// Authentication handled by backend API
```

### 2. **Created Backend API Endpoints**
**Files Created**:
- `api/admin/login.js` - Validates admin credentials server-side
- `api/admin/check.js` - Checks if user is admin without exposing credentials

**Security Features**:
- ✅ Credentials stored in backend environment only
- ✅ No admin info exposed to client
- ✅ Uses Supabase service role for authentication
- ✅ Rate limiting can be added easily
- ✅ Returns minimal information

### 3. **Updated Authentication Flow**
**New Login Process**:
```
User enters email/password
        ↓
Frontend calls /api/admin/check (email only)
        ↓
If admin: Call /api/admin/login (backend validates credentials)
        ↓
Backend checks database with service role
        ↓
Returns session token (stored in localStorage)
        ↓
User authenticated
```

### 4. **Created Environment Configuration**
**Files Created**:
- `.env.backend.example` - Backend environment variable template

**Updated**:
- `.env.example` - Removed VITE_ADMIN_* variables

---

## 📋 **Migration Instructions**

### **For Development**:

1. **Remove old frontend variables from `.env`**:
   ```bash
   # Remove these lines:
   VITE_ADMIN_EMAIL=...
   VITE_ADMIN_PASSWORD=...
   ```

2. **Create `.env.local` for backend variables**:
   ```bash
   # Backend only (NOT committed to Git)
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_EMAIL=admin@tropicalrealtors.com
   ADMIN_PASSWORD=your-secure-password
   ```

3. **Update `.gitignore` to exclude backend env**:
   ```
   .env.local
   .env.backend
   ```

### **For Production (Vercel)**:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add backend variables** (WITHOUT `VITE_` prefix):
   ```
   SUPABASE_URL = your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
   ADMIN_EMAIL = admin@tropicalrealtors.com
   ADMIN_PASSWORD = your-secure-password
   ```

3. **Important**: Mark these as **"Server-side only"** in Vercel settings

4. **Keep frontend variables** (WITH `VITE_` prefix):
   ```
   VITE_SUPABASE_URL = your-supabase-url
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```

### **For Other Hosting Platforms**:

Consult your platform's documentation for setting backend environment variables separately from frontend variables.

---

## 🔒 **Security Improvements**

| Feature | Before | After |
|---------|--------|-------|
| **Admin Email** | ❌ Exposed in frontend | ✅ Backend only |
| **Admin Password** | ❌ Exposed in frontend | ✅ Backend only |
| **Service Role Key** | ⚠️ Mixed usage | ✅ Backend only |
| **Authentication** | ❌ Client-side check | ✅ Server-side validation |
| **Credential Exposure** | 🔴 Critical Risk | ✅ Secure |

---

## 🧪 **Testing the Fix**

### **1. Verify Admin Credentials Removed from Frontend**:

Open browser DevTools → Sources → Search for "ADMIN":
- ✅ Should find NO references to `VITE_ADMIN_EMAIL`
- ✅ Should find NO references to `VITE_ADMIN_PASSWORD`

### **2. Test Admin Login**:

1. Go to login page
2. Enter admin credentials
3. Should see console: "Admin user detected - using service role approach"
4. Should authenticate successfully
5. Check Network tab → Should see POST to `/api/admin/check` and `/api/admin/login`

### **3. Verify Backend API Works**:

```bash
# Test admin check endpoint
curl -X POST http://localhost:3000/api/admin/check \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tropicalrealtors.com"}'

# Expected: {"isAdmin":true}

# Test with non-admin
curl -X POST http://localhost:3000/api/admin/check \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Expected: {"isAdmin":false}
```

---

## ⚠️ **Important Notes**

### **Password Hashing (Production)**:

For production, use bcrypt to hash passwords:

```javascript
// Install bcrypt
npm install bcrypt

// In your backend API
const bcrypt = require('bcrypt');

// Hash password (do this once, store hash in env)
const hash = await bcrypt.hash('your-password', 10);
console.log(hash); // Store this in ADMIN_PASSWORD_HASH

// Verify password in login endpoint
const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
```

### **Deployment Checklist**:

- [ ] Backend environment variables set in hosting platform
- [ ] Old VITE_ADMIN_* variables removed from deployment
- [ ] `.env.local` not committed to Git
- [ ] Backend API endpoints deployed and accessible
- [ ] Admin login tested in production
- [ ] DevTools shows no admin credentials in compiled code

---

## 🚀 **Additional Security Recommendations**

### 1. **Add Rate Limiting to Admin Endpoints**:

```javascript
// api/admin/login.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts'
});

app.use('/api/admin/login', limiter);
```

### 2. **Implement 2FA for Admin**:

- Use TOTP (Time-based One-Time Password)
- Services: Authy, Google Authenticator
- Library: `speakeasy` or `otplib`

### 3. **Add Audit Logging**:

Log all admin login attempts:
```javascript
await supabaseAdmin
  .from('admin_audit_log')
  .insert({
    action: 'login_attempt',
    email: email,
    success: success,
    ip_address: req.headers['x-forwarded-for'],
    timestamp: new Date()
  });
```

### 4. **Rotate Admin Credentials Regularly**:

- Change admin password every 90 days
- Use password manager for strong passwords
- Never reuse passwords

---

## 📞 **Support**

If you encounter any issues with the admin authentication:

1. Check backend environment variables are set correctly
2. Verify API endpoints are deployed
3. Check console for error messages
4. Review browser Network tab for API calls

---

## 📚 **Related Files**

- `api/admin/login.js` - Admin login endpoint
- `api/admin/check.js` - Admin check endpoint
- `src/hooks/useSupabaseAuthActions.ts` - Updated auth hook
- `src/hooks/useServiceRoleAdmin.ts` - Updated admin hook
- `.env.backend.example` - Backend environment template
- `.env.example` - Frontend environment template (cleaned)

---

**Status**: ✅ **CRITICAL SECURITY ISSUE RESOLVED**  
**Verified**: October 20, 2025  
**Risk Level**: Reduced from 🔴 CRITICAL to ✅ SECURE
