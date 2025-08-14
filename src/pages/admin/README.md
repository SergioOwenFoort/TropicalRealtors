# Admin Dashboard Documentation

## Overview

The Admin Dashboard provides comprehensive tools for managing the Bonaire Makelaars website. The dashboard is accessible only to users with admin privileges and includes the following features:

1. **Property Management** - View, edit, delete, and feature properties
2. **User Management** - View basic user information
3. **Profile Management** - Advanced search and edit functionality for all user profiles
4. **Content Editor** - Edit content on any page of the website
5. **Tools & Imports** - CSV uploads, single listing uploads, and webhook testing

## Admin Account

The admin dashboard is only accessible to users with the role 'admin' in their profiles. The default admin account is:

- Email: `s.admin@bonairemakelaars.com`
- Password: `Admin@BonaireMakelaars2025!`

This account is automatically configured with admin privileges. When this account logs in, the system checks if:

1. The user has a profile with the 'admin' role
2. If not, it creates or updates the profile to have the admin role

Access protection is implemented at multiple levels:

- Route-level protection with `AuthGuard requireAdmin` in `routes/index.tsx`
- Component-level protection in `AdminDashboard.tsx` with redirect for non-admins
- Database-level protection with Row Level Security policies requiring admin role

## Setup Requirements

### Database Tables and Functions

Before using the Admin Dashboard, ensure the following SQL migrations have been applied:

1. `supabase/page_content.sql` - Creates tables for content management
2. `supabase/admin_profile_functions.sql` - Adds admin-specific database functions

Run these SQL files in your Supabase SQL Editor or through migration scripts.

### Profile Schema

The profile search functionality expects profiles to have the following structure:

```typescript
interface Profile {
  id: string;  // This is both the profile ID and the user ID from auth.users
  email: string;
  display_name: string;
  role: 'admin' | 'realtor' | 'user' | 'owner';
  // Optional fields
  avatar_url?: string;
  phone?: string;
  address?: string;
  company?: string;
}
```

### Content Management

The Content Editor works with a database table called `page_content` that stores editable content for each page. Each content entry has:

- `page_path`: The URL path of the page
- `content_key`: A unique identifier for the content block
- `content`: The actual content (text or HTML)

## Features

### Profile Search and Edit

- Search profiles by name, email, role, or company
- Edit profile details including display name, role, contact information
- Visualize user roles with color-coded badges

### Content Editor

- Select any page to edit from dropdown or enter custom path
- Edit multiple content blocks per page
- HTML preview for rich content
- Timestamp tracking of content updates

### CSV and Single Listing Upload

- Upload property data via CSV or individual listings
- Data validation and deduplication
- Error reporting and success confirmation

## Security

All admin features are protected by Row Level Security (RLS) in Supabase, ensuring only users with the `admin` role can access these functions.

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Ensure database migrations have been applied correctly
3. Verify that your user account has the `admin` role in the profiles table
