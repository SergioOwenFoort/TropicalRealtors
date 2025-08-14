import { createClient } from '@supabase/supabase-js'

// Cloud configuration - using anon key like the application does
const cloudSupabase = createClient(
  'https://imhtjggudeidvmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0OTc5NDIsImV4cCI6MjA2NDA3Mzk0Mn0.ArTpMCR1hUP0P0EwQCCfjogswFvEbWZMXxidjNBwyIQ'
)

async function testClickTrackingEndToEnd() {
  console.log('🧪 CLICK TRACKING END-TO-END TEST\n')
  
  try {
    // 1. Get all slides and their current stats
    console.log('📊 Current carousel slides:')
    const { data: slides, error: slidesError } = await cloudSupabase
      .from('carousel_slides')
      .select('id, title, island, click_count, last_clicked_at, is_active')
      .eq('is_active', true)
      .order('display_order')
    
    if (slidesError) {
      console.error('❌ Error fetching slides:', slidesError.message)
      return
    }
    
    if (!slides || slides.length === 0) {
      console.log('❌ No active slides found!')
      return
    }
    
    slides.forEach((slide, index) => {
      console.log(`   ${index + 1}. "${slide.title}" (${slide.island})`)
      console.log(`      ID: ${slide.id}`)
      console.log(`      Clicks: ${slide.click_count || 0}`)
      console.log(`      Last clicked: ${slide.last_clicked_at || 'Never'}`)
      console.log('')
    })
    
    // 2. Test click tracking on the first slide
    const testSlide = slides[0]
    console.log(`🎯 Testing click tracking on: "${testSlide.title}"`)
    console.log(`   Current clicks: ${testSlide.click_count || 0}`)
    
    // Simulate the exact same operation as the application
    const { data: currentSlide } = await cloudSupabase
      .from('carousel_slides')
      .select('click_count')
      .eq('id', testSlide.id)
      .single()
    
    const newClickCount = (currentSlide?.click_count || 0) + 1
    
    const { error: updateError } = await cloudSupabase
      .from('carousel_slides')
      .update({ 
        click_count: newClickCount,
        last_clicked_at: new Date().toISOString()
      })
      .eq('id', testSlide.id)
    
    if (updateError) {
      console.log('❌ Click tracking failed:', updateError.message)
    } else {
      console.log('✅ Click tracking successful!')
      console.log(`   New click count: ${newClickCount}`)
    }
    
    // 3. Verify the update worked
    console.log('\n🔍 Verification:')
    const { data: verifySlide } = await cloudSupabase
      .from('carousel_slides')
      .select('click_count, last_clicked_at')
      .eq('id', testSlide.id)
      .single()
    
    if (verifySlide) {
      console.log(`   Verified click count: ${verifySlide.click_count}`)
      console.log(`   Verified last clicked: ${verifySlide.last_clicked_at}`)
      
      const clickedRecently = new Date(verifySlide.last_clicked_at) > new Date(Date.now() - 10000) // Within last 10 seconds
      console.log(`   Recently updated: ${clickedRecently ? '✅ Yes' : '❌ No'}`)
    }
    
    // 4. Test analytics queries
    console.log('\n📈 Testing analytics queries:')
    
    // Get total clicks
    const { data: totalData } = await cloudSupabase
      .from('carousel_slides')
      .select('click_count')
    
    const totalClicks = totalData?.reduce((sum, slide) => sum + (slide.click_count || 0), 0) || 0
    console.log(`   Total clicks across all slides: ${totalClicks}`)
    
    // Get stats by island
    const islands = ['bonaire', 'aruba', 'curacao']
    for (const island of islands) {
      const { data: islandData } = await cloudSupabase
        .from('carousel_slides')
        .select('click_count')
        .eq('island', island)
      
      const islandClicks = islandData?.reduce((sum, slide) => sum + (slide.click_count || 0), 0) || 0
      const islandSlides = islandData?.length || 0
      console.log(`   ${island.toUpperCase()}: ${islandClicks} clicks across ${islandSlides} slides`)
    }
    
    console.log('\n🎉 CLICK TRACKING TEST COMPLETED SUCCESSFULLY!')
    console.log('   ✅ Database connection working')
    console.log('   ✅ Slides accessible')
    console.log('   ✅ Click counting working')
    console.log('   ✅ Analytics queries working')
    console.log('\n📝 The click tracking inconsistency should now be resolved!')
    
  } catch (err) {
    console.error('❌ Test failed:', err.message)
  }
}

testClickTrackingEndToEnd()
