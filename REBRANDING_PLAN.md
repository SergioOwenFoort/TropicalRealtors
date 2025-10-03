# Project Rebranding Plan: bonairemakelaars.com → tropicalrealtors.com

## Overview
Complete rebranding from "Bonaire Makelaars" to "Tropical Realtors" including domain, email addresses, and all branding elements.

## Phase 1: Core Configuration Files
1. **package.json** - Update project name
2. **.env & .env.example** - Update domain and email references
3. **supabase/config.toml** - Update project configuration

## Phase 2: Brand Name Updates
1. **Layout Components** - Update "ABCMakelaars" to "TropicalRealtors"
2. **Email Templates** - Update all "Bonaire Makelaars" references
3. **Documentation** - Update all markdown files

## Phase 3: Email Domain Updates
1. **Admin email addresses** - s.admin@bonairemakelaars.com → s.admin@tropicalrealtors.com
2. **Service emails** - noreply@, beheer@, admin@ domains
3. **SQL scripts** - Update all email references

## Phase 4: Geographic Context Updates
### Keep Geographic References
- Bonaire as island name (geographic location)
- Bonaire locations and place names
- Island-specific functionality

### Update Business References
- "Bonaire Makelaars" company name → "Tropical Realtors"
- Domain references: bonairemakelaars.com → tropicalrealtors.com
- Email domains: @bonairemakelaars.com → @tropicalrealtors.com

## Files to Update

### Configuration Files
- package.json
- .env
- .env.example
- supabase/config.toml

### Layout & Branding
- src/components/layout/Header.tsx
- src/components/layout/HeaderWithIslandSelector.tsx
- src/components/layout/IslandLayout.tsx
- src/components/layout/menuBonaire.tsx
- index.html (title)

### Email & Communication
- api/send-reset-email.js
- src/utils/emailTemplates.ts
- src/plugins/emailServicePlugin.ts
- src/plugins/emailServicePlugin-fixed.ts

### Database & Admin
- emergency-admin-reset.sql
- complete-admin-setup.sql
- safe-admin-setup.sql
- supabase/setupAdmin.sql
- supabase/fixProfiles.sql
- All SQL files with email references

### Documentation
- GOOGLE_OAUTH_SETUP.md
- CREATE_GOOGLE_OAUTH_FROM_SCRATCH.md
- GOOGLE_REDIRECT_URI_FIX.md
- virus-scan-backend/README.md

### Component Files
- src/hooks/useDashboardRoute.ts
- src/contexts/MasterIslandContext.tsx
- src/pages/auth/ResetPasswordPage.tsx

## Implementation Order
1. Core configuration (package.json, .env)
2. Layout components (ABCMakelaars → TropicalRealtors)
3. Email system updates
4. Admin system updates
5. SQL script updates
6. Documentation updates

## Notes
- Geographic "Bonaire" references should remain (actual island name)
- Only company/business name "Bonaire Makelaars" becomes "Tropical Realtors"
- Domain changes from bonairemakelaars.com to tropicalrealtors.com
- All email addresses change from @bonairemakelaars.com to @tropicalrealtors.com
