// Comprehensive database schema diagnosis
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODIyNTgwNSwiZXhwIjoyMDQzODAxODA1fQ.JV5TZYBwN1O8x9LJlZEAIr3H_LGEeYdW9EfGdDzRbLs';

console.log('🔍 Comprehensive Database Schema Diagnosis\n');

async function diagnoseDatabaseState() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('📋 Checking what tables exist in the database...\n');
    
    try {
        // Check all tables in public schema
        const { data: publicTables, error: publicError } = await supabase
            .from('information_schema.tables')
            .select('table_name, table_schema')
            .eq('table_schema', 'public');
            
        if (publicError) {
            console.log('❌ Error querying public schema:', publicError.message);
        } else {
            console.log('✅ Tables in public schema:');
            publicTables.forEach(table => {
                console.log(`   - ${table.table_name}`);
            });
        }
    } catch (err) {
        console.log('❌ Exception querying public schema:', err.message);
    }
    
    console.log('\n📋 Checking auth schema tables...\n');
    
    try {
        // Check auth schema tables
        const { data: authTables, error: authError } = await supabase
            .from('information_schema.tables')
            .select('table_name, table_schema')
            .eq('table_schema', 'auth');
            
        if (authError) {
            console.log('❌ Error querying auth schema:', authError.message);
        } else {
            console.log('✅ Tables in auth schema:');
            if (authTables.length === 0) {
                console.log('   ⚠️  NO AUTH TABLES FOUND!');
            } else {
                authTables.forEach(table => {
                    console.log(`   - ${table.table_name}`);
                });
            }
        }
    } catch (err) {
        console.log('❌ Exception querying auth schema:', err.message);
    }
    
    console.log('\n📋 Checking specific critical tables...\n');
    
    // Check critical tables directly
    const criticalTables = [
        'auth.users',
        'auth.identities', 
        'auth.sessions',
        'public.users',
        'public.profiles'
    ];
    
    for (const tableName of criticalTables) {
        try {
            const result = await supabase.rpc('check_table_exists', { table_name: tableName });
            console.log(`✅ ${tableName}: Accessible via RPC`);
        } catch (err) {
            try {
                // Try direct query
                const { data, error } = await supabase
                    .from(tableName.replace('auth.', '').replace('public.', ''))
                    .select('*')
                    .limit(1);
                    
                if (error) {
                    console.log(`❌ ${tableName}: ${error.message}`);
                } else {
                    console.log(`✅ ${tableName}: Accessible (${data?.length || 0} records found)`);
                }
            } catch (directErr) {
                console.log(`❌ ${tableName}: Not accessible (${directErr.message})`);
            }
        }
    }
    
    console.log('\n📋 Testing RPC functions...\n');
    
    // Check if custom RPC functions exist
    const rpcFunctions = [
        'create_admin_user',
        'reset_user_password',
        'get_user_by_email',
        'update_user_password'
    ];
    
    for (const funcName of rpcFunctions) {
        try {
            await supabase.rpc(funcName, {});
            console.log(`✅ ${funcName}: Function exists`);
        } catch (err) {
            if (err.message.includes('function') && err.message.includes('does not exist')) {
                console.log(`❌ ${funcName}: Function does not exist`);
            } else {
                console.log(`⚠️  ${funcName}: Function exists but failed (${err.message})`);
            }
        }
    }
    
    console.log('\n📋 Checking database permissions...\n');
    
    try {
        // Check current role and permissions
        const { data: roleData, error: roleError } = await supabase
            .rpc('current_user');
            
        if (roleError) {
            console.log('❌ Cannot check current user:', roleError.message);
        } else {
            console.log('✅ Current database user:', roleData);
        }
    } catch (err) {
        console.log('❌ Error checking permissions:', err.message);
    }
    
    console.log('\n🔧 Suggested Actions:');
    console.log('1. If auth tables are missing: Supabase needs to be reset/reinitialized');
    console.log('2. If auth tables exist but are inaccessible: Permission/RLS issues');
    console.log('3. If RPC functions are missing: Need to create custom functions');
    console.log('4. Consider migrating to a fresh Supabase instance if corruption is severe');
}

diagnoseDatabaseState().catch(console.error);
