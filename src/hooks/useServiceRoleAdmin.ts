// useServiceRoleAdmin.ts
// Custom hook for admin authentication using the service role approach

import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
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
      
      // Step 1: use server endpoint to validate credentials with service role
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!resp.ok) {
        const msg = await resp.json().catch(() => ({}));
        setError(msg?.error || 'Invalid credentials');
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }
      const credentialCheck = await resp.json();
      
      // Completely skip the regular auth for admin - this avoids the 500 error entirely
      
      // Step 2: Store admin session info in localStorage
      const adminSession = {
        userId: credentialCheck.userId || credentialCheck.user_id,
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
      // Check if the user is an admin by querying their profile
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role === 'admin') {
          setIsAuthenticated(true);
          return true;
        }
      } catch (err) {
        console.log('Error checking admin role:', err);
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
