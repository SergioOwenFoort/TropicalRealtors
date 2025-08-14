import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { supabaseAdmin } from '../config/supabaseAdmin';

// Context to provide admin status and correct Supabase client
const SupabaseClientContext = createContext({
  client: supabase,
  isAdmin: false,
  setAdmin: (_: boolean) => {},
});

export const SupabaseClientProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  // Optionally, check localStorage or session for admin status on mount
  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    setIsAdmin(!!adminSession);
  }, []);

  // Provide the correct client based on admin status
  const value = {
    client: isAdmin ? supabaseAdmin : supabase,
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
