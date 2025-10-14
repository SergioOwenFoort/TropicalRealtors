# Horo Dashboard

## Overview

The Horo Dashboard is a specialized real estate management interface cloned from the Makelaar (Realtor) Dashboard. It provides comprehensive tools for property management, messaging, and analytics specifically tailored for Horo users.

## Features

### Core Functionality
- **Property Management**: View, edit, delete, and manage property listings
- **Property Statistics**: Real-time analytics including total views, property counts, and performance metrics
- **Messaging System**: Integrated communication dashboard for client interactions
- **Profile Management**: User profile editing and management capabilities

### Dashboard Components
- **Property Overview**: Statistics cards showing total views, property counts, and average performance
- **Property Table**: Comprehensive listing of all properties with filtering and status management
- **Add Listing Modal**: Quick property addition interface
- **Carousel Management**: Media and promotional content management

### Property Status Filtering
- All statuses
- Active (Actief)
- Draft (Concept)
- Sold (Verkocht)
- Rented (Verhuurd)
- Withdrawn (Ingetrokken)

## Access Control

### Role Requirements
- Users must have the `horo` role in their profile to access the Horo Dashboard
- Protected by AuthGuard with `requireHoro` flag
- Automatic redirection through DashboardRouter for users with horo role

### Navigation Access
The Horo Dashboard is accessible through:
- **Desktop Menu**: "Horo Dashboard" link in the main navigation (for horo users)
- **Mobile Menu**: "Horo Dashboard" option in the mobile menu
- **Auth Menu**: Purple-themed "Horo Dashboard" button in the authentication modal
- **Direct URL**: `/horo` (protected route)

## Technical Implementation

### File Structure
```
src/pages/horo/
├── HoroDashboard.tsx          # Main dashboard component
```

### Key Components Used
- `RealtorPropertyTable`: Property listing and management
- `RealtorProfile`: Profile management interface
- `SimpleMessagesDashboard`: Communication system
- `CarouselManagement`: Media management
- `ListingUploader`: Property creation modal
- `PropertyViewTracker`: Analytics service

### Routing
- Main route: `/horo` (requires horo role)
- Property creation: `/horo/woning/nieuw` (requires horo role)
- Property editing: `/horo/woning/:id/bewerken` (requires horo role)

## User Interface

### Design Theme
- **Primary Color**: Purple theme (distinguishing from blue realtor theme)
- **Icons**: Building2 icon for navigation consistency
- **Layout**: Responsive design with mobile optimization

### Statistics Cards
- **Total Views**: Purple-themed card showing property view analytics
- **Total Properties**: Green-themed card with property count
- **Active Properties**: Blue-themed card showing active listing count
- **Average Views**: Amber-themed card with performance metrics

## Setup and Configuration

### Database Requirements
1. **Profile Role**: Users need `role = 'horo'` in the profiles table
2. **Test User Creation**: Use `create-horo-test-user.sql` for testing

### Authentication Setup
The system automatically:
- Detects horo role users
- Redirects to `/horo` dashboard
- Shows appropriate navigation links
- Provides role-based access control

## Testing

### Creating Test Users
Use the provided SQL script:
```sql
-- Execute create-horo-test-user.sql in your Supabase SQL editor
-- This creates a test user with email: test.horo@example.com
```

### Manual Testing
1. Create/update a user profile with `role = 'horo'`
2. Login with that user
3. Verify automatic redirection to `/horo`
4. Test all dashboard functionality
5. Verify access restrictions work properly

## Differences from Makelaar Dashboard

### Visual Changes
- **Purple theme** instead of blue for primary actions
- **"Horo Dashboard"** branding instead of "Dashboard"
- **Purple color scheme** for statistics cards and buttons

### Functional Similarities
- Identical property management capabilities
- Same messaging system integration
- Equivalent analytics and reporting
- Same property creation and editing workflows

## Security

### Access Protection
- Route-level protection with AuthGuard
- Role-based access control through useUserRole hook
- Database-level security through Supabase RLS policies

### Error Handling
- Graceful handling of authentication failures
- Proper redirection for unauthorized access
- Loading states during role verification

## Future Enhancements

### Potential Additions
- Horo-specific property types or categories
- Custom analytics for Horo business model
- Specialized messaging templates
- Horo-branded email notifications
- Custom dashboard widgets

### Integration Points
- Can be extended with Horo-specific business logic
- Supports all existing property management workflows
- Compatible with existing authentication and authorization systems