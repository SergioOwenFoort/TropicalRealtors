// supabaseAdmin.ts
// Service role client for admin operations
// This bypasses RLS and auth schema issues

import { createClient } from '@supabase/supabase-js';

// Types for the admin operations we expose
interface AdminOperations {
  getAllProfiles: () => Promise<unknown>;
  getProfileByEmail: (email: string) => Promise<unknown>;
  isAdmin: (email: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
    user?: { id: string; email: string; role: string; display_name?: string };
  }>;
}

// Environment variables
// URL can come from Vite (safe to expose) or server env; service key MUST be server-only.
const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined);
// Name aligned with docs: SUPABASE_SERVICE_ROLE_KEY (also allow SUPABASE_SERVICE_KEY for convenience)
const supabaseServiceKey = (typeof process !== 'undefined' && process.env && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)) as string | undefined;

// Ensure environment variables exist
// Prevent accidental import in the browser — provide a no-op shim instead of throwing to avoid hard runtime crashes
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
// Prepare shims to avoid top-level export inside conditional blocks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const browserShim: any = new Proxy({}, {
  get() {
    throw new Error('supabaseAdmin/adminOperations are server-only and cannot be used in the browser');
  }
});

if (!isBrowser && (!supabaseUrl || !supabaseServiceKey)) {
  console.error('Missing service role configuration! Admin functions will not work.');
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) in your server environment');
}

// Create a service role client with elevated permissions
export const supabaseAdmin = !isBrowser ? createClient(
  supabaseUrl as string,
  (supabaseServiceKey as string) || 'DUMMY_DO_NOT_USE',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
): browserShim;

// Admin operations that bypass RLS and auth schema
export const adminOperations: AdminOperations = !isBrowser ? {
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
} as AdminOperations : (browserShim as unknown as AdminOperations);

// Hook for admin operations
export function useAdminOperations() {
  return adminOperations;
}
