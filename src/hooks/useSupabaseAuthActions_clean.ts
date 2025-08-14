import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { SupabaseService } from '../services/supabaseService';
import { AuthError } from '@supabase/supabase-js';
import { verifyAdminAccess } from '../utils/verifyAdminAccess';
import { useServiceRoleAdmin } from './useServiceRoleAdmin';

const supabaseService = SupabaseService.getInstance();
const ADMIN_EMAIL = 's.admin@bonairemakelaars.com';
const ADMIN_PASSWORD = 'SuperSecure2025!';

export function useSupabaseAuthActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const { adminLogin } = useServiceRoleAdmin();

  const handleError = (err: Error | AuthError | unknown) => {
    console.error('Auth error:', err);
    if (err instanceof Error) {
      setError(`Error: ${err.message}`);
    } else if (typeof err === 'object' && err !== null) {
      setError(`Error: ${JSON.stringify(err)}`);
    } else {
      setError('An unexpected error occurred');
    }
  };

  // Login as admin using service role approach
  const loginAsAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Logging in as admin using service role approach...');
      
      const success = await adminLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
      
      if (!success) {
        throw new Error('Admin login failed with service role approach');
      }
      
      console.log('Admin login successful with service role approach');
      return { user: { email: ADMIN_EMAIL } };
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Main login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Starting login process for:', email);

      // Check if this is the admin user
      if (email === ADMIN_EMAIL) {
        console.log('Admin login detected - using service role approach');
        const success = await adminLogin(email, password);
        
        if (!success) {
          throw new Error('Admin login failed with service role approach');
        }
        
        console.log('Admin login successful with service role approach');
        setError(null);
        return;
      }
      
      // For non-admin users, use regular auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });

      if (loginError) {
        console.error('Login error:', loginError);
        throw loginError;
      }
      
      if (data.user) {
        // Get or create user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          console.log('No profile found, creating user profile...');
          const { error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: email,
              display_name: email.split('@')[0]
            });

          if (createError) {
            console.error('Error creating profile:', createError);
            throw createError;
          }
          
          console.log('User profile created');
        }
      }

      setError(null);
    } catch (err) {
      console.error('Login process error:', err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setError(null);
      
      if (user) {
        await supabaseService.updateProfile(user.id, { display_name: email.split('@')[0] });
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { display_name?: string }) => {
    try {
      setLoading(true);
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session?.user) throw new Error('No user logged in');

      await supabaseService.updateProfile(session.user.id, updates);
      setError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear admin session from localStorage
      localStorage.removeItem('adminSession');
      
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) {
        throw error;
      }
      
      setError(null);
    } catch (err) {
      console.error('Logout process error:', err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`
      });

      if (error) {
        throw error;
      }

      setResetSent(true);
      setError(null);
    } catch (err) {
      console.error('Reset password process error:', err);
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      setError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        return false;
      }
      
      console.log('Supabase connection test successful:', { data });
      return true;
    } catch (err) {
      console.error('Supabase connection test error:', err);
      return false;
    }
  };

  const updateAdminEmail = async (newEmail: string) => {
    try {
      setLoading(true);
      console.log('Updating admin email to:', newEmail);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        throw new Error('No user is currently logged in');
      }
      
      const isAdmin = await verifyAdminAccess();
      if (!isAdmin) {
        throw new Error('Only administrators can update admin email');
      }

      const { data, error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        throw error;
      }

      console.log('Admin email updated successfully:', data);
      setError(null);
      return true;
    } catch (err) {
      console.error('Update admin email error:', err);
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return {
    loading,
    error,
    resetSent,
    login,
    register,
    logout,
    loginWithGoogle,
    updateProfile,
    changePassword,
    resetPassword,
    updatePassword,
    updateAdminEmail,
    loginAsAdmin,
  };
}
