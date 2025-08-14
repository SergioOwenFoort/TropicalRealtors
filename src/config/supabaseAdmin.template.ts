// Supabase Admin Client with Service Role
// Use this for administrative operations that require elevated permissions

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY; 

// Verify required environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase service role configuration. Admin operations will not work.');
}

// Create the service role client
export const supabaseAdmin = createClient<Database>(
  supabaseUrl as string,
  supabaseServiceKey as string,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Sample admin operations
export const adminOperations = {
  // Get all users (only possible with service role)
  async getAllUsers() {
    return await supabaseAdmin.auth.admin.listUsers();
  },
  
  // Reset a user's password (only possible with service role)
  async resetUserPassword(userId: string, password: string) {
    return await supabaseAdmin.auth.admin.updateUserById(userId, { password });
  },
  
  // Create a new user (only possible with service role)
  async createUser(email: string, password: string, metadata?: Record<string, any>) {
    return await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata || {},
      app_metadata: { role: 'user' }
    });
  },
  
  // Delete a user (only possible with service role)
  async deleteUser(userId: string) {
    return await supabaseAdmin.auth.admin.deleteUser(userId);
  },
  
  // Check if a user is an admin (using service role bypass)
  async isUserAdmin(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error || !data) return false;
    return data.role === 'admin';
  },
  
  // Make a user an admin
  async makeUserAdmin(userId: string) {
    return await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);
  }
};

// Export a hook for admin operations
export function useAdminOperations() {
  // Add any state management or additional logic here
  return adminOperations;
}
