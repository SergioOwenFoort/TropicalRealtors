// Test Supabase admin connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('� Testing Supabase Admin Connection...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Service Key (first 20 chars):', serviceKey.substring(0, 20) + '...');

async function testConnection() {
  try {
    console.log('\n🧪 Test 1: Basic connection test');
    const { data: healthData, error: healthError } = await supabaseAdmin
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.log('❌ Basic connection failed:', healthError.message);
    } else {
      console.log('✅ Basic connection successful');
    }

    console.log('\n🧪 Test 2: Admin auth.admin.listUsers()');
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.log('❌ ListUsers failed:', listError);
      console.log('   Error status:', listError.status);
      console.log('   Error code:', listError.code);
      console.log('   Error message:', listError.message);
    } else {
      console.log('✅ ListUsers successful');
      console.log('   Total users:', users.users.length);
      
      // Check if our test email exists
      const testUser = users.users.find(u => u.email === 's.foort@bonairemakelaars.com');
      if (testUser) {
        console.log('✅ Found test user:', testUser.email);
        console.log('   User ID:', testUser.id);
        console.log('   Created:', testUser.created_at);
      } else {
        console.log('❌ Test user s.foort@bonairemakelaars.com not found');
        console.log('   Available users:');
        users.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.id})`);
        });
      }
    }

    console.log('\n🧪 Test 3: Admin auth.admin.generateLink()');
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: 's.foort@bonairemakelaars.com'
    });
    
    if (linkError) {
      console.log('❌ GenerateLink failed:', linkError);
      console.log('   Error status:', linkError.status);
      console.log('   Error code:', linkError.code);
      console.log('   Error message:', linkError.message);
    } else {
      console.log('✅ GenerateLink successful');
      console.log('   User ID from link:', linkData.user?.id);
      console.log('   Email from link:', linkData.user?.email);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testConnection();
