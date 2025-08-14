import fetch from 'node-fetch';

// Supabase configuration
const SUPABASE_URL = 'https://imhtjggudeidvmpgwjho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';
const ADMIN_EMAIL = 's.admin@bonairemakelaars.com';
const NEW_PASSWORD = 'SuperSecure2025!@#$';

async function resetPasswordDirectSQL() {
  console.log(`🔑 DIRECT PASSWORD RESET FOR: ${ADMIN_EMAIL}\n`);
  
  try {
    console.log('1. Using Supabase Auth Admin API to reset password...');
    
    // Use the Supabase Auth Admin API directly
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(ADMIN_EMAIL)}/password`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({
          password: NEW_PASSWORD
        })
      }
    );
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ PASSWORD RESET SUCCESSFUL');
    } else {
      console.error(`❌ Error: ${response.status} - ${result}`);
      
      // Try alternative approach - Admin Update User endpoint
      console.log('\n2. Trying alternative approach - looking up user ID first...');
      
      // First get the user by email
      const userResponse = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(ADMIN_EMAIL)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      
      const userData = await userResponse.json();
      
      if (!userResponse.ok || !userData || userData.length === 0) {
        console.error(`❌ Error finding user: ${userResponse.status}`);
        return;
      }
      
      const userId = userData[0]?.id;
      console.log(`✅ User found with ID: ${userId}`);
      
      // Now update the user with the password
      const updateResponse = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          },
          body: JSON.stringify({
            password: NEW_PASSWORD,
            email_confirm: true
          })
        }
      );
      
      const updateResult = await updateResponse.text();
      
      if (updateResponse.ok) {
        console.log('✅ PASSWORD RESET SUCCESSFUL (alternative method)');
      } else {
        console.error(`❌ Error updating user: ${updateResponse.status} - ${updateResult}`);
        return;
      }
    }
    
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
  }
    
    console.log('✅ PASSWORD RESET SUCCESSFUL');
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
  }
}

// Execute the reset
resetPasswordDirectSQL();
