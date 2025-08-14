// QUICK FIX: Test your Supabase connection and carousel data
// Run this in your browser console (F12) to diagnose the issues

console.log('🔍 QUICK DIAGNOSTIC TEST');

// Test 1: Check Supabase connection
import { supabase } from './src/config/supabase.config';

console.log('Testing Supabase connection...');
supabase
  .from('carousel_slides')
  .select('*')
  .limit(5)
  .then(({ data, error }) => {
    console.log('📊 Carousel slides query result:');
    console.log('  - Data count:', data?.length || 0);
    console.log('  - Error:', error);
    console.log('  - Sample data:', data);
    
    if (data && data.length > 0) {
      console.log('✅ Connection working, found slides');
      console.log('🏝️ Islands in data:', [...new Set(data.map(d => d.island))]);
      console.log('📅 Periods in data:', [...new Set(data.map(d => d.period_number))]);
    } else {
      console.log('❌ No slides found or connection issue');
    }
  });

// Test 2: Check current island context
console.log('🏝️ Current page island context:');
console.log('  - URL:', window.location.pathname);
console.log('  - Expected island:', window.location.pathname.includes('aruba') ? 'aruba' : 
                                    window.location.pathname.includes('bonaire') ? 'bonaire' : 
                                    window.location.pathname.includes('curacao') ? 'curacao' : 'unknown');

console.log('🏁 Test complete - check results above');
