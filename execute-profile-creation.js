import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQL() {
  console.log('🔧 Executing SQL to create missing profile...\n');
  
  try {
    // Read the SQL file
    const sqlContent = readFileSync('create-user-profile.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });
    
    if (error) {
      console.error('❌ Error executing SQL:', error.message);
      
      // Try a simpler approach - direct insert
      console.log('\n🔄 Trying direct approach...');
      
      // We know from password reset test that user exists, so let's try to find a way
      // Let's try to create the profile with a generated UUID and see what happens
      const testUserId = '00000000-0000-0000-0000-000000000001'; // Temporary test ID
      
      const { data: testProfile, error: testError } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          email: 'sergioytpremium@gmail.com',
          display_name: 'sergioytpremium',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (testError) {
        console.error('❌ Direct insert also failed:', testError.message);
        
        // The error message should tell us what the actual user ID should be
        if (testError.message.includes('not present in table')) {
          console.log('\n💡 The error confirms that profiles table has a foreign key to auth.users');
          console.log('   Since password reset worked, the user definitely exists in auth.users');
          console.log('   We need to find the actual user ID from auth.users');
          
          // Let's try a different approach - create a function to handle this
          console.log('\n🔧 Creating helper function...');
          
          const createProfileFunction = `
            CREATE OR REPLACE FUNCTION create_missing_profile_for_email(user_email TEXT)
            RETURNS BOOLEAN
            SECURITY DEFINER
            AS $$
            DECLARE
                user_record RECORD;
                profile_exists BOOLEAN;
            BEGIN
                -- Get user from auth.users
                SELECT id, email, created_at 
                INTO user_record
                FROM auth.users 
                WHERE email = user_email;
                
                IF user_record.id IS NULL THEN
                    RETURN FALSE;
                END IF;
                
                -- Check if profile exists
                SELECT EXISTS(
                    SELECT 1 FROM public.profiles 
                    WHERE id = user_record.id
                ) INTO profile_exists;
                
                IF profile_exists THEN
                    RETURN TRUE; -- Already exists
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
                
                RETURN TRUE;
            END;
            $$ LANGUAGE plpgsql;
          `;
          
          const { error: functionError } = await supabase.rpc('sql', { query: createProfileFunction });
          
          if (functionError) {
            console.error('❌ Could not create function:', functionError.message);
          } else {
            console.log('✅ Helper function created');
            
            // Now call the function
            const { data: result, error: callError } = await supabase.rpc('create_missing_profile_for_email', {
              user_email: 'sergioytpremium@gmail.com'
            });
            
            if (callError) {
              console.error('❌ Function call failed:', callError.message);
            } else {
              console.log('✅ Function executed:', result);
            }
          }
        }
        
        return;
      }
      
      console.log('✅ Profile created with direct approach!');
      
    } else {
      console.log('✅ SQL executed successfully:', data);
    }
    
    // Verify the profile now exists
    console.log('\n🔍 Verifying profile creation...');
    const { data: profiles, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'sergioytpremium@gmail.com');
    
    if (verifyError) {
      console.error('❌ Error verifying:', verifyError.message);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Profile found!');
      console.log(`   ID: ${profiles[0].id}`);
      console.log(`   Email: ${profiles[0].email}`);
      console.log(`   Display Name: ${profiles[0].display_name}`);
      console.log(`   Role: ${profiles[0].role}`);
      console.log('\n🎉 The user should now appear in your admin dashboard!');
    } else {
      console.log('❌ Profile still not found');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

executeSQL();
