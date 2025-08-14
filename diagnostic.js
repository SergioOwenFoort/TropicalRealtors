// Debug script to test Supabase connection and data fetching
import { supabase } from './src/config/supabase.config.js';

console.log('🔍 Starting diagnostic test...');
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');

async function runDiagnostics() {
  try {
    console.log('\n📡 Testing connection to Supabase...');
    
    // Test 1: Simple properties fetch
    console.log('\n1️⃣ Fetching all properties...');
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('*');
      
    if (propError) {
      console.error('❌ Properties fetch error:', propError);
    } else {
      console.log('✅ Properties fetch successful!');
      console.log('📊 Properties count:', properties?.length || 0);
      console.log('📋 Properties data:', properties);
    }
    
    // Test 2: Featured properties
    console.log('\n2️⃣ Fetching featured properties...');
    const { data: featured, error: featError } = await supabase
      .from('properties')
      .select('*')
      .eq('featured', true);
      
    if (featError) {
      console.error('❌ Featured properties fetch error:', featError);
    } else {
      console.log('✅ Featured properties fetch successful!');
      console.log('📊 Featured properties count:', featured?.length || 0);
      console.log('📋 Featured properties data:', featured);
    }
    
    // Test 3: Realtors fetch
    console.log('\n3️⃣ Fetching realtors...');
    const { data: realtors, error: realtorError } = await supabase
      .from('realtors')
      .select('*');
      
    if (realtorError) {
      console.error('❌ Realtors fetch error:', realtorError);
    } else {
      console.log('✅ Realtors fetch successful!');
      console.log('📊 Realtors count:', realtors?.length || 0);
    }
    
    // Test 4: Profiles fetch
    console.log('\n4️⃣ Fetching profiles...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profileError) {
      console.error('❌ Profiles fetch error:', profileError);
    } else {
      console.log('✅ Profiles fetch successful!');
      console.log('📊 Profiles count:', profiles?.length || 0);
    }
    
  } catch (error) {
    console.error('💥 Diagnostic failed:', error);
  }
}

runDiagnostics();
