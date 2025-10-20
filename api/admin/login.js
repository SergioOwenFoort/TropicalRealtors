/**
 * Admin Authentication API Endpoint
 * 
 * This endpoint checks if a user is an admin and validates their credentials
 * WITHOUT exposing admin credentials in the frontend code.
 * 
 * SECURITY: 
 * - Admin credentials stored in backend environment variables only
 * - Not accessible from client-side code
 * - Uses Supabase service role for authentication
 */

import { createClient } from '@supabase/supabase-js';

// Backend environment variables (NOT exposed to client)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // Store hash, not plain password

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase configuration');
}

// Create Supabase client with service role
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if this is the admin email
    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password (in production, compare hash)
    // For now, use direct comparison (CHANGE THIS IN PRODUCTION)
    const isPasswordValid = password === process.env.ADMIN_PASSWORD;
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get admin user from database
    const { data: adminUser, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role')
      .eq('email', email)
      .eq('role', 'admin')
      .single();

    if (userError || !adminUser) {
      return res.status(401).json({ error: 'Admin user not found' });
    }

    // Return success with user ID
    return res.status(200).json({
      success: true,
      userId: adminUser.id,
      user_id: adminUser.id,
      email: adminUser.email
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
