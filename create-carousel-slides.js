import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw'
)

const carouselSlides = [
  // BONAIRE SLIDES (5)
  {
    title: "Discover Paradise in Bonaire",
    description: "Pristine beaches, crystal clear waters, and your dream home awaits",
    image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=bonaire",
    island: "bonaire",
    order_index: 1,
    is_active: true
  },
  {
    title: "Bonaire Beachfront Properties",
    description: "Wake up to stunning ocean views every morning",
    image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=bonaire&type=beachfront",
    island: "bonaire",
    order_index: 2,
    is_active: true
  },
  {
    title: "Bonaire Diving Paradise Homes",
    description: "Live where world-class diving is at your doorstep",
    image_url: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=bonaire&feature=diving",
    island: "bonaire",
    order_index: 3,
    is_active: true
  },
  {
    title: "Bonaire Luxury Villas",
    description: "Experience ultimate comfort in Caribbean luxury",
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=bonaire&type=villa",
    island: "bonaire",
    order_index: 4,
    is_active: true
  },
  {
    title: "Bonaire Investment Opportunities",
    description: "Secure your future with prime Caribbean real estate",
    image_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=bonaire&category=investment",
    island: "bonaire",
    order_index: 5,
    is_active: true
  },

  // ARUBA SLIDES (5)
  {
    title: "Aruba One Happy Island Living",
    description: "Find your perfect home on the happiest island in the Caribbean",
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=aruba",
    island: "aruba",
    order_index: 6,
    is_active: true
  },
  {
    title: "Aruba Palm Beach Condos",
    description: "Luxury living on world-famous Palm Beach",
    image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=aruba&location=palm-beach",
    island: "aruba",
    order_index: 7,
    is_active: true
  },
  {
    title: "Aruba Eagle Beach Properties",
    description: "Own a piece of one of the world's best beaches",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=aruba&location=eagle-beach",
    island: "aruba",
    order_index: 8,
    is_active: true
  },
  {
    title: "Aruba Golf Course Homes",
    description: "Live on pristine fairways with ocean views",
    image_url: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=aruba&feature=golf",
    island: "aruba",
    order_index: 9,
    is_active: true
  },
  {
    title: "Aruba Resort-Style Living",
    description: "Every day feels like a vacation in these exclusive communities",
    image_url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=aruba&type=resort",
    island: "aruba",
    order_index: 10,
    is_active: true
  },

  // CURACAO SLIDES (5)
  {
    title: "Curacao Historic Charm",
    description: "UNESCO World Heritage living in colorful Willemstad",
    image_url: "https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=curacao",
    island: "curacao",
    order_index: 11,
    is_active: true
  },
  {
    title: "Curacao Penthouse Paradise",
    description: "Spectacular city and ocean views from luxury penthouses",
    image_url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=curacao&type=penthouse",
    island: "curacao",
    order_index: 12,
    is_active: true
  },
  {
    title: "Curacao Marina Living",
    description: "Waterfront lifestyle with yacht access and luxury amenities",
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=curacao&feature=marina",
    island: "curacao",
    order_index: 13,
    is_active: true
  },
  {
    title: "Curacao Business Opportunities",
    description: "Commercial and mixed-use properties in thriving economic zones",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=curacao&category=commercial",
    island: "curacao",
    order_index: 14,
    is_active: true
  },
  {
    title: "Curacao Countryside Estates",
    description: "Spacious homes with panoramic views and tropical gardens",
    image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=400&fit=crop&crop=entropy&cs=tinysrgb",
    link_url: "/properties?island=curacao&type=estate",
    island: "curacao",
    order_index: 15,
    is_active: true
  }
]

async function createCarouselSlides() {
  console.log('🎠 Creating carousel slides for all islands...\n')
  
  try {
    // First, clear existing slides (except the demo one if you want to keep it)
    console.log('🧹 Clearing existing slides...')
    const { error: deleteError } = await supabase
      .from('carousel_slides')
      .delete()
      .neq('id', 'keep-none') // Delete all
    
    if (deleteError) {
      console.error('⚠️  Warning clearing slides:', deleteError.message)
    } else {
      console.log('✅ Cleared existing slides')
    }
    
    // Insert new slides
    console.log('📥 Adding new carousel slides...\n')
    
    for (let i = 0; i < carouselSlides.length; i++) {
      const slide = carouselSlides[i]
      console.log(`🖼️  Adding slide ${i + 1}/15: ${slide.title}`)
      
      const { data, error } = await supabase
        .from('carousel_slides')
        .insert([slide])
        .select()
      
      if (error) {
        console.error(`❌ Error adding slide "${slide.title}":`, error.message)
      } else {
        console.log(`   ✅ Successfully added for ${slide.island.toUpperCase()}`)
      }
    }
    
    // Verify the results
    console.log('\n📊 Verification - checking created slides...')
    const { data: allSlides, count } = await supabase
      .from('carousel_slides')
      .select('*', { count: 'exact' })
      .order('order_index')
    
    console.log(`\n🎉 Total slides created: ${count}`)
    
    // Summary by island
    const byIsland = allSlides.reduce((acc, slide) => {
      acc[slide.island] = (acc[slide.island] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📋 Summary by island:')
    Object.entries(byIsland).forEach(([island, count]) => {
      console.log(`   🏝️  ${island.toUpperCase()}: ${count} slides`)
    })
    
    console.log('\n✨ All carousel slides have been created successfully!')
    console.log('🎯 Next steps:')
    console.log('   1. Check your homepage to see the carousel in action')
    console.log('   2. Admin dashboard now has all 15 slides to manage')
    console.log('   3. Each island has 5 unique, themed slides with proper URLs')
    
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

createCarouselSlides()
