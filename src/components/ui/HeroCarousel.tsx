import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useIslandCarousel, useMasterIsland } from '../../contexts/MasterIslandContext';
import { CarouselSlide } from '../../types';
import { CarouselClickTracker } from '../../services/carouselClickTracker';

interface LegacyCarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  overlayOpacity?: number;
}

// Default slides for the carousel (fallback)
const defaultSlides: LegacyCarouselSlide[] = [
  {
    id: 1,
    title: "Vind uw Droomhuis in de Caribbean",
    subtitle: "Ontdek prachtige woningen in Bonaire, Aruba en Curaçao",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
    overlayOpacity: 0.4
  },
  {
    id: 2,
    title: "Luxe Villa's in Aruba",
    subtitle: "Exclusieve woningen met uitzicht op de azuurblauwe zee",
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
    overlayOpacity: 0.5
  },
  {
    id: 3,
    title: "Moderne Appartementen in Curaçao",
    subtitle: "Comfortabel wonen in het hart van Willemstad",
    imageUrl: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
    overlayOpacity: 0.4
  },
  {
    id: 4,
    title: "Rustieke Huizen in Bonaire",
    subtitle: "Authentiek wonen in een natuurlijke omgeving",
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
    overlayOpacity: 0.5
  },
  {
    id: 5,
    title: "Strandhuizen met Panoramisch Uitzicht",
    subtitle: "Wake up to the sound of waves every morning",
    imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
    overlayOpacity: 0.4
  },
  {
    id: 6,
    title: "Investeringsmogelijkheden",
    subtitle: "Bouw uw vastgoedportfolio op in de Caribbean",
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
    overlayOpacity: 0.5
  },
  {
    id: 7,
    title: "Tropische Tuinhuizen",
    subtitle: "Geniet van privacy en natuur op uw eigen perceel",
    imageUrl: "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
    overlayOpacity: 0.4
  },
  {
    id: 8,
    title: "Penthouse Suites",
    subtitle: "Ultieme luxe met adembenemende uitzichten",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
    overlayOpacity: 0.5
  }
];

interface HeroCarouselProps {
  autoSlideInterval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
}

export function HeroCarousel({ 
  autoSlideInterval = 5000,
  showNavigation = true,
  showDots = true
}: HeroCarouselProps) {
  const { carouselSlides } = useIslandCarousel();
  const { selectedIsland } = useMasterIsland();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Use real slides or fallback to default, set island to selectedIsland
  const displaySlides = carouselSlides.length > 0 ? carouselSlides : defaultSlides.map(slide => ({
    id: slide.id.toString(),
    title: slide.title,
    description: slide.subtitle,
    image_url: slide.imageUrl,
    external_link: undefined,
    island: selectedIsland,
    is_active: true,
    display_order: slide.id,
    year: new Date().getFullYear(),
    always_visible: false,
    click_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  // Reset slide position when slides change
  useEffect(() => {
    setCurrentSlide(0);
  }, [displaySlides]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
  }, [displaySlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  }, [displaySlides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const handleSlideClick = async (slide: CarouselSlide) => {
    // Track the click using id
    await CarouselClickTracker.trackClick(slide.id);
    
    // Open external link if available
    if (slide.external_link) {
      window.open(slide.external_link, '_blank', 'noopener,noreferrer');
    }
  };

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, autoSlideInterval);
    return () => clearInterval(interval);
  }, [nextSlide, autoSlideInterval, isAutoPlaying]);

  // Pause auto-slide on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  if (displaySlides.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative h-[333px] max-w-4xl mx-auto overflow-hidden rounded-xl shadow-2xl bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500 text-lg">Laden van carousel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div 
        className="relative h-[333px] max-w-4xl mx-auto overflow-hidden rounded-xl shadow-2xl group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {displaySlides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`relative min-w-full h-full ${slide.external_link ? 'cursor-pointer' : ''}`}
            onClick={() => handleSlideClick(slide)}
          >
            {/* Background Image */}
            <img
              src={slide.image_url}
              alt="Carousel slide"
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
            
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black opacity-40"
            />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl mx-auto">
                {/* Content removed - no title or description */}
              </div>
            </div>
            
            {/* External Link Indicator - Bottom Right */}
            {slide.external_link && (
              <div className="absolute bottom-6 right-6 flex items-center gap-2 text-white bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full text-sm opacity-80 hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4" />
                <span>Klik om website te bezoeken</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showNavigation && displaySlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {showDots && displaySlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
        {currentSlide + 1} / {displaySlides.length}
      </div>
    </div>
    </div>
  );
}
