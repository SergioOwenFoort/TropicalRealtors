import { Navigate } from 'react-router-dom';
import { useDashboardRoute } from '../../hooks/useDashboardRoute';
import { LoadingSpinner } from '../LoadingSpinner';

/**
 * Component that automatically redirects users to their appropriate dashboard
 * based on their role in the system
 */
export function DashboardRouter() {
  const { path, loading, error } = useDashboardRoute();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Er is een fout opgetreden: {error}</p>
          <p>Probeer het later opnieuw of neem contact op met ondersteuning.</p>
        </div>
      </div>
    );
  }

  // Redirect to the appropriate dashboard
  return <Navigate to={path} replace />;
}
