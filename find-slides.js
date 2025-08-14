import { createClient } from '@supabase/supabase-js'

// Cloud database connection - using the CORRECT URL
const cloudSupabase = createClient(
  'https://imhtjggudeivmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw'
)

async function findYourSlides() {
  console.log('🔍 SEARCHING FOR YOUR LOST CAROUSEL SLIDES')
  console.log('📡 Connecting to cloud database with CORRECT URL...\n')
  
  try {
    const { data: cloudSlides, error: cloudError } = await cloudSupabase
      .from('carousel_slides')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (cloudError) {
      console.error(`❌ Cloud connection error: ${cloudError.message}`)
      console.log('\n🤔 Possible issues:')
      console.log('   - URL might still be incorrect')
      console.log('   - Service key might be expired')
      console.log('   - Network connection issue')
      return
    }
    
    console.log(`📊 Found ${cloudSlides?.length || 0} slides in CLOUD database`)
    
    if (cloudSlides && cloudSlides.length > 0) {
      console.log('\n🎉 SUCCESS! FOUND YOUR MISSING SLIDES! 🎉\n')
      
      cloudSlides.forEach((slide, index) => {
        console.log(`🖼️  SLIDE ${index + 1}:`)
        console.log(`   ├─ Title: "${slide.title}"`)
        console.log(`   ├─ Description: "${slide.description || 'No description'}"`)
        console.log(`   ├─ Image: ${slide.image_url}`)
        console.log(`   ├─ Island: ${slide.island || 'Not specified'}`)
        console.log(`   ├─ Active: ${slide.is_active ? '✅' : '❌'}`)
        console.log(`   └─ Created: ${new Date(slide.created_at).toLocaleString()}`)
        console.log('')
      })
      
      console.log('💾 RECOVERY READY!')
      console.log('   We can now migrate these slides to your local database')
      console.log('   This will restore all your carousel slides')
      
    } else {
      console.log('\n😞 No slides found in cloud database')
      console.log('💭 This means your slides were created only locally and are now lost')
      console.log('🛠️  Solution: Recreate them through the admin dashboard')
    }
    
  } catch (err) {
    console.error('❌ ERROR:', err.message)
    if (err.message.includes('fetch failed')) {
      console.log('\n🌐 Network/URL issue detected')
      console.log('   The URL might be incorrect or the service might be down')
    }
  }
}

findYourSlides()
