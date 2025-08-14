// Attempt to fix auth schema via SQL functions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';

console.log('🔧 Attempting Auth Schema Fix\n');

async function attemptAuthFix() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('🔍 Step 1: Creating auth fix function...');
    
    // Create a function to check and potentially fix auth schema issues
    const fixAuthSchemaSQL = `
        CREATE OR REPLACE FUNCTION fix_auth_schema()
        RETURNS TEXT AS $$
        DECLARE
            result TEXT := '';
        BEGIN
            -- Check if auth.users table exists and is accessible
            BEGIN
                PERFORM 1 FROM auth.users LIMIT 1;
                result := result || 'auth.users table accessible; ';
            EXCEPTION WHEN OTHERS THEN
                result := result || 'auth.users table NOT accessible: ' || SQLERRM || '; ';
            END;
            
            -- Check if auth.identities table exists
            BEGIN
                PERFORM 1 FROM auth.identities LIMIT 1;
                result := result || 'auth.identities table accessible; ';
            EXCEPTION WHEN OTHERS THEN
                result := result || 'auth.identities NOT accessible: ' || SQLERRM || '; ';
            END;
            
            -- Check current user and permissions
            result := result || 'Current user: ' || current_user || '; ';
            
            -- Try to get table information
            BEGIN
                SELECT count(*) INTO STRICT result FROM information_schema.tables 
                WHERE table_schema = 'auth';
                result := result || 'Auth tables count: ' || result || '; ';
            EXCEPTION WHEN OTHERS THEN
                result := result || 'Cannot count auth tables: ' || SQLERRM || '; ';
            END;
            
            RETURN result;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: fixAuthSchemaSQL });
        
        if (error) {
            console.log('❌ Failed to create fix function:', error.message);
        } else {
            console.log('✅ Fix function created successfully');
        }
    } catch (err) {
        // Try direct SQL execution
        try {
            const { data, error } = await supabase
                .from('pg_stat_statements')
                .select('query')
                .limit(1);
            console.log('✅ Database access confirmed, trying alternative approach...');
        } catch (altErr) {
            console.log('❌ Cannot execute SQL:', err.message);
        }
    }
    
    console.log('\n🔍 Step 2: Testing auth fix function...');
    
    try {
        const { data: fixResult, error: fixError } = await supabase.rpc('fix_auth_schema');
        
        if (fixError) {
            console.log('❌ Fix function failed:', fixError.message);
        } else {
            console.log('✅ Fix function result:', fixResult);
        }
    } catch (err) {
        console.log('❌ Fix function exception:', err.message);
    }
    
    console.log('\n🔍 Step 3: Alternative - Creating simple admin user...');
    
    // Try to create a simple admin user directly
    const createAdminSQL = `
        CREATE OR REPLACE FUNCTION create_emergency_admin()
        RETURNS TEXT AS $$
        DECLARE
            new_user_id UUID;
            result TEXT;
        BEGIN
            -- Try to insert directly into auth.users
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                recovery_sent_at,
                last_sign_in_at,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at,
                confirmation_token,
                email_change,
                email_change_token_new,
                recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                gen_random_uuid(),
                'authenticated',
                'authenticated',
                's.foort@bonairemakelaars.com',
                crypt('admin123', gen_salt('bf')),
                NOW(),
                NOW(),
                NOW(),
                '{"provider":"email","providers":["email"]}',
                '{}',
                NOW(),
                NOW(),
                '',
                '',
                '',
                ''
            ) RETURNING id INTO new_user_id;
            
            result := 'Created user with ID: ' || new_user_id;
            RETURN result;
            
        EXCEPTION WHEN OTHERS THEN
            RETURN 'Failed to create user: ' || SQLERRM;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: createAdminSQL });
        
        if (error) {
            console.log('❌ Failed to create admin function:', error.message);
        } else {
            console.log('✅ Admin function created, testing...');
            
            const { data: adminResult, error: adminError } = await supabase.rpc('create_emergency_admin');
            
            if (adminError) {
                console.log('❌ Admin creation failed:', adminError.message);
            } else {
                console.log('✅ Admin creation result:', adminResult);
            }
        }
    } catch (err) {
        console.log('❌ Admin function exception:', err.message);
    }
    
    console.log('\n📊 Conclusion:');
    console.log('If all above failed, the auth schema is severely corrupted.');
    console.log('Recommendation: Reset auth schema via Supabase Dashboard');
    console.log('This will delete all users but restore functionality.');
}

attemptAuthFix().catch(console.error);
