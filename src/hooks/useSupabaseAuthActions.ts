import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { supabaseAnon } from '../config/supabaseAnon.config';
import { SupabaseService } from '../services/supabaseService';
import { AuthError } from '@supabase/supabase-js';
import { verifyAdminAccess } from '../utils/verifyAdminAccess';
import { useServiceRoleAdmin } from './useServiceRoleAdmin';
import { sendEmail } from '../utils/emailTemplates';

const supabaseService = SupabaseService.getInstance();
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

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
      
      // For non-admin users, temporarily use service client until anon key is fixed
      // TODO: Fix the anon key and switch back to supabaseAnon
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });

      if (loginError) {
        console.error('Login error:', loginError);
        throw loginError;
      }
      
      if (data.user) {
        // Get or create user profile (use service role for database operations)
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
      // Use anon client for user registration to enable session persistence
      const { data: { user }, error } = await supabaseAnon.auth.signUp({ email, password });
      if (error) throw error;
      setError(null);
      
      if (user) {
        // Use service role for database operations
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
      // Try to get session from anon client first (for regular users)
      let session = null;
      try {
        const { data: { session: anonSession }, error: anonError } = await supabaseAnon.auth.getSession();
        if (!anonError && anonSession) {
          session = anonSession;
        }
      } catch (err) {
        console.log('No anon session found, checking service role session');
      }

      // Fallback to service role client (for admin users)
      if (!session) {
        const { data: { session: serviceSession }, error: serviceError } = await supabase.auth.getSession();
        if (serviceError) throw serviceError;
        session = serviceSession;
      }

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
      
      // Sign out from both clients to ensure complete logout
      const serviceLogout = supabase.auth.signOut({ scope: 'local' });
      const anonLogout = supabaseAnon.auth.signOut({ scope: 'local' });
      
      const [serviceResult, anonResult] = await Promise.all([serviceLogout, anonLogout]);
      
      if (serviceResult.error && anonResult.error) {
        // Only throw if both fail
        throw serviceResult.error || anonResult.error;
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
      
      console.log('Starting password reset for:', email);
      
      // Generate a secure token for password reset
      const token = crypto.randomUUID();
      const resetUrl = `${window.location.origin}/auth/update-password?token=${token}&email=${encodeURIComponent(email)}`;
      
      // Send custom email with direct reset link
      try {
        console.log('Sending custom password reset email...');
        
        // Send email using our integrated email service
        await sendEmail(
          email,
          'passwordReset',
          {
            email: email,
            resetUrl: resetUrl,
            userName: email.split('@')[0], // Use part before @ as name if no real name available
            token: token
          }
        );

        console.log('Custom password reset email sent successfully');
        
        // Token is now stored on the server, no need for localStorage
        setResetSent(true);
        setError(null);
        
      } catch (supabaseError) {
        console.error('Failed to send reset email:', supabaseError);
        const errorMessage = supabaseError instanceof Error ? supabaseError.message : 
          'Er is een probleem opgetreden bij het verzenden van de email. Controleer of het email adres correct is.';
        setError(errorMessage);
      }
      
    } catch (err) {
      console.error('Complete reset password process error:', err);
      setError('Er is een onverwachte fout opgetreden. Probeer het opnieuw.');
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
      
      // Check if this is an admin user using the service role approach
      const adminSession = localStorage.getItem('adminSession');
      
      if (adminSession) {
        // Admin user - use service role to update password
        const { supabaseAdmin } = await import('../config/supabaseAdmin');
        const session = JSON.parse(adminSession);
        
        console.log('Updating admin password via service role...');
        
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          session.userId,
          { password: newPassword }
        );
        
        if (error) {
          console.error('Admin password update failed:', error);
          throw error;
        }
        
        console.log('Admin password updated successfully!');
      } else {
        // Regular user - use normal auth session
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }
      
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
