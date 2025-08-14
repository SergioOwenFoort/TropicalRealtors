// Service Role Implementation for Admin Operations
// Use this approach if regular authentication continues to fail

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;

// Attempt to read service key from .env.service
let serviceRoleKey = null;
const serviceEnvPath = path.resolve(__dirname, '../.env.service');

if (fs.existsSync(serviceEnvPath)) {
  const serviceEnvContent = fs.readFileSync(serviceEnvPath, 'utf8');
  const match = serviceEnvContent.match(/SUPABASE_SERVICE_KEY=(.+)/);
  if (match && match[1]) {
    serviceRoleKey = match[1].trim();
  }
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase URL or service role key');
  console.log('Please create a .env.service file with SUPABASE_SERVICE_KEY=your_key');
  process.exit(1);
}

// Create service role client
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function adminOperations() {
  console.log('🔑 Running admin operations with service role key...');

  try {
    // Example: List all profiles using service role
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`✅ Successfully fetched ${profiles.length} profiles`);
      
      // Display the profiles
      if (profiles.length > 0) {
        console.table(profiles.map(p => ({ 
          id: p.id.substring(0, 8) + '...',
          email: p.email,
          role: p.role
        })));
      }
    }

    // Example: Verify admin user exists
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', 's.admin@bonairemakelaars.com')
      .single();
    
    if (adminError) {
      console.error('❌ Admin user not found:', adminError);
      
      console.log('🔧 Creating admin user with service role...');
      
      // Get auth user first
      const { data: authUser, error: authUserError } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .eq('email', 's.admin@bonairemakelaars.com')
        .single();
      
      if (authUserError) {
        console.error('❌ Could not find admin in auth.users');
        return;
      }
      
      // Create admin profile
      const { error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.id,
          email: 's.admin@bonairemakelaars.com',
          role: 'admin',
          display_name: 'Admin User'
        });
      
      if (createError) {
        console.error('❌ Error creating admin profile:', createError);
      } else {
        console.log('✅ Admin profile created successfully');
      }
    } else {
      console.log('✅ Admin user exists:', {
        id: admin.id.substring(0, 8) + '...',
        email: admin.email,
        role: admin.role
      });
      
      // Check if admin has correct role
      if (admin.role !== 'admin') {
        console.log('🔧 Updating admin role...');
        
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', admin.id);
        
        if (updateError) {
          console.error('❌ Error updating admin role:', updateError);
        } else {
          console.log('✅ Admin role updated successfully');
        }
      }
    }

    // Example: Run RPC function
    try {
      const { error: rpcError } = await supabaseAdmin.rpc('verify_admin_policies');
      
      if (rpcError) {
        console.error('❌ Error running verify_admin_policies:', rpcError);
      } else {
        console.log('✅ verify_admin_policies executed successfully');
      }
    } catch (error) {
      console.error('❌ Error with RPC function:', error);
    }
    
    console.log('\n📝 Summary of service role implementation:');
    console.log('1. Created supabaseAdmin client using service role key');
    console.log('2. Verified/created admin user profile');
    console.log('3. Tested RPC function execution');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Implement service role approach in your application for admin operations');
    console.log('2. Create a new supabaseAdmin.ts file with service role client');
    console.log('3. Update admin operations to use this client instead of regular auth');
    
  } catch (error) {
    console.error('❌ Unexpected error during admin operations:', error);
  }
}

// Run admin operations
adminOperations();
