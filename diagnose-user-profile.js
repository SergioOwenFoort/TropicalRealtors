import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseUserProfile() {
  console.log('🔍 Diagnosing user profile issue for: sergioytpremium@gmail.com\n');
  
  try {
    // Check if user exists in auth.users
    console.log('1️⃣ Checking if user exists in auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error accessing auth.users:', authError.message);
      return;
    }
    
    const targetUser = authUsers.users.find(user => user.email === 'sergioytpremium@gmail.com');
    
    if (!targetUser) {
      console.log('❌ User NOT found in auth.users table');
      console.log('   This means the registration failed or was not completed');
      return;
    }
    
    console.log('✅ User found in auth.users:');
    console.log(`   ID: ${targetUser.id}`);
    console.log(`   Email: ${targetUser.email}`);
    console.log(`   Created: ${targetUser.created_at}`);
    console.log(`   Email confirmed: ${targetUser.email_confirmed_at ? 'Yes' : 'No'}`);
    
    // Check if profile exists
    console.log('\n2️⃣ Checking if profile exists...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'sergioytpremium@gmail.com');
    
    if (profileError) {
      console.error('❌ Error checking profiles:', profileError.message);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ Profile NOT found in profiles table');
      console.log('   This means the trigger failed to create the profile');
      
      // Let's create the missing profile
      console.log('\n3️⃣ Creating missing profile...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: targetUser.id,
          email: targetUser.email,
          display_name: targetUser.email.split('@')[0],
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (createError) {
        console.error('❌ Error creating profile:', createError.message);
        return;
      }
      
      console.log('✅ Profile created successfully!');
      console.log('   User should now appear in admin dashboard');
      
    } else {
      console.log('✅ Profile found in profiles table:');
      console.log(`   ID: ${profiles[0].id}`);
      console.log(`   Email: ${profiles[0].email}`);
      console.log(`   Display Name: ${profiles[0].display_name}`);
      console.log(`   Role: ${profiles[0].role}`);
    }
    
    // Check if there are any triggers that should create profiles automatically
    console.log('\n4️⃣ Checking database triggers...');
    const { data: triggers, error: triggerError } = await supabase
      .rpc('sql', {
        query: `
          SELECT 
            t.tgname as trigger_name,
            c.relname as table_name,
            p.proname as function_name,
            t.tgenabled as enabled
          FROM pg_trigger t
          JOIN pg_class c ON t.tgrelid = c.oid
          JOIN pg_proc p ON t.tgfoid = p.oid
          WHERE c.relname IN ('users') 
          AND (t.tgname LIKE '%profile%' OR t.tgname LIKE '%user%')
          ORDER BY t.tgname;
        `
      });
    
    if (triggerError) {
      console.log('⚠️ Could not check triggers (this is normal in some setups)');
    } else if (triggers && triggers.length > 0) {
      console.log('✅ Found triggers:');
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name} on ${trigger.table_name} (${trigger.enabled ? 'enabled' : 'disabled'})`);
      });
    } else {
      console.log('⚠️ No triggers found - profiles must be created manually');
    }
    
    console.log('\n✅ Diagnosis complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

diagnoseUserProfile();
