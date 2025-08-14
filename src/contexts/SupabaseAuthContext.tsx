import { useEffect, useState } from 'react';
import { supabaseAnon } from '../config/supabaseAnon.config';
import { User } from '@supabase/supabase-js';
import { AuthContext } from './auth.context';
import { useSupabaseAuthActions } from '../hooks/useSupabaseAuthActions';

const SESSION_KEY = 'adminSession';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const actions = useSupabaseAuthActions();

  // Function to check for admin session in localStorage
  const checkAdminSession = () => {
    const adminSession = localStorage.getItem(SESSION_KEY);
    if (adminSession) {
      try {
        const parsed = JSON.parse(adminSession);
        
        // Check if the session is valid (not expired)
        const loginTime = new Date(parsed.loginTime).getTime();
        const now = new Date().getTime();
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
        
        // If login was less than 24 hours ago and it's an admin session
        if (hoursSinceLogin < 24 && parsed.isAdmin && parsed.email) {
          // Create a mock user object for admin
          const adminUser: User = {
            id: parsed.userId,
            email: parsed.email,
            // Add required User properties with default values
            aud: 'authenticated',
            role: 'authenticated',
            created_at: parsed.loginTime,
            updated_at: parsed.loginTime,
            // Optional properties
            app_metadata: { role: 'admin' },
            user_metadata: { display_name: 'Admin User' },
            email_confirmed_at: parsed.loginTime,
            last_sign_in_at: parsed.loginTime,
            confirmed_at: parsed.loginTime,
          };
          
          console.log('Admin session found in localStorage, setting user:', adminUser);
          return adminUser;
        } else {
          // Clear expired session
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (err) {
        console.error('Error parsing admin session:', err);
        localStorage.removeItem(SESSION_KEY);
      }
    }
    return null;
  };

  useEffect(() => {
    // Get initial session
    async function initSession() {
      try {
        // First check for admin session in localStorage
        const adminUser = checkAdminSession();
        if (adminUser) {
          setUser(adminUser);
          setLoading(false);
          return;
        }

        // If no admin session, check regular Supabase auth (anon client for session persistence)
        const { data: { session } } = await supabaseAnon.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    }

    initSession();

    // Listen for auth changes (use anon client for regular users)
    const { data: { subscription } } = supabaseAnon.auth.onAuthStateChange((_event, session) => {
      // Only update user if there's no admin session active
      const adminUser = checkAdminSession();
      if (!adminUser) {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for admin authentication events
    const handleAdminAuth = (event: CustomEvent) => {
      console.log('Admin authentication event received:', event.detail);
      // Re-check admin session after authentication
      const adminUser = checkAdminSession();
      if (adminUser) {
        setUser(adminUser);
      }
    };

    // Listen for storage changes (in case admin logs out from another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SESSION_KEY) {
        if (event.newValue) {
          // Admin session added/updated
          const adminUser = checkAdminSession();
          if (adminUser) {
            setUser(adminUser);
          }
        } else {
          // Admin session removed
          // Check if there's a regular Supabase session (use anon client)
          supabaseAnon.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
          });
        }
      }
    };

    // Add event listeners
    window.addEventListener('adminAuthenticated', handleAdminAuth as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('adminAuthenticated', handleAdminAuth as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  return (
    <AuthContext.Provider value={{ user, loading, error, actions }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
