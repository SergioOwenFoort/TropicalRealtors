# Admin Dashboard Features

This branch contains the comprehensive admin dashboard functionality for TropicalRealtors.com.

## Core Features

### 🏢 Property Management
- **Bulk Property Upload**: CSV file upload with validation and error handling
- **Single Property Creation**: Individual property listing creation via modal
- **Property Analytics**: View statistics, trends, and performance metrics
- **Island Visibility Control**: Toggle visibility of different Caribbean islands
- **Property Status Management**: Control property statuses across the platform

### 👥 User Management
- **User Role Administration**: Manage user roles (Admin, Realtor, Owner, User)
- **Realtor Management**: Add, edit, and manage realtor accounts
- **User Account Control**: View and manage all user accounts
- **Profile Management**: Admin profile configuration

### 🎨 Content Management
- **Carousel Management**: Control homepage carousel content and images
- **Content Editor**: Manage website content and descriptions
- **Branding Control**: TropicalRealtors branding management

### 🔧 System Administration
- **Database Maintenance**: Database optimization and maintenance tools
- **Property Analytics**: Comprehensive property performance tracking
- **System Configuration**: Island settings and platform configuration
- **WebhookTest**: Testing and debugging tools

## File Structure

### Main Components
- `src/pages/admin/AdminDashboard.tsx` - Main admin dashboard interface
- `src/pages/admin/UserManagement.tsx` - User management interface
- `src/pages/admin/AdminProfilePage.tsx` - Admin profile management

### Admin Components
- `src/components/admin/CarouselManagement.tsx` - Homepage carousel control
- `src/components/admin/ContentEditor.tsx` - Content management interface
- `src/components/admin/DatabaseMaintenance.tsx` - Database tools
- `src/components/admin/RealtorManagement.tsx` - Realtor account management
- `src/components/admin/UserProperties.tsx` - User property overview

### Property Management
- `src/components/realtor/CsvUploader.tsx` - Bulk property upload functionality
- `src/components/realtor/ListingUploader.tsx` - Single property creation
- `src/components/analytics/PropertyAnalytics.tsx` - Property performance analytics

### Support Files
- `src/hooks/useUserRole.ts` - Role-based access control
- `src/utils/csvParser.ts` - CSV file processing
- `src/utils/excelOrCsvParser.ts` - Excel/CSV file parsing
- `src/utils/dataTransformer.ts` - Data transformation utilities
- `src/utils/csvLogger.ts` - CSV upload logging

## Key Features

### 🔐 Security Features
- Role-based access control (Admin only)
- Secure file upload with virus scanning
- User authentication and authorization
- Protected admin routes

### 📊 Analytics & Reporting
- Property view tracking and statistics
- User engagement metrics
- Performance analytics dashboard
- Export capabilities

### 🌴 Multi-Island Support
- Bonaire, Aruba, Curaçao, Sint Maarten, Saba, Sint Eustatius
- Island-specific property management
- Configurable island visibility
- Region-based analytics

### 📱 Responsive Design
- Mobile-friendly admin interface
- Tablet-optimized layout
- Desktop-first admin tools
- Touch-friendly controls

## Usage

The admin dashboard is accessible only to users with admin role. Features include:

1. **Property Bulk Upload**: Upload CSV files with property data
2. **Individual Property Creation**: Create single properties via modal interface
3. **User Management**: Manage all user accounts and roles
4. **Content Control**: Manage carousel images and website content
5. **System Administration**: Database maintenance and configuration
6. **Analytics**: View comprehensive property and user analytics

## Technologies Used

- React + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- Lucide React (Icons)
- Supabase (Backend)
- React Hot Toast (Notifications)

## Branch Purpose

This branch isolates all admin dashboard functionality for:
- Independent development and testing
- Role-based feature management
- Security-focused development
- Administrative tool enhancement
- System maintenance capabilities
