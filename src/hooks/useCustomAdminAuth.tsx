// Custom Admin Login Implementation
// This bypasses the built-in Supabase auth system completely

import { useState } from 'react';
import { supabase } from '../config/supabase.config';

// Admin credentials - hardcoded for simplicity, consider storing in env variables
const ADMIN_EMAIL = 's.admin@bonairemakelaars.com';
const ADMIN_PASSWORD = 'SuperSecure2025!';

/**
 * Custom hook for admin authentication that bypasses the regular auth system
 * Use this instead of the regular useSupabaseAuthActions
 */
export function useCustomAdminAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminSession, setAdminSession] = useState<any>(null);

  // Initialize - check if there's an existing admin session in localStorage
  useState(() => {
    const storedSession = localStorage.getItem('adminSession');
    if (storedSession) {
      try {
        setAdminSession(JSON.parse(storedSession));
      } catch (err) {
        console.error('Failed to parse stored admin session');
        localStorage.removeItem('adminSession');
      }
    }
  });

  // Handle errors
  const handleError = (err: any) => {
    console.error('Admin auth error:', err);
    if (err instanceof Error) {
      setError(`Error: ${err.message}`);
    } else if (typeof err === 'object' && err !== null) {
      setError(`Error: ${JSON.stringify(err)}`);
    } else {
      setError('An unexpected error occurred');
    }
  };

  // Custom login function using RPC instead of Supabase auth
  const loginAsAdmin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if profiles table is accessible
      const { data: accessCheck, error: accessError } = await supabase.rpc(
        'check_profiles_access'
      );
      
      if (accessError) {
        throw new Error(`Profiles access error: ${accessError.message}`);
      }
      
      if (!accessCheck?.success) {
        throw new Error(`Cannot access profiles: ${accessCheck?.error}`);
      }
      
      // Use our custom login RPC function
      const { data, error } = await supabase.rpc(
        'custom_admin_login',
        { 
          admin_email: ADMIN_EMAIL, 
          admin_password: ADMIN_PASSWORD 
        }
      );
      
      if (error) {
        throw error;
      }
      
      if (!data?.success) {
        throw new Error(data?.message || 'Login failed');
      }
      
      // Store admin session
      const adminSessionData = {
        user: data.admin_profile,
        isAdmin: true,
        loggedInAt: new Date().toISOString()
      };
      
      localStorage.setItem('adminSession', JSON.stringify(adminSessionData));
      setAdminSession(adminSessionData);
      
      return adminSessionData;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logoutAdmin = () => {
    localStorage.removeItem('adminSession');
    setAdminSession(null);
  };
  
  // Check if user is admin
  const isAdmin = !!adminSession?.isAdmin;
  
  // Check if logged in
  const isLoggedIn = !!adminSession;
  
  // Get admin data
  const getAdminData = async () => {
    if (!isAdmin) return null;
    
    try {
      const { data, error } = await supabase.rpc('get_all_profiles');
      if (error) throw error;
      return data;
    } catch (err) {
      handleError(err);
      return null;
    }
  };
  
  return {
    loginAsAdmin,
    logoutAdmin,
    isAdmin,
    isLoggedIn,
    loading,
    error,
    adminSession,
    getAdminData
  };
}
