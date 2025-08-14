// Test the actual password reset flow end-to-end
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODIyNTgwNSwiZXhwIjoyMDQzODAxODA1fQ.JV5TZYBwN1O8x9LJlZEAIr3H_LGEeYdW9EfGdDzRbLs';

console.log('🔧 Testing Password Reset Flow\n');

async function testPasswordResetFlow() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const testEmail = 's.foort@bonairemakelaars.com';
    const newPassword = 'TestPassword123!';
    
    console.log(`📧 Testing with email: ${testEmail}\n`);
    
    // Step 1: Check if user exists
    console.log('🔍 Step 1: Checking if user exists...');
    try {
        const { data: userData, error: userError } = await supabase
            .rpc('get_user_by_email', { user_email: testEmail });
        
        if (userError) {
            console.log('❌ Error checking user:', userError.message);
        } else {
            console.log('✅ User lookup successful:', userData ? 'User found' : 'User not found');
            if (userData) {
                console.log('   User ID:', userData.id || 'N/A');
                console.log('   Email:', userData.email || 'N/A');
            }
        }
    } catch (err) {
        console.log('❌ Exception checking user:', err.message);
    }
    
    // Step 2: Try to reset password using RPC
    console.log('\n🔐 Step 2: Testing password reset via RPC...');
    try {
        const { data: resetData, error: resetError } = await supabase
            .rpc('reset_user_password', { 
                user_email: testEmail,
                new_password: newPassword 
            });
        
        if (resetError) {
            console.log('❌ Error resetting password:', resetError.message);
        } else {
            console.log('✅ Password reset successful:', resetData);
        }
    } catch (err) {
        console.log('❌ Exception resetting password:', err.message);
    }
    
    // Step 3: Try admin updateUser
    console.log('\n👤 Step 3: Testing admin updateUser...');
    try {
        // First get user ID
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
            console.log('❌ Error listing users:', listError.message);
        } else {
            console.log('✅ Users list length:', users.users?.length || 0);
            
            const targetUser = users.users?.find(u => u.email === testEmail);
            if (targetUser) {
                console.log('✅ Found target user:', targetUser.id);
                
                // Try to update password
                const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
                    targetUser.id,
                    { password: newPassword }
                );
                
                if (updateError) {
                    console.log('❌ Error updating password:', updateError.message);
                } else {
                    console.log('✅ Password update successful');
                }
            } else {
                console.log('❌ Target user not found in users list');
            }
        }
    } catch (err) {
        console.log('❌ Exception with admin operations:', err.message);
    }
    
    // Step 4: Test login with new password
    console.log('\n🔑 Step 4: Testing login with new password...');
    try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: newPassword
        });
        
        if (loginError) {
            console.log('❌ Login failed:', loginError.message);
            console.log('   Error code:', loginError.status);
        } else {
            console.log('✅ Login successful!');
            console.log('   User ID:', loginData.user?.id);
            console.log('   Session:', loginData.session ? 'Created' : 'None');
        }
    } catch (err) {
        console.log('❌ Exception during login:', err.message);
    }
    
    // Step 5: Test with original password (if we know it)
    console.log('\n🔑 Step 5: Testing login with original password...');
    const originalPasswords = ['admin123', 'password', 'Admin123!', 'bonaire123'];
    
    for (const pwd of originalPasswords) {
        try {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: pwd
            });
            
            if (!loginError) {
                console.log(`✅ Login successful with password: ${pwd}`);
                break;
            } else {
                console.log(`❌ Failed with password: ${pwd} (${loginError.message})`);
            }
        } catch (err) {
            console.log(`❌ Exception with password: ${pwd} (${err.message})`);
        }
    }
    
    console.log('\n📊 Summary:');
    console.log('- If user lookup works but admin operations fail: Auth service issue');
    console.log('- If RPC works but auth doesn\'t: Schema corruption in auth tables'); 
    console.log('- If login fails with all passwords: User account may be corrupted');
    console.log('- Check Supabase dashboard for more details');
}

testPasswordResetFlow().catch(console.error);
