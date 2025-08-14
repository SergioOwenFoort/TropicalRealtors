// Create admin user for the new database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwmsihnepjvzwbrgrbdn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bXNpaG5lcGp2endicmdyYmRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDcyNjUyNywiZXhwIjoyMDcwMzAyNTI3fQ.l7i22sn2bx8jZGfHtz3V9MaigsmZC1y2fKIXUFWMZEI';

console.log('👤 Creating Admin User\n');

async function createAdminUser() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const adminEmail = 's.foort@bonairemakelaars.com';
    const adminPassword = 'admin123';
    
    console.log(`📧 Creating admin user: ${adminEmail}`);
    
    try {
        // Create the admin user
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true, // Auto-confirm the email
            user_metadata: {
                full_name: 'Sergio Foort',
                role: 'admin'
            }
        });
        
        if (userError) {
            console.log('❌ Error creating user:', userError.message);
            return;
        }
        
        console.log('✅ Admin user created successfully!');
        console.log('   User ID:', userData.user.id);
        console.log('   Email:', userData.user.email);
        console.log('   Email confirmed:', userData.user.email_confirmed_at ? 'Yes' : 'No');
        
        // Create profile for the admin user
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: userData.user.id,
                email: adminEmail,
                full_name: 'Sergio Foort',
                role: 'admin',
                company: 'Bonaire Makelaars',
                phone: '+599 717-8888'
            }]);
            
        if (profileError) {
            console.log('⚠️  Profile creation warning:', profileError.message);
        } else {
            console.log('✅ Admin profile created successfully!');
        }
        
    } catch (err) {
        console.log('❌ Exception:', err.message);
    }
    
    console.log('\n🎉 Admin user setup complete!');
    console.log('Login credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\nYou can now log in to test the password reset functionality.');
}

createAdminUser().catch(console.error);
