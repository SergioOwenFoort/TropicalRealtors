# Admin Configuration Security Guide

## Environment Variables

The admin credentials are now stored in environment variables for security:

- `VITE_ADMIN_EMAIL` - The admin user's email address
- `VITE_ADMIN_PASSWORD` - The admin user's password

## Setup Instructions

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update .env file:**
   - Set `VITE_ADMIN_EMAIL` to your desired admin email
   - Set `VITE_ADMIN_PASSWORD` to a secure password
   - Update other Supabase credentials as needed

3. **Run database setup:**
   - Open Supabase Dashboard > SQL Editor
   - Run `complete-admin-setup.sql`
   - Replace the placeholder email and password in the script with your actual values

4. **Test admin login:**
   - Start the development server: `npm run dev`
   - Navigate to `/auth/login`
   - Use your admin credentials to log in

## Security Notes

- ✅ Admin credentials are stored in environment variables
- ✅ .env file is excluded from version control
- ✅ SQL scripts include placeholders instead of hardcoded values
- ✅ Service role authentication bypasses blocked auth.admin functions

## Files Updated

- `src/hooks/useSupabaseAuthActions.ts` - Uses environment variables for admin email/password
- `src/hooks/useServiceRoleAdmin.ts` - Uses environment variables for admin email
- `.env` - Contains actual admin credentials (not committed)
- `.env.example` - Template with placeholder values
- `complete-admin-setup.sql` - Database setup script with placeholders
- `emergency-admin-reset.sql` - Emergency reset script with placeholders

## Important

Never commit actual credentials to version control. Always use the `.env.example` as a template and update your local `.env` file with real values.
