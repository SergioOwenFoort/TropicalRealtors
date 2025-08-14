// supabaseAdmin.ts
// Service role client for admin operations
// This bypasses RLS and auth schema issues

import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Ensure environment variables exist
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing service role configuration! Admin functions will not work.');
  console.error('Please set VITE_SUPABASE_SERVICE_KEY in your .env file');
}

// Create a service role client with elevated permissions
export const supabaseAdmin = createClient(
  supabaseUrl as string, 
  supabaseServiceKey as string,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Admin operations that bypass RLS and auth schema
export const adminOperations = {
  // Get all profiles regardless of RLS
  async getAllProfiles() {
    return await supabaseAdmin.from('profiles').select('*');
  },
  
  // Get a specific profile by email
  async getProfileByEmail(email: string) {
    return await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
  },
  
  // Check if a user is an admin
  async isAdmin(email: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('email', email)
      .single();
      
    if (error || !data) return false;
    return data.role === 'admin';
  },
  
  // Custom admin login that doesn't rely on auth schema
  async adminLogin(email: string, password: string) {
    try {
      // Check if user exists in auth.users with matching password
      // This uses service role which has access to auth schema
      const { data: authData, error: authError } = await supabaseAdmin
        .rpc('check_admin_credentials', { 
          admin_email: email, 
          admin_password: password 
        });
        
      if (authError || !authData?.success) {
        console.error('Admin login failed:', authError || 'Invalid credentials');
        return { success: false, error: 'Invalid credentials' };
      }
      
      // Get admin profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
        
      if (profileError || !profile) {
        console.error('Admin profile not found:', profileError);
        return { success: false, error: 'Admin profile not found' };
      }
      
      // Check admin role
      if (profile.role !== 'admin') {
        console.error('User is not an admin');
        return { success: false, error: 'Not an admin user' };
      }
      
      // Return success with admin user
      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          display_name: profile.display_name
        }
      };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: 'Admin login failed' };
    }
  }
};

// Hook for admin operations
export function useAdminOperations() {
  return adminOperations;
}
