# Finding Database Reset in Supabase Free Plan

## Location 1: Settings → General
1. Go to https://app.supabase.com/
2. Select your project
3. Click **Settings** (gear icon) in left sidebar
4. Click **General**
5. Scroll down to **"Danger Zone"** or **"Project Management"**
6. Look for:
   - "Reset database"
   - "Pause project" 
   - "Delete project"

## Location 2: Settings → Database
1. Settings → **Database**
2. Look for **"Reset"** or **"Restore"** options
3. Sometimes under **"Backups"** section

## Location 3: Project Overview
1. Go to your project's main dashboard
2. Look for **"Actions"** or **"..."** menu
3. Check for reset/pause options

## Location 4: If No Reset Option Visible
On free plan, you might see:
- **"Pause project"** instead of reset
- **"Upgrade to Pro"** messages
- Limited options in danger zone

## Alternative: Create New Project (Free Plan)
If no reset option exists:
1. Create a new Supabase project (free plan allows multiple)
2. Copy your schema setup scripts to new project
3. Update your .env file with new project credentials
4. Delete old project

## Next Steps if Still Can't Find Reset:
- Take screenshot of Settings → General page
- Check if your project is paused/inactive
- Look for "Restore" instead of "Reset"
