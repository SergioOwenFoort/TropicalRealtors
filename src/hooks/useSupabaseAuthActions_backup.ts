import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { SupabaseService } from '../services/supabaseService';
import { AuthError } from '@supabase/supabase-js';
import { verifyAdminAccess } from '../utils/verifyAdminAccess';
import { useServiceRoleAdmin } from './useServiceRoleAdmin';

const supabaseService = SupabaseService.getInstance();
const ADMIN_EMAIL = 's.admin@bonairemakelaars.com';
const ADMIN_PASSWORD = 'SuperSecure2025!'; // Updated to match the password set in SQL scripts

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

  // Login as admin with predefined credentials using service role approach
  const loginAsAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Logging in as admin using service role approach...');
      
      // Use the service role admin login instead of supabase.auth.signInWithPassword
      const success = await adminLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
      
      if (!success) {
        throw new Error('Admin login failed with service role approach');
      }
      
      console.log('Admin login successful with service role approach');
      return { user: { email: ADMIN_EMAIL } }; // Return a simplified user object
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const testEmailConfig = async () => {
    try {
      // Check if we can get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth user check failed:', userError);
      }

      // Log auth state
      console.log('Auth configuration test:', {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email,
        timestamp: new Date().toISOString()
      });

      // Check session state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session check failed:', sessionError);
      }      console.log('Session state:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token
      });

      return !userError && !sessionError;
    } catch (err) {
      console.error('Email configuration test failed:', err);
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Test configuration first
      const isConfigValid = await testEmailConfig();
      console.log('Configuration test result:', { isConfigValid });
      
      // Detailed logging for the reset attempt
      console.log('Initiating password reset:', {
        email,
        redirectTo: `${window.location.origin}/auth/update-password`,
        timestamp: new Date().toISOString(),
        location: {
          origin: window.location.origin,
          pathname: window.location.pathname,
          href: window.location.href
        }
      });      // Make the actual reset password call with specific site URL
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`
      });

      if (result.error) {
        // Handle specific SMTP configuration errors
        if (result.error.status === 500) {
          console.error('SMTP Configuration Error:', {
            message: result.error.message,
            status: result.error.status,
            details: result.error,
            hint: 'Check Supabase SMTP settings (smtp.resend.com:465)'
          });
          setError('Unable to send reset email. Please contact support.');
          return;
        }
        
        console.error('Reset password error details:', {
          message: result.error.message,
          status: (result.error as AuthError).status,
          details: result.error
        });
        throw result.error;
      }

      console.log('Password reset email sent successfully:', { 
        email, 
        success: true,
        timestamp: new Date().toISOString()
      });
      
      setResetSent(true);
      setError(null);
      
      // Check if supabase is initialized and log its state
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      // Log Supabase auth state
      const { data: session } = await supabase.auth.getSession();
      console.log('Current auth state:', {
        hasSession: !!session,
        timestamp: new Date().toISOString()
      });

      // Verify email format
      if (!email || !email.includes('@')) {
        throw new Error('Invalid email format');
      }
      
      console.log('Calling Supabase resetPasswordForEmail...');
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.trim(), // Ensure no whitespace
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
          emailRedirectTo: `${window.location.origin}/auth/update-password`, // Add explicit email redirect
        }
      );

      // Log the response
      console.log('Supabase reset password response:', { data, error });

      if (error) {
        console.error('Reset password error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          details: error
        });
        throw error;
      }

      console.log('Password reset email sent successfully to:', email);
      setResetSent(true);
      setError(null);
    } catch (err) {
      console.error('Reset password process error:', err);
      handleError(err);
      // Re-throw the error to be handled by the component
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      console.log('Updating password...');

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Update password error:', error);
        throw error;
      }

      console.log('Password updated successfully');
      setError(null);
    } catch (err) {
      console.error('Update password process error:', err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Starting login process for:', email);

      // Check if this is the admin user
      if (email === ADMIN_EMAIL) {
        console.log('Admin login detected - using pure service role approach');
        // Use the service role admin login for admin user - this bypasses Supabase auth entirely
        const success = await adminLogin(email, password);
        
        if (!success) {
          throw new Error('Admin login failed with service role approach');
        }
        
        console.log('Admin login successful with service role approach');
        setError(null);
        
        // Add a listener for the redirect event - this helps with navigation after login
        window.addEventListener('adminAuthenticated', (e: any) => {
          console.log('Admin authenticated event received, ready for redirect');
        }, { once: true });
        
        return;
      }
      
      // Only for non-admin users, continue with regular auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });

      if (loginError) {
        console.error('Login error:', loginError);
        throw loginError;
      }
      
      if (data.user) {
        // Get user's profile
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
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setError(null); // Clear any previous errors on success
      
      // Create a profile for the new user
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
      setError(null); // Clear any previous errors on success
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Perform the logout
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Only sign out from this session
      });
      if (error) {
        throw error;
      }
      
      setError(null); // Clear any previous errors on success
    } catch (err) {
      console.error('Logout process error:', err);
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
      setError(null); // Clear any previous errors on success
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
      setError(null); // Clear any previous errors on success
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

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        throw new Error('No user is currently logged in');
      }      // Verify the user is an admin
      const isAdmin = await verifyAdminAccess();
      if (!isAdmin) {
        throw new Error('Only administrators can update admin email');
      }

      // Update the user's email
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        console.error('Update email error:', error);
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

  // Run connection test when hook is initialized
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
