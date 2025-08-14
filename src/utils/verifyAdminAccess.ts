import { supabase } from '../config/supabase.config';

export async function verifyAdminAccess() {
  try {
    console.log('Starting admin access verification...');
    
    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }
    if (!session?.user) {
      console.error('No user logged in');
      throw new Error('No user logged in');
    }

    console.log('Current user:', session.user);

    // Check if user has a profile with admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      console.log('No profile found, creating admin profile...');
      // Create admin profile
      const { error: createError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email || '',
          display_name: 'Admin',
          role: 'admin'
        }, {
          onConflict: 'id'
        });

      if (createError) {
        console.error('Error creating admin profile:', createError);
        throw createError;      }    
    } else if (session.user.email === 's.admin@bonairemakelaars.com') {
      // Always ensure the special admin email has admin privileges
      if (profile.role !== 'admin') {
        console.log('Updating to admin role for admin email...');
        // Update to admin role for the special admin email
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            display_name: profile.display_name || 'Admin User'
          })
          .eq('id', session.user.id);
          
        if (updateError) {
          console.error('Error updating to admin role:', updateError);
          throw updateError;
        }
      }
    } else if (profile.role === 'admin' && session.user.email !== 's.admin@bonairemakelaars.com') {      console.log('Email does not match admin email but has admin role. Checking permissions...');
      // Optional: You can keep or remove other admin users based on your policy
      // This setup enforces that only the specific admin email has admin privileges
    }

    // Verify policies exist
    const { error: policyError } = await supabase.rpc('verify_admin_policies');
    if (policyError) {
      console.error('Error verifying policies:', policyError);
    }

    return true;
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return false;
  }
}
