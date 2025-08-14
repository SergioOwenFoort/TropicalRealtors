# How to Get Your Supabase Service Key

## Steps to Get Service Key from Supabase Dashboard:

1. **Go to your Supabase Dashboard**
   - Visit https://app.supabase.com/
   - Select your project: `imhtjggudeidvmpgwjho`

2. **Navigate to Settings > API**
   - Click on "Settings" in the left sidebar
   - Click on "API" 

3. **Find the Service Role Key**
   - Look for "service_role" in the API keys section
   - This key has elevated permissions and can bypass RLS
   - Copy this key (it starts with `eyJ...`)

4. **Update Your .env File**
   - Replace the `VITE_SUPABASE_SERVICE_KEY` value in your `.env` file
   - Use the service_role key you just copied

## Example .env Configuration:

```bash
# Production Supabase Cloud Database
VITE_SUPABASE_URL=https://imhtjggudeidvmpgwjho.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0OTc5NDIsImV4cCI6MjA2NDA3Mzk0Mn0.ArTpMCR1hUP0P0EwQCCfjogswFvEbWZMXxidjNBwyIQ

# Replace this with your actual service_role key from Supabase Dashboard
VITE_SUPABASE_SERVICE_KEY=YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE
```

## Security Note:
⚠️ **IMPORTANT**: The service role key has elevated permissions and should be kept secure:
- Never commit it to version control
- Only use it in server-side code or secure environments
- It bypasses Row Level Security (RLS) policies

## After Updating:
Once you've updated the `.env` file with the correct service key, run the test again:

```bash
node scripts/testServiceKeyConnection.js
```
