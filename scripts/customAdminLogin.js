// Admin login using custom RPC function
// This bypasses the regular auth mechanism entirely

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
config();

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function customAdminLogin() {
  console.log('🔑 Testing custom admin login function...');
  
  try {
    // Call the custom admin_login function
    const { data, error } = await supabase.rpc('admin_login', {
      email: 's.admin@bonairemakelaars.com',
      password: 'SuperSecure2025!'
    });
    
    if (error) {
      console.error('❌ Custom login error:', error);
      return;
    }
    
    if (!data.success) {
      console.error('❌ Login failed:', data.message);
      return;
    }
    
    console.log('✅ Custom admin login successful!');
    console.log('👤 User info:', data.user);
    
    // Try to access profiles table with RPC
    console.log('\n🔍 Accessing profiles via RPC...');
    const { data: profiles, error: profilesError } = await supabase.rpc('get_all_profiles');
    
    if (profilesError) {
      console.error('❌ Error accessing profiles via RPC:', profilesError);
      
      // Let's create the RPC function
      console.log('📝 Creating get_all_profiles RPC function...');
      
      const createRpcScript = `
      CREATE OR REPLACE FUNCTION public.get_all_profiles()
      RETURNS SETOF public.profiles
      LANGUAGE sql
      SECURITY DEFINER
      AS $$
          SELECT * FROM public.profiles;
      $$;
      
      GRANT EXECUTE ON FUNCTION public.get_all_profiles() TO authenticated, anon, service_role;
      `;
      
      console.log('⚠️ Please run the following SQL in Supabase SQL Editor:');
      console.log(createRpcScript);
    } else {
      console.log(`✅ Successfully retrieved ${profiles.length} profiles`);
    }
    
    // Write instructions for implementing this approach in the frontend
    console.log('\n📋 To implement this in your frontend:');
    console.log(`
1. Update your login function in useSupabaseAuthActions.ts:

  const loginAsAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use RPC function instead of regular login
      const { data, error } = await supabase.rpc('admin_login', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.message || 'Login failed');
      
      // Store user info in local storage
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      
      // Set up a custom session
      const customSession = {
        user: data.user,
        isAdmin: true
      };
      
      // You could dispatch this to your state management
      // dispatch({ type: 'SET_SESSION', payload: customSession });
      
      return customSession;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };
`);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
customAdminLogin();
