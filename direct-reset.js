import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = 'https://imhtjggudeidvmpgwjho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';
const ADMIN_EMAIL = 's.admin@bonairemakelaars.com';
const NEW_PASSWORD = 'SuperSecure2025!@#$';

async function directPasswordReset() {
  console.log('🔑 Direct password reset via Auth API...');
  
  try {
    // Step 1: Find the user UUID first
    console.log('1️⃣ Finding user by email...');
    const findUserResponse = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(ADMIN_EMAIL)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!findUserResponse.ok) {
      const errorText = await findUserResponse.text();
      throw new Error(`Failed to find user: ${findUserResponse.status} - ${errorText}`);
    }
    
    const users = await findUserResponse.json();
    
    if (!users || users.length === 0) {
      throw new Error('User not found with email: ' + ADMIN_EMAIL);
    }
    
    const userId = users[0].id;
    console.log(`✓ Found user with ID: ${userId}`);
    
    // Step 2: Update the password directly using the Auth API
    console.log('2️⃣ Updating password...');
    const updateResponse = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: NEW_PASSWORD,
          email_confirm: true
        })
      }
    );
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update password: ${updateResponse.status} - ${errorText}`);
    }
    
    console.log('✅ PASSWORD RESET SUCCESSFUL!');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

// Execute the direct password reset
directPasswordReset();
