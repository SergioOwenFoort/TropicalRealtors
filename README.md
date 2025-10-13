# TropicalRealtors.com 🏝️

The ultimate Caribbean real estate platform featuring properties across all Caribbean islands including Aruba, Bonaire, Curaçao, Sint Maarten, Saba, and Sint Eustatius. Now featuring a comprehensive vacation rental booking system!

## ✨ Features

- **Property Search & Listings** - Advanced search across all Caribbean islands
- **🏖️ NEW: Vacation Booking Platform** - Modern hotel/resort booking system inspired by Trivago/Booking.com
- **Multi-Island Support** - Seamless navigation between different Caribbean islands  
- **Realtor Management** - Complete realtor dashboard and property management
- **User Authentication** - Secure user accounts and profiles
- **Responsive Design** - Mobile-first approach with modern UI/UX

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

## 🚀 Deployment

### Deploy to Netlify

#### Option 1: Automatic Deployment via GitHub Actions
1. **Push to GitHub**: All pushes to `main` branch automatically deploy to production
2. **Pull Requests**: Automatically create preview deployments for testing

#### Option 2: Manual Netlify Deployment
```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Build and deploy to production
npm run deploy:netlify

# Or deploy a preview/staging version
npm run deploy:netlify:preview
```

#### Option 3: Connect GitHub to Netlify Dashboard
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### Deploy to GitHub Pages
```bash
# Deploy to GitHub Pages
npm run deploy
```

### Environment Variables
Make sure to set these environment variables in your deployment platform:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key
```

#### For Netlify:
- Go to Site Settings → Environment Variables
- Add each variable above

#### For GitHub Actions:
- Go to repository Settings → Secrets and Variables → Actions
- Add `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets

## 📱 New Vacation Booking Feature

The latest update includes a comprehensive vacation rental booking system:

- **Modern Search Interface** - Destination autocomplete, date pickers, guest selection
- **Advanced Filters** - Price ranges, star ratings, amenities, distance from center
- **Property Cards** - Image carousels, ratings, detailed amenities, instant booking
- **Responsive Design** - Mobile-optimized with collapsible filters
- **Caribbean Focus** - Properties across all Caribbean islands

Access the vacation booking at `/vakantie` or through the main navigation menu.

## License

All rights reserved. This codebase is proprietary and confidential.

## Contact

For support or questions, contact the project maintainer at [support@tropicalrealtors.com](mailto:support@tropicalrealtors.com)
