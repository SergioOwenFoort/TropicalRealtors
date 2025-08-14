# Role-Based Dashboard Routing Implementation

This document provides an overview of the role-based dashboard routing system implemented for Bonaire Makelaars. The system supports roles including 'admin', 'realtor', 'owner', 'business', and 'user'.

## Overview

The implementation includes:

1. **Database Changes**:
   - Updated `profiles` table to support the 'business' role
   - Added RLS policies for business users
   - Added validation and repair functions for database maintenance

2. **Frontend Components**:
   - Added `useDashboardRoute` hook for dashboard routing
   - Updated `useUserRole` hook to support the 'business' role
   - Added `BusinessGuard` for protecting business-specific routes
   - Enhanced error handling to prevent 500 server errors from crashing the app

3. **Admin Tools**:
   - Added a Database Maintenance UI in the Admin Dashboard
   - Added SQL functions for validating and repairing database issues

## Setup Instructions

### 1. Database Setup

Run the following SQL scripts in order:

1. First, add the business role support:

   ```bash
   # Via Supabase CLI
   supabase db run < supabase/add_business_role.sql
   
   # Or via SQL Editor in Supabase Dashboard
   # Open SQL Editor and run the contents of supabase/add_business_role.sql
   ```

2. Then, add the validation and repair functions:

   ```bash
   # Via Supabase CLI
   supabase db run < supabase/validate_profiles.sql
   
   # Or via SQL Editor in Supabase Dashboard
   # Open SQL Editor and run the contents of supabase/validate_profiles.sql
   ```

### 2. Verify Deployment

After deploying the application, perform these verification steps:

1. Log in as an admin user
2. Go to the Admin Dashboard
3. Navigate to the "Database Beheer" tab
4. Click "Database Valideren" to check for any issues
5. If issues are found, click "Database Repareren" to fix them

## User Roles and Dashboards

Each role has access to a specific dashboard:

- **Admin**: Full access to all features, including database maintenance
- **Realtor**: Can manage properties and view inquiries
- **Owner**: Can view their own properties and manage details
- **Business**: Can manage their business properties (NEW)
- **User**: Basic user dashboard with favorites and inquiries

## Troubleshooting

If you encounter 500 server errors or issues with role-based access:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed guidance
2. Use the Database Maintenance tool in the Admin Dashboard
3. Run the validation SQL functions directly if needed:

   ```sql
   SELECT * FROM validate_profiles();
   SELECT * FROM repair_profiles();
   ```

## Common Issues

### 500 Server Errors

These typically occur when:

- The `profiles` table constraint doesn't allow the 'business' role
- The `favorites` column is missing
- RLS policies are not correctly set up

All of these issues can be fixed with the repair functions or the Admin Dashboard maintenance tool.

### Dashboard Routing Issues

If users can't access the correct dashboard:

- Check browser console for errors
- Verify that the user's role is correctly set in the database
- Check that appropriate guards are applied in the routes

## Development Notes

- The `useUserRole` hook includes enhanced error handling to prevent app crashes
- Database validation and repair functions have been made callable by administrators only
- The Admin Dashboard includes a dedicated tab for database maintenance

## Contributing

When making changes to the role system:

1. Always update both database constraints and RLS policies
2. Update the relevant TypeScript types to include new roles
3. Update route guards to protect role-specific routes
4. Test with users of all roles to ensure correct access

---

For detailed troubleshooting steps, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
