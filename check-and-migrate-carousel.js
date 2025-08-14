import { createClient } from '@supabase/supabase-js'

// Cloud configuration (your actual cloud database)
const cloudSupabase = createClient(
  'https://imhtjggudeidvmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0OTc5NDIsImV4cCI6MjA2NDA3Mzk0Mn0.ArTpMCR1hUP0P0EwQCCfjogswFvEbWZMXxidjNBwyIQ'
)

async function checkAndMigrateCarousel() {
  console.log('🔍 CHECKING CAROUSEL SLIDES IN CLOUD DATABASE\n')
  
  try {
    // Check cloud database
    const { data: cloudSlides, error: cloudError, count: cloudCount } = await cloudSupabase
      .from('carousel_slides')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: true })
    
    if (cloudError) {
      console.error('❌ Error accessing cloud carousel_slides:', cloudError.message)
      return
    }
    
    console.log(`📊 Cloud database has ${cloudCount} carousel slides`)
    
    if (cloudSlides && cloudSlides.length > 0) {
      console.log('\n✅ SLIDES FOUND IN CLOUD DATABASE:')
      cloudSlides.forEach((slide, index) => {
        console.log(`   ${index + 1}. "${slide.title}" (${slide.island}) - ${slide.is_active ? 'Active' : 'Inactive'}`)
      })
      
      console.log('\n📊 Summary by island:')
      const byIsland = cloudSlides.reduce((acc, slide) => {
        acc[slide.island] = (acc[slide.island] || 0) + 1
        return acc
      }, {})
      
      Object.entries(byIsland).forEach(([island, count]) => {
        console.log(`   🏝️ ${island.toUpperCase()}: ${count} slides`)
      })
      
      console.log('\n✅ No migration needed - slides already exist in cloud!')
    } else {
      console.log('\n⚠️ NO SLIDES FOUND IN CLOUD DATABASE')
      console.log('🚀 Creating default carousel slides...\n')
      
      // Create default slides for all islands
      const defaultSlides = [
        // Bonaire slides
        {
          title: "Welkom op Bonaire",
          description: "Ontdek het prachtige eiland Bonaire met zijn kristalheldere wateren en unieke natuur.",
          image_url: "https://images.unsplash.com/photo-1580837119756-563d608dd119?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/properties?island=bonaire",
          island: "bonaire",
          is_active: true,
          display_order: 1,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        {
          title: "Bonaire Vastgoed",
          description: "Vind uw droomhuis op het mooiste eiland van de Caribbean.",
          image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/properties?island=bonaire&type=sale",
          island: "bonaire",
          is_active: true,
          display_order: 2,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        {
          title: "Huur op Bonaire",
          description: "Prachtige huurwoningen in alle prijsklassen beschikbaar.",
          image_url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/properties?island=bonaire&type=rental",
          island: "bonaire",
          is_active: true,
          display_order: 3,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        {
          title: "Bonaire Makelaar",
          description: "Professionele begeleiding bij het kopen of verkopen van uw woning.",
          image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/makelaars?island=bonaire",
          island: "bonaire",
          is_active: true,
          display_order: 4,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        {
          title: "Investeren op Bonaire",
          description: "Ontdek de mogelijkheden voor vastgoed investeringen op Bonaire.",
          image_url: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/properties?island=bonaire&category=investment",
          island: "bonaire",
          is_active: true,
          display_order: 5,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        
        // Aruba slides
        {
          title: "Welkom op Aruba",
          description: "Het One Happy Island met eeuwige zomer en prachtige stranden.",
          image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/properties?island=aruba",
          island: "aruba",
          is_active: true,
          display_order: 6,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        {
          title: "Aruba Vastgoed",
          description: "Luxe woningen en appartementen op het mooiste eiland van het Caribisch gebied.",
          image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/properties?island=aruba&type=sale",
          island: "aruba",
          is_active: true,
          display_order: 7,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        {
          title: "Huur op Aruba",
          description: "Van strandappartementen tot luxe villa's - alles is mogelijk op Aruba.",
          image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/properties?island=aruba&type=rental",
          island: "aruba",
          is_active: true,
          display_order: 8,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        {
          title: "Aruba Makelaar",
          description: "Ervaren makelaars die u helpen bij het vinden van uw droomhuis.",
          image_url: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/makelaars?island=aruba",
          island: "aruba",
          is_active: true,
          display_order: 9,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        {
          title: "Investeren op Aruba",
          description: "Uitstekende investeringsmogelijkheden in toerisme en vastgoed.",
          image_url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/properties?island=aruba&category=investment",
          island: "aruba",
          is_active: true,
          display_order: 10,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        
        // Curaçao slides
        {
          title: "Welkom op Curaçao",
          description: "Het kleurrijke eiland met rijke geschiedenis en prachtige architectuur.",
          image_url: "https://images.unsplash.com/photo-1562737036-46a8df2a07e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/properties?island=curacao",
          island: "curacao",
          is_active: true,
          display_order: 11,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        {
          title: "Curaçao Vastgoed",
          description: "Van historische panden tot moderne villa's in Willemstad en omgeving.",
          image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/properties?island=curacao&type=sale",
          island: "curacao",
          is_active: true,
          display_order: 12,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        {
          title: "Huur op Curaçao",
          description: "Woningen en appartementen in de meest gewilde wijken van het eiland.",
          image_url: "https://images.unsplash.com/photo-1551524164-6cf2ac10b485?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/properties?island=curacao&type=rental",
          island: "curacao",
          is_active: true,
          display_order: 13,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        {
          title: "Curaçao Makelaar",
          description: "Lokale expertise voor het kopen en verkopen van vastgoed op Curaçao.",
          image_url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/makelaars?island=curacao",
          island: "curacao",
          is_active: true,
          display_order: 14,
          period_number: 1,
          year: 2025,
          always_visible: false
        },
        {
          title: "Investeren op Curaçao",
          description: "Ontdek de kansen in het groeiende vastgoedmarktsegment van Curaçao.",
          image_url: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
          external_link: "/properties?island=curacao&category=investment",
          island: "curacao",
          is_active: true,
          display_order: 15,
          period_number: 1,
          year: 2025,
          always_visible: false
        }
      ]
      
      // Insert slides into cloud database
      console.log('📤 Inserting default carousel slides into cloud database...\n')
      
      for (let i = 0; i < defaultSlides.length; i++) {
        const slide = defaultSlides[i]
        console.log(`🖼️ Adding slide ${i + 1}/15: ${slide.title} (${slide.island})`)
        
        const { data, error } = await cloudSupabase
          .from('carousel_slides')
          .insert([slide])
          .select()
        
        if (error) {
          console.error(`❌ Error adding slide "${slide.title}":`, error.message)
        } else {
          console.log(`   ✅ Successfully added`)
        }
      }
      
      // Verify results
      console.log('\n📊 Verification - checking created slides...')
      const { data: verifySlides, count: verifyCount } = await cloudSupabase
        .from('carousel_slides')
        .select('*', { count: 'exact' })
        .order('display_order')
      
      console.log(`\n🎉 Total slides in cloud database: ${verifyCount}`)
      
      if (verifySlides && verifySlides.length > 0) {
        const byIsland = verifySlides.reduce((acc, slide) => {
          acc[slide.island] = (acc[slide.island] || 0) + 1
          return acc
        }, {})
        
        console.log('\n📋 Summary by island:')
        Object.entries(byIsland).forEach(([island, count]) => {
          console.log(`   🏝️ ${island.toUpperCase()}: ${count} slides`)
        })
      }
      
      console.log('\n✨ Migration completed successfully!')
      console.log('🎯 Your carousel slides are now available in the cloud database!')
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

checkAndMigrateCarousel()
