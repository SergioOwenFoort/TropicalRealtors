import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../config/supabase.config';

// Context to provide admin status and correct Supabase client
const SupabaseClientContext = createContext({
  client: supabase,
  isAdmin: false,
  setAdmin: (_: boolean) => {},
});

export const SupabaseClientProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  // Optionally, check localStorage or session for admin status on mount
  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    setIsAdmin(!!adminSession);
  }, []);

    // Always provide the regular client to avoid bundling service role in the browser
    // Admin-only operations should dynamically import the service client within guarded code paths
    const value = {
      client: supabase,
      isAdmin,
      setAdmin: setIsAdmin,
    };

  return (
    <SupabaseClientContext.Provider value={value}>
      {children}
    </SupabaseClientContext.Provider>
  );
};

export const useSupabaseClient = () => useContext(SupabaseClientContext);
