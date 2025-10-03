import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../config/supabase.config';

type DashboardRoute = {
  path: string;
  loading: boolean;
  error: string | null;
};

/**
 * Hook to determine the appropriate dashboard route for a user based on their role
 */
export function useDashboardRoute(): DashboardRoute {
  const { user } = useAuth();
  const [path, setPath] = useState<string>('/user'); // Default path for regular users
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getDashboardRoute() {
      if (!user) {
        setPath('/auth/login');
        setLoading(false);
        return;
      }

      try {
        // Use direct profile checking (more reliable than RPC function)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Determine dashboard based on role
        const role = profile?.role || 'user';
        switch (role) {
          case 'admin':
            setPath('/admin');
            break;
          case 'realtor':
            setPath('/makelaar');
            break;
          case 'business':
            setPath('/business');
            break;
          case 'owner':
            setPath('/owner');
            break;
          default:
            setPath('/user'); // Regular user dashboard
            break;
        }      } catch (err) {
        console.error('Error determining dashboard route:', err);
        
        // Handle policy recursion error specifically
        if (err && typeof err === 'object' && 'code' in err && err.code === '42P17') {
          console.log('Detected policy recursion error, checking email for admin fallback...');
          
          // Special case for admin email
          if (user.email === 's.admin@tropicalrealtors.com') {
            console.log('Admin email detected, redirecting to admin dashboard');
            setPath('/admin');
            setError(null);
          } else {
            setError('Database policy error. Please contact support. (Error: 42P17)');
            setPath('/user'); // Default to user dashboard on error
          }
        } else {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setPath('/user'); // Default to user dashboard on error
        }
      } finally {
        setLoading(false);
      }
    }

    getDashboardRoute();
  }, [user]);

  return { path, loading, error };
}
