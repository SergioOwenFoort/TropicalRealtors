// Test script to verify click tracking functionality
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testClickTracking() {
  console.log('🧪 Testing click tracking functionality...\n');

  try {
    // First, get a real slide to test with
    const { data: slides, error: fetchError } = await supabase
      .from('carousel_slides')
      .select('unique_id, title, click_count')
      .limit(1);

    if (fetchError || !slides || slides.length === 0) {
      console.log('❌ No slides found in database. Need to upload slides first.');
      return;
    }

    const testSlide = slides[0];
    console.log(`📍 Testing with slide: "${testSlide.title}" (${testSlide.unique_id})`);
    console.log(`📊 Current click count: ${testSlide.click_count || 0}\n`);

    // Test RPC function
    console.log('🔧 Testing RPC function...');
    const { error: rpcError } = await supabase.rpc('increment_carousel_click', {
      slide_unique_id: testSlide.unique_id
    });

    if (rpcError) {
      console.log('❌ RPC function failed:', rpcError.message);
      console.log('⚠️  You need to apply the database migration first!\n');
      
      // Test direct update fallback
      console.log('🔄 Testing direct update fallback...');
      const newClickCount = (testSlide.click_count || 0) + 1;
      
      const { error: updateError } = await supabase
        .from('carousel_slides')
        .update({ 
          click_count: newClickCount,
          last_clicked_at: new Date().toISOString()
        })
        .eq('unique_id', testSlide.unique_id);

      if (updateError) {
        console.log('❌ Direct update failed:', updateError.message);
        console.log('⚠️  You need to add click_count and last_clicked_at columns to the carousel_slides table!');
      } else {
        console.log('✅ Direct update successful!');
      }
    } else {
      console.log('✅ RPC function successful!');
    }

    // Verify the update
    const { data: updatedSlide } = await supabase
      .from('carousel_slides')
      .select('click_count, last_clicked_at')
      .eq('unique_id', testSlide.unique_id)
      .single();

    if (updatedSlide) {
      console.log(`📊 Updated click count: ${updatedSlide.click_count || 0}`);
      console.log(`⏰ Last clicked at: ${updatedSlide.last_clicked_at || 'Not set'}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testClickTracking();
