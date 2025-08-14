import { createClient } from '@supabase/supabase-js'

const cloudSupabase = createClient(
  'https://imhtjggudeivmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw'
)

async function findMissingCarouselSlides() {
  console.log('🔍 Searching for your missing carousel slides in cloud database...\n')
  
  try {
    // Check cloud database for carousel slides
    const { data: cloudSlides, error, count } = await cloudSupabase
      .from('carousel_slides')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('❌ Error connecting to cloud database:', error.message)
      return
    }
    
    console.log(`🎠 Found ${count} carousel slides in CLOUD database:\n`)
    
    if (cloudSlides && cloudSlides.length > 0) {
      cloudSlides.forEach((slide, index) => {
        console.log(`🖼️  CLOUD SLIDE ${index + 1}:`)
        console.log(`   ├─ ID: ${slide.id}`)
        console.log(`   ├─ Title: "${slide.title || 'No title'}"`)
        console.log(`   ├─ Description: "${slide.description || 'No description'}"`)
        console.log(`   ├─ Image URL: ${slide.image_url || 'No image'}`)
        console.log(`   ├─ Island: ${slide.island || 'No island'}`)
        console.log(`   ├─ Active: ${slide.is_active ? '✅ Yes' : '❌ No'}`)
        console.log(`   └─ Created: ${new Date(slide.created_at).toLocaleDateString()}`)
        console.log('')
      })
      
      console.log('🔄 RECOVERY OPTIONS:')
      console.log('   1. Run migration again to recover these slides')
      console.log('   2. Manually recreate them in local database')
      console.log('   3. Copy them one by one from cloud to local')
      
    } else {
      console.log('⚠️  NO CAROUSEL SLIDES FOUND in cloud database either!')
      console.log('\n💭 This means:')
      console.log('   - Your slides were only created locally')
      console.log('   - They were lost when the local database was reset/recreated')
      console.log('   - You will need to recreate them manually')
    }
    
  } catch (err) {
    console.error('❌ Connection error:', err.message)
    console.log('\n💡 This could mean:')
    console.log('   - The URL or key is incorrect')
    console.log('   - The cloud database is not accessible')
    console.log('   - Network connection issues')
  }
}

findMissingCarouselSlides()
