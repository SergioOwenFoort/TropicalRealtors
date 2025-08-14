// Quick auth diagnostics script
import { createClient } from '@supabase/supabase-js';

// Your current Supabase connection
const supabaseUrl = 'https://pwmsihnepjvzwbrgrbdn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bXNpaG5lcGp2endicmdyYmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjY1MjcsImV4cCI6MjA3MDMwMjUyN30.mftcLUHAHeLuY3Rj903nFVrVm_c6dJWll3unfTuKa98';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseAuth() {
  console.log('🔍 Starting auth diagnostics...\n');
  
  try {
    // Test 1: Basic connection
    console.log('✅ Test 1: Basic Supabase connection');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count');
    
    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      return;
    } else {
      console.log('✅ Successfully connected to Supabase\n');
    }
    
    // Test 2: Check existing users
    console.log('👥 Test 2: Checking existing users in auth');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Cannot access auth users (expected - need service role)');
      console.log('   This is normal with anon key\n');
    } else {
      console.log('✅ Found users:', users?.length || 0, '\n');
    }
    
    // Test 3: Try to sign in with admin
    console.log('🔑 Test 3: Testing admin login');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 's.admin@bonairemakelaars.com',
      password: 'SuperSecure2025!'
    });
    
    if (signInError) {
      console.error('❌ Admin login failed:', signInError.message);
      
      // Specific error analysis
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('💡 Solution: Admin user doesn\'t exist or wrong password');
        console.log('   → Create admin user in Supabase Dashboard → Authentication → Users');
      } else if (signInError.message.includes('Email not confirmed')) {
        console.log('💡 Solution: Confirm admin email in Supabase Dashboard');
      } else if (signInError.message.includes('Too many requests')) {
        console.log('💡 Solution: Wait a few minutes and try again');
      } else {
        console.log('💡 Unknown auth error - may need manual user creation');
      }
    } else {
      console.log('✅ Admin login successful!');
      console.log('   User ID:', signInData.user?.id);
      console.log('   Email:', signInData.user?.email);
      
      // Test profile access
      console.log('\n📝 Test 4: Testing profile access');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 's.admin@bonairemakelaars.com');
        
      if (profileError) {
        console.error('❌ Profile access failed:', profileError.message);
        console.log('💡 Solution: Create admin profile in profiles table');
      } else {
        console.log('✅ Profile found:', profileData);
      }
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
  }
}

// Run diagnostics
diagnoseAuth();
