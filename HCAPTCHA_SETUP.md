# hCaptcha Security Setup Guide

## 🔒 Overview

This application now includes **hCaptcha** protection on all vulnerable user input forms to prevent automated attacks, spam, and abuse. hCaptcha is integrated with maximum security settings across the following areas:

### Protected Forms

1. **Registration Page** (`/auth/register`) - Always Required
   - Prevents automated bot account creation
   - Required before any user can register
   
2. **Login Page** (`/auth/login`) - Adaptive/Conditional
   - Shows after 2 failed login attempts (when 3 attempts remaining)
   - Prevents brute force attacks
   - Minimal friction for legitimate users

3. **Password Reset Request** (`/auth/reset-password`) - Always Required
   - Prevents email flooding attacks
   - Required before sending password reset emails

4. **Password Reset Completion** (`/auth/forgot-password-reset`) - Always Required
   - Prevents automated password reset attempts
   - Required when setting new password

5. **Property Contact Forms** - Always Required
   - PropertyContact component (regular properties)
   - VacationPropertyContact component (vacation properties)
   - Prevents spam messages to property owners/agents
   - Uses compact captcha size for better UX in modals

---

## 📋 Prerequisites

- hCaptcha account (free tier available)
- npm package `@hcaptcha/react-hcaptcha` (already installed)
- Access to environment variables configuration

---

## 🚀 Setup Instructions

### Step 1: Create hCaptcha Account

1. Go to [https://www.hcaptcha.com/](https://www.hcaptcha.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Add Your Domain

1. Log in to [hCaptcha Dashboard](https://dashboard.hcaptcha.com/)
2. Navigate to "Sites" section
3. Click "Add Site"
4. Enter your domain information:
   - **Hostname**: Your production domain (e.g., `bonairemakelaars.com`, `tropicalrealtors.com`)
   - **Add localhost**: Enable this for local development testing
5. Click "Save"

### Step 3: Get Your Keys

After adding your site, you'll receive two keys:

1. **Site Key** (Public Key)
   - Used in frontend code
   - Safe to expose in client-side code
   - Example: `10000000-ffff-ffff-ffff-000000000001`

2. **Secret Key** (Private Key)
   - Used for server-side verification
   - **NEVER expose in client-side code**
   - Keep secure in environment variables
   - Example: `0x0000000000000000000000000000000000000000`

### Step 4: Configure Environment Variables

1. Create or update your `.env` file (copy from `.env.example` if needed):

```bash
# Copy example file
cp .env.example .env
```

2. Add your hCaptcha keys to `.env`:

```bash
# hCaptcha Configuration - Required for security
VITE_HCAPTCHA_SITE_KEY=your_actual_site_key_here
VITE_HCAPTCHA_SECRET_KEY=your_actual_secret_key_here
```

3. **Important Security Notes**:
   - Never commit `.env` file to version control
   - Use different keys for development and production
   - Rotate secret keys periodically
   - Secret key should only be used server-side

### Step 5: Configure Production Environment

For production deployment (Netlify, Vercel, etc.):

1. Add environment variables in your hosting platform's dashboard
2. Use the same variable names:
   - `VITE_HCAPTCHA_SITE_KEY`
   - `VITE_HCAPTCHA_SECRET_KEY`
3. Deploy your application

---

## 🧪 Testing

### Local Testing

1. Start your development server:
```bash
npm run dev
```

2. Test each protected form:
   - Visit registration page: `http://localhost:5173/auth/register`
   - Verify captcha appears and works
   - Try submitting without completing captcha (should show error)
   - Complete captcha and submit (should work)

3. Test conditional captcha on login:
   - Visit login page: `http://localhost:5173/auth/login`
   - Enter wrong credentials 2 times
   - Captcha should appear on 3rd attempt
   - Verify captcha is required to proceed

4. Test contact forms:
   - Navigate to any property detail page
   - Click "Stuur bericht" button
   - Verify compact captcha appears in modal
   - Test form submission with and without captcha

### Production Testing

1. Deploy with environment variables configured
2. Test all forms on production domain
3. Verify captcha loads correctly (no console errors)
4. Check that failed captcha attempts show proper error messages

---

## 🛠️ Technical Implementation

### Components Created

#### 1. HCaptchaComponent (`src/components/security/HCaptcha.tsx`)

Reusable wrapper component with the following features:
- Theme support (light/dark)
- Size options (normal/compact/invisible)
- Automatic validation of environment variables
- Event callbacks: onVerify, onExpire, onError

**Usage Example**:
```tsx
import { HCaptchaComponent } from '../components/security/HCaptcha';

const [captchaToken, setCaptchaToken] = useState('');

<HCaptchaComponent
  onVerify={(token) => setCaptchaToken(token)}
  onExpire={() => setCaptchaToken('')}
  size="compact"
/>
```

#### 2. Captcha Verification Utility (`src/utils/captchaVerification.ts`)

Server-side verification functions:

- `verifyCaptchaToken(token, remoteIp?)` - Verifies token with hCaptcha API
- `requireCaptcha(token)` - Simplified boolean verification
- `isCaptchaConfigured()` - Checks if environment variables are set

**Usage Example**:
```tsx
import { requireCaptcha } from '../../utils/captchaVerification';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!captchaToken) {
    toast.error('Voltooi alstublieft de CAPTCHA verificatie');
    return;
  }

  const captchaValid = await requireCaptcha(captchaToken);
  if (!captchaValid) {
    toast.error('CAPTCHA verificatie mislukt. Probeer het opnieuw.');
    setCaptchaToken('');
    return;
  }

  // Proceed with form submission
};
```

### Security Features

1. **Client-Side Validation**
   - Token required before form submission
   - User-friendly Dutch error messages
   - Visual feedback when captcha incomplete

2. **Server-Side Verification**
   - All captcha tokens verified against hCaptcha API
   - Verification URL: `https://hcaptcha.com/siteverify`
   - Response validation and error handling
   - Protection against token replay attacks

3. **Error Handling**
   - Missing sitekey detection
   - Expired token handling
   - Network error recovery
   - Dutch language error messages

---

## 🔐 Security Best Practices

### ✅ Implemented

- ✅ Client-side rate limiting (5 attempts in 15 min, 30 min lockout)
- ✅ Supabase rate limiting (30 sign-in/sign-up per 5 min per IP)
- ✅ hCaptcha on registration (prevents bot signups)
- ✅ hCaptcha on login (adaptive, after failed attempts)
- ✅ hCaptcha on contact forms (prevents spam)
- ✅ hCaptcha on password reset (prevents email flooding)
- ✅ Input sanitization (XSS protection)
- ✅ Password strength validation
- ✅ Server-side captcha verification

### 🔒 Additional Recommendations

1. **Environment Security**
   - Never commit `.env` files
   - Use different keys for dev/staging/production
   - Rotate secret keys every 90 days
   - Monitor hCaptcha dashboard for suspicious activity

2. **Monitoring**
   - Check hCaptcha analytics regularly
   - Monitor failed verification attempts
   - Review Supabase auth logs
   - Set up alerts for unusual patterns

3. **User Experience**
   - Current implementation balances security with UX
   - Login captcha only shows after failures (adaptive)
   - Compact size in modals for better mobile experience
   - Clear Dutch error messages

4. **Future Enhancements**
   - Consider invisible captcha for better UX
   - Add IP-based reputation scoring
   - Implement honeypot fields
   - Add device fingerprinting

---

## 📊 hCaptcha Analytics

Access your hCaptcha dashboard to view:
- Total challenges served
- Pass/fail rates
- Abuse patterns
- Geographic distribution
- Device types

Dashboard URL: [https://dashboard.hcaptcha.com/](https://dashboard.hcaptcha.com/)

---

## 🐛 Troubleshooting

### Issue: Captcha Not Appearing

**Possible Causes**:
1. Environment variables not set correctly
2. Site key invalid or not matching domain
3. Browser blocking third-party scripts

**Solutions**:
1. Verify `.env` file has correct keys
2. Check browser console for errors
3. Verify domain is added in hCaptcha dashboard
4. Disable ad blockers temporarily for testing

### Issue: "Invalid Sitekey" Error

**Solution**:
- Verify `VITE_HCAPTCHA_SITE_KEY` in `.env` matches dashboard
- Ensure no extra spaces or quotes in environment variable
- Restart development server after changing `.env`

### Issue: Captcha Verification Failing

**Possible Causes**:
1. Secret key incorrect
2. Token expired (valid for 2 minutes)
3. Network issues

**Solutions**:
1. Verify `VITE_HCAPTCHA_SECRET_KEY` is correct
2. User needs to complete captcha again
3. Check network connectivity
4. Check hCaptcha service status

### Issue: Captcha in Development vs Production

**Note**: 
- localhost is supported if enabled in hCaptcha dashboard
- Production domain must be added to hCaptcha site settings
- Use different site keys for dev/prod if needed

---

## 📝 Configuration Options

### HCaptcha Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onVerify` | `(token: string) => void` | Required | Called when captcha verified |
| `onExpire` | `() => void` | Required | Called when token expires |
| `onError` | `(error: string) => void` | Optional | Called on error |
| `theme` | `'light' \| 'dark'` | `'light'` | Captcha theme |
| `size` | `'normal' \| 'compact' \| 'invisible'` | `'normal'` | Captcha size |

### Current Implementation

- **Registration**: Normal size, light theme, always required
- **Login**: Normal size, light theme, conditional (after 2 failed attempts)
- **Password Reset Request**: Normal size, light theme, always required
- **Password Reset Completion**: Normal size, light theme, always required
- **Contact Forms**: Compact size, light theme, always required

---

## 🔄 Migration Notes

### Before hCaptcha Implementation

- No captcha protection on forms
- Vulnerable to automated attacks
- Relied only on rate limiting

### After hCaptcha Implementation

- All user input forms protected
- Multi-layer security (captcha + rate limiting)
- Adaptive protection on login
- No breaking changes to existing functionality

### Backward Compatibility

- Application works without captcha keys (shows warning)
- Graceful degradation in development
- No database migrations required
- No API changes

---

## 📞 Support

### hCaptcha Support
- Documentation: [https://docs.hcaptcha.com/](https://docs.hcaptcha.com/)
- Status Page: [https://status.hcaptcha.com/](https://status.hcaptcha.com/)
- Community: [https://community.hcaptcha.com/](https://community.hcaptcha.com/)

### Application Support
- Check console logs for detailed error messages
- Review this documentation
- Contact development team with specific error details

---

## ✅ Checklist

Before deploying to production:

- [ ] hCaptcha account created
- [ ] Production domain added to hCaptcha dashboard
- [ ] Site key and secret key obtained
- [ ] Environment variables configured in `.env`
- [ ] Environment variables added to hosting platform
- [ ] All forms tested locally
- [ ] All forms tested on staging/production
- [ ] Error messages display correctly in Dutch
- [ ] Mobile responsive testing completed
- [ ] Browser compatibility tested (Chrome, Firefox, Safari, Edge)
- [ ] Monitor hCaptcha analytics for first week

---

## 📚 Additional Resources

- [hCaptcha Official Documentation](https://docs.hcaptcha.com/)
- [React hCaptcha Component](https://www.npmjs.com/package/@hcaptcha/react-hcaptcha)
- [hCaptcha Best Practices](https://docs.hcaptcha.com/configuration)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)

---

**Last Updated**: November 2, 2025
**Version**: 1.0.0
**Implementation Status**: ✅ Complete
