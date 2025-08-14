# Bonaire Makelaars Website

This is the official website for Bonaire Makelaars, a real estate company in Bonaire. The website allows users to search for properties, contact realtors, and manage property listings.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: TailwindCSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Email**: Resend.com
- **Routing**: React Router
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/bonairemakelaars.com.git
   cd bonairemakelaars.com
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure environment variables
   - Copy the `.env.example` file to `.env`
   - Fill in the required values, especially the Supabase URL and anon key

   ```bash
   cp .env.example .env
   ```

4. Initialize the database (first-time setup)

   ```bash
   npm run init-db
   ```

5. Start the development server

   ```bash
   npm run dev
   ```

### Admin Access

The admin account email is `s.admin@bonairemakelaars.com`. When you sign in with this account, you'll automatically be given administrator access and redirected to the admin dashboard.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run diagnose` - Run diagnostics to check environment setup
- `npm run init-db` - Initialize database schema (only needed for first-time setup)

## Project Structure

- `/public` - Static assets
- `/src` - Source code
  - `/api` - API and webhook handlers
  - `/components` - Reusable React components
  - `/config` - Application configuration
  - `/contexts` - React context providers
  - `/data` - Static data used in the application
  - `/hooks` - Custom React hooks
  - `/pages` - Page components
  - `/routes` - Routing configuration
  - `/scripts` - Utility scripts
  - `/services` - Service classes
  - `/types` - TypeScript type definitions
  - `/utils` - Utility functions
- `/supabase` - Database migrations and SQL files

## Features

- **Property Search**: Users can search for properties by location, price, and other criteria
- **User Authentication**: Login, registration, and password reset
- **Role-Based Access**: Different dashboards for users, realtors, property owners, businesses, and administrators
- **Property Management**: Realtors and admins can add, edit, and remove properties
- **Content Management**: Admins can edit website content
- **User Management**: Admins can manage user accounts and roles
- **Email Notifications**: Automated emails for account actions and inquiries
- **Webhooks**: Integration with external systems

## Troubleshooting

If you encounter issues:

1. Check your environment variables in `.env` file
2. Run diagnostics with `npm run diagnose`
3. Ensure Supabase is properly configured
4. Check the console for detailed error messages
5. See `TROUBLESHOOTING.md` for common issues and solutions

### Fixing Supabase Profile Policies

If you encounter the error `infinite recursion detected in policy for relation "profiles"`, you need to fix the Supabase database policies:

1. **Option 1**: Run our fix script (requires proper permissions)

   ```bash
   npm run fix-policies
   ```

2. **Option 2**: Apply the SQL fix manually in Supabase
   - Log into your [Supabase Dashboard](https://app.supabase.io)
   - Go to the SQL Editor
   - Open and run the `supabase/quickFix.sql` script
   - This will create simplified policies that should resolve the recursion issue

3. **Option 3**: Temporary application workaround
   - The application includes error handling that should still allow the admin user
     (`s.admin@bonairemakelaars.com`) to access the admin dashboard even when policies are broken

## License

All rights reserved. This codebase is proprietary and confidential.

## Contact

For support or questions, contact the project maintainer at [support@bonairemakelaars.com](mailto:support@bonairemakelaars.com)
