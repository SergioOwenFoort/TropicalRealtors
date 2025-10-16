# Quick Deployment Commands

# ============================================
# STEP 1: Run Database Migrations (IMPORTANT!)
# ============================================
# Before deploying, run these in Supabase SQL Editor:

# 1. Add phone_number to vacation_properties
# Copy and run: add_phone_number_to_vacation_properties.sql

# 2. Add phone_number to properties
# Copy and run: add_phone_number_to_properties.sql

# 3. Add coordinates to vacation_properties
# Run this SQL:
ALTER TABLE vacation_properties 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

# ============================================
# STEP 2: Merge Feature Branch to Main
# ============================================

# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge feature branch
git merge feature/phone-geocoding-map-integration

# Push to GitHub (this triggers Netlify deployment)
git push origin main

# ============================================
# STEP 3: Monitor Netlify Deployment
# ============================================

# Go to: https://app.netlify.com
# Select your TropicalRealtors site
# Click "Deploys" tab
# Watch the build progress
# Check build logs for any errors
# Build should complete in 2-5 minutes

# ============================================
# STEP 4: Test Production Site
# ============================================

# After successful deployment, test:
# - Phone number fields in property forms
# - Interactive map on Vakantie page
# - Geocoding button in single uploader
# - CSV upload with automatic geocoding
# - Owner dashboard "Mijn Listings" text
# - All responsive layouts

# ============================================
# ALTERNATIVE: Deploy without merging (Preview)
# ============================================

# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the project
npm run build

# Deploy to preview (test environment)
netlify deploy --dir=dist

# If everything looks good, deploy to production
netlify deploy --prod --dir=dist

# ============================================
# ROLLBACK (if needed)
# ============================================

# Option 1: Via Netlify Dashboard
# Go to Deploys → Previous Deploy → "..." → Publish deploy

# Option 2: Via Git
# git revert -m 1 HEAD
# git push origin main

# ============================================
# SUCCESS! 🎉
# ============================================

# Your site should now have:
# ✅ Phone number fields
# ✅ Interactive vacation map
# ✅ Automatic geocoding
# ✅ Updated owner dashboard text
