// Test the exact same calls as useFavorites to debug the issue
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function debugFavoritesCall() {
  console.log('🐛 Debugging the exact useFavorites calls...\n');
  
  try {
    // Step 1: Try to get session using anon client (like in useFavorites)
    console.log('1️⃣ Getting session with anon client...');
    const { data: { session }, error: sessionError } = await supabaseAnon.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return;
    }
    
    if (!session?.user) {
      console.log('❌ No active session found');
      return;
    }
    
    console.log('✅ Session found for user:', session.user.email);
    console.log('   User ID:', session.user.id);
    
    // Step 2: Try the exact query from useFavorites using service role
    console.log('\n2️⃣ Querying profiles with service role client...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('favorites')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile query error:', profileError);
      console.log('💡 This is likely the exact error you\'re seeing in the app');
      
      // Let's try different approaches
      console.log('\n3️⃣ Trying alternative queries...');
      
      // Try selecting all columns to see if favorites is accessible
      const { data: fullProfile, error: fullError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (fullError) {
        console.error('❌ Full profile query error:', fullError);
      } else {
        console.log('✅ Full profile data:', Object.keys(fullProfile));
        console.log('   Favorites in result:', 'favorites' in fullProfile);
        if ('favorites' in fullProfile) {
          console.log('   Favorites value:', fullProfile.favorites);
        }
      }
      
      // Try with anon client (might hit RLS policies)
      console.log('\n4️⃣ Trying with anon client (RLS policies apply)...');
      const { data: anonProfile, error: anonError } = await supabaseAnon
        .from('profiles')
        .select('favorites')
        .eq('id', session.user.id)
        .single();
      
      if (anonError) {
        console.error('❌ Anon client error:', anonError);
        console.log('💡 This suggests RLS policies might be the issue');
      } else {
        console.log('✅ Anon client worked:', anonProfile);
      }
      
    } else {
      console.log('✅ Profile query successful!');
      console.log('   Favorites data:', profile.favorites);
      console.log('   Type:', typeof profile.favorites);
      console.log('   Is Array:', Array.isArray(profile.favorites));
    }
    
    // Step 3: Try to update favorites (like toggleFavorite does)
    console.log('\n5️⃣ Testing favorites update...');
    const testFavorites = ['test-property-123'];
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ favorites: testFavorites })
      .eq('id', session.user.id);
    
    if (updateError) {
      console.error('❌ Update error:', updateError);
    } else {
      console.log('✅ Update successful!');
      
      // Reset back to empty
      await supabase
        .from('profiles')
        .update({ favorites: [] })
        .eq('id', session.user.id);
      console.log('🧹 Reset favorites to empty array');
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

debugFavoritesCall();
