// Test with correct API keys from .env file
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';

console.log('🔧 Testing with Correct API Keys\n');

async function testWithCorrectKeys() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const testEmail = 's.foort@bonairemakelaars.com';
    
    console.log(`📧 Testing with email: ${testEmail}`);
    console.log(`🔑 Using service key: ${supabaseServiceKey.substring(0, 20)}...\n`);
    
    // Test 1: Basic connection
    console.log('🔍 Test 1: Basic connection...');
    try {
        const { data, error } = await supabase
            .from('properties')
            .select('count')
            .limit(1);
        
        if (error) {
            console.log('❌ Connection failed:', error.message);
        } else {
            console.log('✅ Basic connection successful');
        }
    } catch (err) {
        console.log('❌ Connection exception:', err.message);
    }
    
    // Test 2: Admin operations
    console.log('\n👤 Test 2: Admin user operations...');
    try {
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
            console.log('❌ List users failed:', listError.message);
            console.log('   Status:', listError.status);
            console.log('   Code:', listError.code);
        } else {
            console.log('✅ List users successful');
            console.log('   Total users:', users.users?.length || 0);
            
            // Find our target user
            const targetUser = users.users?.find(u => u.email === testEmail);
            if (targetUser) {
                console.log('✅ Found target user:', targetUser.id);
                console.log('   Email confirmed:', targetUser.email_confirmed_at ? 'Yes' : 'No');
                console.log('   Created:', targetUser.created_at);
                console.log('   Last sign in:', targetUser.last_sign_in_at || 'Never');
            } else {
                console.log('❌ Target user not found');
                console.log('   Available users:');
                users.users?.forEach(u => {
                    console.log(`     - ${u.email} (${u.id})`);
                });
            }
        }
    } catch (err) {
        console.log('❌ Admin operations exception:', err.message);
    }
    
    // Test 3: Login attempt
    console.log('\n🔑 Test 3: Login test...');
    try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: 'admin123' // Try common password
        });
        
        if (loginError) {
            console.log('❌ Login failed:', loginError.message);
            console.log('   Status:', loginError.status);
            console.log('   Code:', loginError.code);
        } else {
            console.log('✅ Login successful!');
            console.log('   User ID:', loginData.user?.id);
        }
    } catch (err) {
        console.log('❌ Login exception:', err.message);
    }
    
    // Test 4: Password reset attempt
    console.log('\n🔐 Test 4: Password reset attempt...');
    try {
        const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
            testEmail,
            { redirectTo: 'http://localhost:5173/reset-password' }
        );
        
        if (resetError) {
            console.log('❌ Password reset failed:', resetError.message);
        } else {
            console.log('✅ Password reset email sent');
        }
    } catch (err) {
        console.log('❌ Password reset exception:', err.message);
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. If admin operations work: The API key issue is resolved');
    console.log('2. If login fails but users exist: Password/account corruption');
    console.log('3. If everything fails: Need to check Supabase dashboard');
}

testWithCorrectKeys().catch(console.error);
