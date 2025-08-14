import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw'
)

const carouselSlides = [
  // BONAIRE SLIDES (5)
  {
    title: "Discover Paradise Living in Bonaire",
    description: "Pristine beaches, crystal clear waters, and your dream home await on this Caribbean gem",
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=bonaire",
    island: "bonaire",
    order_index: 1,
    is_active: true
  },
  {
    title: "Bonaire Waterfront Properties",
    description: "Wake up to stunning ocean views every morning in our exclusive waterfront homes",
    image_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=bonaire&type=waterfront",
    island: "bonaire",
    order_index: 2,
    is_active: true
  },
  {
    title: "Luxury Villas Bonaire",
    description: "Experience ultimate comfort in our premium villa collection with private pools and gardens",
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=bonaire&type=villa",
    island: "bonaire",
    order_index: 3,
    is_active: true
  },
  {
    title: "Bonaire Investment Opportunities",
    description: "Secure your future with prime real estate investments in this growing Caribbean market",
    image_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=bonaire&category=investment",
    island: "bonaire",
    order_index: 4,
    is_active: true
  },
  {
    title: "Bonaire Diving Paradise Homes",
    description: "Live where world-class diving meets luxury living - perfect for underwater enthusiasts",
    image_url: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=bonaire&feature=diving",
    island: "bonaire",
    order_index: 5,
    is_active: true
  },

  // ARUBA SLIDES (5)
  {
    title: "Aruba One Happy Island Living",
    description: "Experience year-round perfect weather and endless beaches in your new Aruba home",
    image_url: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=aruba",
    island: "aruba",
    order_index: 6,
    is_active: true
  },
  {
    title: "Eagle Beach Luxury Residences",
    description: "Live steps away from one of the world's most beautiful beaches in exclusive Eagle Beach properties",
    image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=aruba&location=eagle-beach",
    island: "aruba",
    order_index: 7,
    is_active: true
  },
  {
    title: "Aruba High-Rise Resort Area",
    description: "Modern condos and penthouses in the heart of Aruba's vibrant hotel and entertainment district",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=aruba&location=high-rise",
    island: "aruba",
    order_index: 8,
    is_active: true
  },
  {
    title: "Aruba Golf Course Communities",
    description: "Tee off from your backyard in premier golf course communities with championship courses",
    image_url: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=aruba&feature=golf",
    island: "aruba",
    order_index: 9,
    is_active: true
  },
  {
    title: "Aruba Wind-Powered Paradise",
    description: "Harness natural trade winds in eco-friendly homes designed for sustainable island living",
    image_url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=aruba&feature=eco-friendly",
    island: "aruba",
    order_index: 10,
    is_active: true
  },

  // CURACAO SLIDES (5)
  {
    title: "Colorful Curaçao Heritage Homes",
    description: "Own a piece of UNESCO World Heritage charm in historic Willemstad's iconic architecture",
    image_url: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=curacao",
    island: "curacao",
    order_index: 11,
    is_active: true
  },
  {
    title: "Curaçao Modern Seaside Living",
    description: "Contemporary beachfront properties combining Dutch elegance with Caribbean relaxation",
    image_url: "https://images.unsplash.com/photo-1582719200830-6d0fb5061509?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=curacao&type=modern",
    island: "curacao",
    order_index: 12,
    is_active: true
  },
  {
    title: "Curaçao Business District Properties",
    description: "Strategic commercial and residential properties in the growing business heart of the Caribbean",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=curacao&category=commercial",
    island: "curacao",
    order_index: 13,
    is_active: true
  },
  {
    title: "Curaçao Plantation Style Estates",
    description: "Expansive colonial-style estates with modern amenities set in lush tropical landscapes",
    image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=curacao&style=plantation",
    island: "curacao",
    order_index: 14,
    is_active: true
  },
  {
    title: "Curaçao Cultural Quarter Living",
    description: "Immerse yourself in vibrant local culture while enjoying modern amenities and historic charm",
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&q=80",
    link_url: "/properties?island=curacao&location=cultural-quarter",
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
    const { error: clearError } = await supabase
      .from('carousel_slides')
      .delete()
      .neq('id', 'keep-demo') // This won't match anything, so it clears all
    
    if (clearError) {
      console.log('⚠️  Warning clearing slides:', clearError.message)
    }
    
    // Insert new slides
    console.log('📥 Inserting new carousel slides...\n')
    
    for (const slide of carouselSlides) {
      console.log(`🖼️  Creating: "${slide.title}" (${slide.island.toUpperCase()})`)
      
      const { data, error } = await supabase
        .from('carousel_slides')
        .insert([slide])
        .select()
      
      if (error) {
        console.error(`❌ Error creating slide "${slide.title}":`, error.message)
      } else {
        console.log(`✅ Created successfully`)
      }
    }
    
    console.log('\n📊 SUMMARY:')
    
    // Get final count by island
    const { data: finalSlides, error: countError } = await supabase
      .from('carousel_slides')
      .select('island, title, is_active')
      .eq('is_active', true)
      .order('island', { ascending: true })
      .order('order_index', { ascending: true })
    
    if (countError) {
      console.error('❌ Error getting final count:', countError.message)
      return
    }
    
    const byIsland = finalSlides.reduce((acc, slide) => {
      const island = slide.island || 'unspecified'
      if (!acc[island]) acc[island] = []
      acc[island].push(slide.title)
      return acc
    }, {})
    
    Object.entries(byIsland).forEach(([island, slides]) => {
      console.log(`🏝️  ${island.toUpperCase()}: ${slides.length} slides`)
      slides.forEach((title, index) => {
        console.log(`   ${index + 1}. ${title}`)
      })
      console.log('')
    })
    
    console.log('🎉 All carousel slides created successfully!')
    console.log('\n💡 Next steps:')
    console.log('   1. Check your homepage to see the carousel')
    console.log('   2. Test the links to make sure they work')
    console.log('   3. Adjust images or content as needed through admin dashboard')
    
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

createCarouselSlides()
