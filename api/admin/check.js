/**
 * Admin Check API Endpoint
 * 
 * This endpoint checks if an email belongs to an admin user
 * WITHOUT revealing the actual admin email.
 * 
 * SECURITY:
 * - Only checks if user exists in database with admin role
 * - Does not validate credentials (use /api/admin/login for that)
 * - Returns boolean only
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase configuration');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Check if user exists with admin role
    const { data: adminUser, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('email', email)
      .eq('role', 'admin')
      .single();

    // Return whether user is admin (don't reveal if user exists or not)
    return res.status(200).json({
      isAdmin: !!adminUser && !error
    });

  } catch (error) {
    console.error('Admin check error:', error);
    // Don't reveal errors - always return false for security
    return res.status(200).json({ isAdmin: false });
  }
}
