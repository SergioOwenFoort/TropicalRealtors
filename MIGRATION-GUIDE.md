# Migration from Supabase Cloud to Local Docker

## Step 1: Get Your Supabase Cloud Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** > **API**
4. Copy the following:
   - **Project URL** (looks like: https://abcdefghijklmnop.supabase.co)
   - **service_role** key (the secret one, not anon/public)

## Step 2: Update the Migration Script

Edit `migrate-from-cloud.js` and replace:
```javascript
const CLOUD_SUPABASE_URL = 'https://imhtjggudeivmpgwjho.supabase.co'
const CLOUD_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw'
```

With your actual values (based on what I can see from your tokens):
```javascript
const CLOUD_SUPABASE_URL = 'https://imhtjggudeivmpgwjho.supabase.co'
const CLOUD_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw'
```

## Step 3: Run the Migration

```bash
node migrate-from-cloud.js
```

## What This Script Does

1. **Connects to both databases** - Cloud and Local Docker
2. **Exports data** from your cloud tables:
   - profiles
   - realtors  
   - listings
   - carousel_slides
3. **Imports data** into your local Docker instance
4. **Exports users** from auth.users and creates them locally
5. **Sets temporary passwords** for all users (temp123456)

## After Migration

1. **Test the application** with your migrated data
2. **Users need to reset passwords** (they all have temp123456 now)
3. **Admin user** will be available with the email from your cloud instance
4. **All data** will be available locally for development

## Troubleshooting

- If you get permission errors, make sure you're using the **service_role** key (not anon key)
- If tables don't exist, the script will skip them (this is normal)
- Check the console output for any specific errors

## Security Note

- The service_role key has full access to your database
- Don't commit it to version control
- Only use it for migrations and admin tasks
