import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { HomePage } from '../pages/HomePage';
import { PropertyPage } from '../pages/PropertyPage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { VakantiePage } from '../pages/VakantiePage';
import { VacationPropertyPage } from '../pages/VacationPropertyPage';
import { MakelaarsPage } from '../pages/MakelaarsWrapper';
import { OverOnsPage } from '../pages/OverOnsPage';
import InfoArubaPage from '../pages/InfoArubaPage';
import InfoBonairePage from '../pages/InfoBonairePage';
import { AuthGuard } from '../components/auth/AuthGuard';
import { DashboardRouter } from '../components/auth/DashboardRouter';
import { UserDashboard } from '../pages/user/UserDashboard';
import { ProfilePage } from '../pages/user/ProfilePage';
import { RealtorDashboard } from '../pages/realtor/RealtorDashboard';
import { PropertyForm } from '../pages/realtor/PropertyForm';
import { RealtorAppointments } from '../pages/realtor/RealtorAppointments';
import { OwnerDashboard } from '../pages/owner/OwnerDashboard';
import { OwnerListingUploader } from '../pages/owner/OwnerListingUploader';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';
import { BusinessDashboard } from '../pages/business/BusinessDashboard';
import { HoroDashboard } from '../pages/horo/HoroDashboard';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { UpdatePasswordPage } from '../pages/auth/UpdatePasswordPage';
import { ForgotPasswordResetPage } from '../pages/auth/ForgotPasswordResetPage';
import App from '../App';
import NotFound from '../pages/NotFound';
import { MasterIslandProvider } from '../contexts/MasterIslandContext';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'registreren',
            element: <RegisterPage />,
          },
          {
            path: 'reset-password',
            element: <ResetPasswordPage />,
          },
          {
            path: 'forgot-password-reset',
            element: <ForgotPasswordResetPage />,
          },
          {
            path: 'update-password',
            element: <UpdatePasswordPage />,
          },
        ],
      },
      {
        path: '',
        element: <MasterIslandProvider><Layout /></MasterIslandProvider>,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'woning/:id',
            element: <PropertyPage />,
          },
          {
            path: 'zoeken',
            element: <SearchResultsPage />,
          },
          {
            path: 'vakantie',
            element: <VakantiePage />,
          },
          {
            path: 'vakantie/:id',
            element: <VacationPropertyPage />,
          },
          {
            path: 'makelaars',
            element: <MakelaarsPage />,
          },
          {
            path: 'over-ons',
            element: <OverOnsPage />,
          },
          {
            path: 'info-aruba',
            element: <InfoArubaPage />,
          },
          {
            path: 'info-bonaire',
            element: <InfoBonairePage />,
          },
          {
            path: 'account',
            element: (
              <AuthGuard>
                <DashboardRouter />
              </AuthGuard>
            ),
          },
          {
            path: 'dashboard',
            element: (
              <AuthGuard>
                <DashboardRouter />
              </AuthGuard>
            ),
          },
          {
            path: 'user',
            element: (
              <AuthGuard>
                <UserDashboard />
              </AuthGuard>
            ),
          },
          {
            path: 'profiel',
            element: (
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            ),
          },
          {
            path: 'makelaar',
            element: (
              <AuthGuard requireRealtor>
                <RealtorDashboard />
              </AuthGuard>
            ),
          },
          {
            path: 'makelaar/woning/nieuw',
            element: (
              <AuthGuard requireRealtor>
                <PropertyForm />
              </AuthGuard>
            ),
          },
          {
            path: 'makelaar/woning/:id/bewerken',
            element: (
              <AuthGuard requireRealtor>
                <PropertyForm />
              </AuthGuard>
            ),
          },
          {
            path: 'makelaar/afspraken',
            element: (
              <AuthGuard requireRealtor>
                <RealtorAppointments />
              </AuthGuard>
            ),
          },
          {
            path: 'owner',
            element: (
              <AuthGuard requireOwner>
                <OwnerDashboard />
              </AuthGuard>
            ),
          },
          {
            path: 'owner/woning/nieuw',
            element: (
              <AuthGuard requireOwner>
                <OwnerListingUploader />
              </AuthGuard>
            ),
          },
          {
            path: 'owner/woning/:id/bewerken',
            element: (
              <AuthGuard requireOwner>
                <OwnerListingUploader />
              </AuthGuard>
            ),
          },
          {
            path: 'admin',
            element: (
              <AuthGuard requireAdmin>
                <AdminDashboard />
              </AuthGuard>
            ),
          },
          {
            path: 'admin/woning/:id/bewerken',
            element: (
              <AuthGuard requireAdmin>
                <PropertyForm />
              </AuthGuard>
            ),
          },
          {
            path: 'admin/profiel',
            element: (
              <AuthGuard requireAdmin>
                <AdminProfilePage />
              </AuthGuard>
            ),
          },
          {
            path: 'business',
            element: (
              <AuthGuard requireBusiness>
                <BusinessDashboard />
              </AuthGuard>
            ),
          },
          {
            path: 'business/woning/nieuw',
            element: (
              <AuthGuard requireBusiness>
                <PropertyForm businessMode />
              </AuthGuard>
            ),
          },
          {
            path: 'business/woning/:id/bewerken',
            element: (
              <AuthGuard requireBusiness>
                <PropertyForm businessMode />
              </AuthGuard>
            ),
          },
          {
            path: 'horo',
            element: (
              <AuthGuard requireHoro>
                <HoroDashboard />
              </AuthGuard>
            ),
          },
          {
            path: 'horo/woning/nieuw',
            element: (
              <AuthGuard requireHoro>
                <PropertyForm />
              </AuthGuard>
            ),
          },
          {
            path: 'horo/woning/:id/bewerken',
            element: (
              <AuthGuard requireHoro>
                <PropertyForm />
              </AuthGuard>
            ),
          },

          // Catch-all route for 404s
          {
            path: '*',
            element: <NotFound />,
          },
        ],
      },
    ],
  },
]);
