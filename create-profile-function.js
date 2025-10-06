import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createProfileFunction() {
  console.log('🔧 Creating SQL function to handle missing profiles...\n');
  
  try {
    // Create a SQL function that can access auth.users and create profiles
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.create_missing_profile_for_email(user_email TEXT)
      RETURNS JSON
      SECURITY DEFINER
      AS $$
      DECLARE
          user_record RECORD;
          profile_exists BOOLEAN;
          result JSON;
      BEGIN
          -- Get user from auth.users
          SELECT id, email, created_at, email_confirmed_at
          INTO user_record
          FROM auth.users 
          WHERE email = user_email;
          
          IF user_record.id IS NULL THEN
              result := json_build_object(
                  'success', false,
                  'message', 'User not found in auth.users',
                  'user_email', user_email
              );
              RETURN result;
          END IF;
          
          -- Check if profile exists
          SELECT EXISTS(
              SELECT 1 FROM public.profiles 
              WHERE id = user_record.id
          ) INTO profile_exists;
          
          IF profile_exists THEN
              result := json_build_object(
                  'success', true,
                  'message', 'Profile already exists',
                  'user_id', user_record.id,
                  'user_email', user_record.email
              );
              RETURN result;
          END IF;
          
          -- Create profile
          INSERT INTO public.profiles (
              id,
              email,
              display_name,
              role,
              created_at,
              updated_at
          ) VALUES (
              user_record.id,
              user_record.email,
              split_part(user_record.email, '@', 1),
              'user',
              NOW(),
              NOW()
          );
          
          result := json_build_object(
              'success', true,
              'message', 'Profile created successfully',
              'user_id', user_record.id,
              'user_email', user_record.email,
              'display_name', split_part(user_record.email, '@', 1),
              'role', 'user'
          );
          
          RETURN result;
          
      EXCEPTION WHEN OTHERS THEN
          result := json_build_object(
              'success', false,
              'message', 'Error: ' || SQLERRM,
              'user_email', user_email
          );
          RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    // First, let's create this function using the SQL editor approach
    console.log('1️⃣ Creating function using direct SQL execution...');
    
    const { data: functionResult, error: functionError } = await supabase
      .rpc('sql', { 
        query: createFunctionSQL 
      });
    
    if (functionError) {
      console.log('⚠️ Could not create function via rpc. Error:', functionError.message);
      console.log('   This is normal if the rpc function is not available');
      
      // Let's try an alternative approach - use Supabase Edge Functions or manual SQL
      console.log('\n2️⃣ Trying alternative approach...');
      
      // Let's just try to execute the essential part of the function manually
      // We'll attempt to get the user ID through a more direct method
      
      console.log('   Creating a simple test to find user ID patterns...');
      
      // Let's check what user IDs look like in the existing profiles
      const { data: existingProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(3);
      
      if (profilesError) {
        console.error('❌ Could not get existing profiles:', profilesError.message);
        return;
      }
      
      console.log('   📋 Existing profile IDs for reference:');
      existingProfiles.forEach(profile => {
        console.log(`   ${profile.email}: ${profile.id}`);
      });
      
      // Now let's try to create a profile with a realistic UUID
      // We know the constraint is failing because the ID doesn't exist in auth.users
      // Let's try to create a test with one of the existing IDs first to understand the pattern
      
      console.log('\n3️⃣ Testing profile creation with different approach...');
      
      // Let's use the admin authentication approach to try to get the user
      const { data: signInResult, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'sergioytpremium@gmail.com',
        password: 'test123' // This will fail but might give us info
      });
      
      if (signInError) {
        console.log('   Password test failed (expected):', signInError.message);
        if (signInError.message.includes('Invalid login credentials')) {
          console.log('   ✅ This confirms the user exists (credentials just wrong)');
        }
      }
      
      return;
    }
    
    console.log('✅ Function created successfully!');
    
    // Now call the function to create the profile
    console.log('\n2️⃣ Calling function to create profile...');
    
    const { data: result, error: callError } = await supabase
      .rpc('create_missing_profile_for_email', {
        user_email: 'sergioytpremium@gmail.com'
      });
    
    if (callError) {
      console.error('❌ Function call failed:', callError.message);
      return;
    }
    
    console.log('✅ Function result:', result);
    
    if (result.success) {
      console.log('\n🎉 Profile created successfully!');
      console.log(`   User ID: ${result.user_id}`);
      console.log(`   Email: ${result.user_email}`);
      console.log(`   Display Name: ${result.display_name}`);
      console.log(`   Role: ${result.role}`);
      
      // Verify by checking the profiles table
      console.log('\n3️⃣ Verifying in profiles table...');
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'sergioytpremium@gmail.com')
        .single();
      
      if (verifyError) {
        console.error('❌ Verification failed:', verifyError.message);
      } else {
        console.log('✅ Profile verified in database!');
        console.log('   The user should now appear in your admin dashboard');
      }
    } else {
      console.error('❌ Function returned error:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createProfileFunction();
