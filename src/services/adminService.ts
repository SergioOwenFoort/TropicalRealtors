// adminService.ts
// A service for secure admin operations using the service role key
// IMPORTANT: This file should only be used on the server side (Node.js environment)

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// For TypeScript error handling
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Load environment variables
dotenv.config();

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials for admin operations');
  process.exit(1);
}

// Create admin client with service role key
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Helper to verify a user is an admin
 * @param userId - The user ID to check
 * @returns true if user is admin, false otherwise
 */
async function verifyAdmin(userId) {
  try {
    const { data, error } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error verifying admin status:', error.message);
      return false;
    }
    
    return data?.role === 'admin';
  } catch (error) {
    console.error('Unexpected error verifying admin status:', error);
    return false;
  }
}

/**
 * Reset a user's password (requires admin privileges)
 * @param adminId - The ID of the admin making the request
 * @param targetUserId - The user whose password to reset
 * @param newPassword - The new password
 */
export async function resetUserPassword(adminId, targetUserId, newPassword) {
  try {
    // First verify the requesting user is an admin
    const isAdmin = await verifyAdmin(adminId);
    if (!isAdmin) {
      throw new Error('Not authorized to perform this operation');
    }
    
    // Reset password using service role
    const { data, error } = await adminClient.auth.admin.updateUserById(
      targetUserId,
      { password: newPassword }
    );
    
    if (error) {
      throw new Error(`Failed to reset password: ${error.message}`);
    }
    
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, message: error.message };
  }
}

/**
 * List all users (admin only)
 * @param adminId - The ID of the admin making the request
 */
export async function listAllUsers(adminId) {
  try {
    // First verify the requesting user is an admin
    const isAdmin = await verifyAdmin(adminId);
    if (!isAdmin) {
      throw new Error('Not authorized to perform this operation');
    }
    
    // Get users with service role
    const { data, error } = await adminClient.auth.admin.listUsers();
    
    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }
    
    return { success: true, users: data.users };
  } catch (error) {
    console.error('Error listing users:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Create a new user with specified role (admin only)
 * @param adminId - The ID of the admin making the request
 * @param email - Email for the new user
 * @param password - Password for the new user
 * @param role - Role for the new user (default: user)
 */
export async function createUser(adminId, email, password, role = 'user') {
  try {
    // First verify the requesting user is an admin
    const isAdmin = await verifyAdmin(adminId);
    if (!isAdmin) {
      throw new Error('Not authorized to perform this operation');
    }
    
    // Create user with service role
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role }
    });
    
    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    // Also create profile record
    if (data.user) {
      await adminClient.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        role,
        display_name: email.split('@')[0]
      });
    }
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, message: error.message };
  }
}

// Export all admin operations
export const adminService = {
  verifyAdmin,
  resetUserPassword,
  listAllUsers,
  createUser
};

export default adminService;
