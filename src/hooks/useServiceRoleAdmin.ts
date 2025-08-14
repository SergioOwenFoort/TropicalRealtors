// useServiceRoleAdmin.ts
// Custom hook for admin authentication using the service role approach

import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { supabaseAdmin } from '../config/supabaseAdmin';

const ADMIN_EMAIL = 's.admin@bonairemakelaars.com';
const SESSION_KEY = 'adminSession';

export const useServiceRoleAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Admin login function using the service role approach
  const adminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Using pure service role approach for admin login');
      
      // Step 1: Use the check_admin_credentials RPC via service role
      const { data: credentialCheck, error: credentialError } = await supabaseAdmin.rpc(
        'check_admin_credentials',
        { admin_email: email, admin_password: password }
      );
      
      console.log('Credential check result:', credentialCheck);
      
      if (credentialError || !credentialCheck?.success) {
        setError(credentialError?.message || credentialCheck?.message || 'Invalid credentials');
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }
      
      // Completely skip the regular auth for admin - this avoids the 500 error entirely
      
      // Step 2: Store admin session info in localStorage
      const adminSession = {
        userId: credentialCheck.user_id,
        email: email,
        isAdmin: true,
        loginTime: new Date().toISOString()
      };
      
      console.log('Creating admin session:', adminSession);
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminSession));
      
      // Step 3: Set global state to authenticated
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // Step 4: Redirect if needed - emit an event that a redirect can listen for
      const adminAuthEvent = new CustomEvent('adminAuthenticated', { 
        detail: { success: true, userId: credentialCheck.user_id } 
      });
      window.dispatchEvent(adminAuthEvent);
      
      return true;
      
    } catch (err: any) {
      console.error('Service role admin login error:', err);
      setError(err.message || 'An unknown error occurred');
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  };
  
  // Check if the user is authenticated as admin
  const checkAdminAuth = async () => {
    // First, try the normal Supabase auth
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // If we have a session, check if the user is an admin
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (!error && profile?.role === 'admin') {
        setIsAuthenticated(true);
        return true;
      }
    }
    
    // Fallback to our localStorage approach
    const adminSession = localStorage.getItem(SESSION_KEY);
    if (adminSession) {
      const parsed = JSON.parse(adminSession);
      
      // Check if the session is valid (e.g., not expired)
      const loginTime = new Date(parsed.loginTime).getTime();
      const now = new Date().getTime();
      const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
      
      // If login was less than 24 hours ago, consider it valid
      if (hoursSinceLogin < 24 && parsed.isAdmin) {
        setIsAuthenticated(true);
        return true;
      } else {
        // Clear expired session
        localStorage.removeItem(SESSION_KEY);
      }
    }
    
    setIsAuthenticated(false);
    return false;
  };
  
  // Initialize: Check authentication on mount
  useEffect(() => {
    checkAdminAuth();
  }, []);
  
  // Admin logout function
  const adminLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    return true;
  };
  
  return {
    adminLogin,
    adminLogout,
    checkAdminAuth,
    isLoading,
    error,
    isAuthenticated
  };
};

export default useServiceRoleAdmin;
