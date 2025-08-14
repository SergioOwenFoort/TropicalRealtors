import { createClient } from '@supabase/supabase-js'

// Cloud configuration with service role for admin operations
const cloudSupabase = createClient(
  'https://imhtjggudeidvmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function fixClickTrackingRPC() {
  console.log('🔧 FIXING CLICK TRACKING RPC FUNCTION\n')
  
  try {
    // Get a test slide ID
    const { data: slides, error: slidesError } = await cloudSupabase
      .from('carousel_slides')
      .select('id, title, click_count')
      .limit(1)
    
    if (slidesError || !slides || slides.length === 0) {
      console.error('❌ Cannot get test slide:', slidesError?.message || 'No slides found')
      return
    }
    
    const testSlide = slides[0]
    console.log(`🎯 Test slide: "${testSlide.title}" (${testSlide.id})`)
    console.log(`   Current clicks: ${testSlide.click_count || 0}`)
    
    // Test 1: Try direct update to verify table access
    console.log('\n📊 Test 1: Direct update (to verify permissions)...')
    
    const { data: updateResult, error: updateError } = await cloudSupabase
      .from('carousel_slides')
      .update({ 
        click_count: (testSlide.click_count || 0) + 1,
        last_clicked_at: new Date().toISOString()
      })
      .eq('id', testSlide.id)
      .select('id, title, click_count, last_clicked_at')
    
    if (updateError) {
      console.log('❌ Direct update failed:', updateError.message)
    } else {
      console.log('✅ Direct update successful!')
      console.log(`   New click count: ${updateResult[0]?.click_count}`)
    }
    
    // Test 2: Try RPC with different parameter formats
    console.log('\n🔧 Test 2: Testing RPC function variations...')
    
    const rpcTests = [
      { name: 'slide_id', params: { slide_id: testSlide.id } },
      { name: 'slideid', params: { slideid: testSlide.id } },
      { name: 'id', params: { id: testSlide.id } }
    ]
    
    for (const test of rpcTests) {
      try {
        console.log(`   Testing parameter: ${test.name}`)
        const { data: rpcResult, error: rpcError } = await cloudSupabase
          .rpc('increment_carousel_click', test.params)
        
        if (rpcError) {
          console.log(`     ❌ Failed: ${rpcError.message}`)
        } else {
          console.log(`     ✅ Success! Click count: ${rpcResult?.click_count}`)
          break
        }
      } catch (error) {
        console.log(`     ❌ Error: ${error.message}`)
      }
    }
    
    // Test 3: Check current click count to see if anything worked
    console.log('\n📈 Final verification...')
    
    const { data: finalCheck } = await cloudSupabase
      .from('carousel_slides')
      .select('click_count, last_clicked_at')
      .eq('id', testSlide.id)
      .single()
    
    if (finalCheck) {
      console.log(`   Final click count: ${finalCheck.click_count}`)
      console.log(`   Last clicked: ${finalCheck.last_clicked_at || 'Never'}`)
      
      if (finalCheck.click_count > testSlide.click_count) {
        console.log('\n🎉 SUCCESS: Click tracking is working!')
        console.log('   The inconsistency was likely due to RPC function parameters.')
        console.log('   Your click tracking should now work properly in the application.')
      } else {
        console.log('\n⚠️ Click count unchanged - need manual RPC function fix')
      }
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

fixClickTrackingRPC()
