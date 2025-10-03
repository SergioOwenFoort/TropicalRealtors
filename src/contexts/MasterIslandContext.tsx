import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { supabase } from '../config/supabase.config';
import { Property } from '../types';
import { CarouselSlide } from '../types';
import { mapDbToProperty } from '../services/propertyService';
import { detectUserIsland } from '../utils/locationDetection';
import { MOCK_LISTINGS } from '../data/mockProperties';

// Define the island type
type Island = 'aruba' | 'bonaire' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten';

// Define the complete island data structure
interface IslandData {
  // Core data
  properties: Property[];
  featuredProperties: Property[];
  realtors: any[];
  carouselSlides: CarouselSlide[];
  
  // Locations and menu data
  locations: string[];
  menuItems: {
    koop: string[];
    huur: string[];
    informatie: string[];
  };
  
  // Island-specific configuration
  config: {
    name: string;
    flag: string;
    currency: string;
    language: string;
    contactInfo: {
      phone: string;
      email: string;
      address: string;
    };
  };
  
  // Loading states
  loading: {
    properties: boolean;
    realtors: boolean;
    carousel: boolean;
    all: boolean;
  };
  
  // Error states
  errors: {
    properties: string | null;
    realtors: string | null;
    carousel: string | null;
  };
}

// Define the context type
interface MasterIslandContextType {
  selectedIsland: Island;
  islandData: IslandData;
  switchIsland: (island: Island) => void;
  refreshIslandData: (island?: Island) => void;
  isLoading: boolean;
  hasErrors: boolean;
}

// Create the context
const MasterIslandContext = createContext<MasterIslandContextType | undefined>(undefined);

// Island configurations
const ISLAND_CONFIGS = {
  aruba: {
    name: 'Aruba',
    flag: '🇦🇼',
    currency: 'AWG',
    language: 'nl',
    contactInfo: {
      phone: '+297 582 1234',
      email: 'info@arubamakelaars.com',
      address: 'Oranjestad, Aruba'
    }
  },
  bonaire: {
    name: 'Bonaire',
    flag: '🇧🇶',
    currency: 'USD',
    language: 'nl',
    contactInfo: {
      phone: '+599 717 1234',
      email: 'info@tropicalrealtors.com',
      address: 'Kralendijk, Bonaire'
    }
  },
  curacao: {
    name: 'Curaçao',
    flag: '🇨🇼',
    currency: 'ANG',
    language: 'nl',
    contactInfo: {
      phone: '+599 9 461 1234',
      email: 'info@curacaomakelaars.com',
      address: 'Willemstad, Curaçao'
    }
  },
  saba: {
    name: 'Saba',
    flag: '🇸🇦',
    currency: 'USD',
    language: 'nl/en',
    contactInfo: {
      phone: '+599 416 1234',
      email: 'info@sabamakelaars.com',
      address: 'The Bottom, Saba'
    }
  },
  'sint-eustatius': {
    name: 'Sint Eustatius',
    flag: '🇧🇶',
    currency: 'USD',
    language: 'nl/en',
    contactInfo: {
      phone: '+599 318 1234',
      email: 'info@steustatiusmakelaars.com',
      address: 'Oranjestad, Sint Eustatius'
    }
  },
  'sint-maarten': {
    name: 'Sint Maarten',
    flag: '🇸🇽',
    currency: 'ANG',
    language: 'nl/en',
    contactInfo: {
      phone: '+1 721 542 1234',
      email: 'info@sintmaartenmakelaars.com',
      address: 'Philipsburg, Sint Maarten'
    }
  }
} as const;

// Menu configurations per island
const ISLAND_MENUS = {
  aruba: {
    koop: ['Huizen', 'Appartementen', 'Villa\'s', 'Penthouse', 'Gronden'],
    huur: ['Huizen', 'Appartementen', 'Villa\'s', 'Penthouse', 'Kantoren'],
    informatie: ['Over Aruba', 'Belastingen', 'Financiering', 'Verhuisservice', 'Contact']
  },
  bonaire: {
    koop: ['Huizen', 'Appartementen', 'Villa\'s', 'Gronden', 'Commercieel'],
    huur: ['Huizen', 'Appartementen', 'Villa\'s', 'Kantoren', 'Vakantiewoningen'],
    informatie: ['Over Bonaire', 'Belastingen', 'Financiering', 'Wonen op Bonaire', 'Contact']
  },
  curacao: {
    koop: ['Huizen', 'Appartementen', 'Villa\'s', 'Penthouse', 'Gronden', 'Commercieel'],
    huur: ['Huizen', 'Appartementen', 'Villa\'s', 'Penthouse', 'Kantoren', 'Vakantiewoningen'],
    informatie: ['Over Curaçao', 'Belastingen', 'Financiering', 'Immigratie', 'Wonen op Curaçao', 'Contact']
  },
  saba: {
    koop: ['Huizen', 'Appartementen', 'Villa\'s', 'Gronden'],
    huur: ['Huizen', 'Appartementen', 'Villa\'s', 'Vakantiewoningen'],
    informatie: ['Over Saba', 'Belastingen', 'Financiering', 'Wonen op Saba', 'Contact']
  },
  'sint-eustatius': {
    koop: ['Huizen', 'Appartementen', 'Villa\'s', 'Gronden'],
    huur: ['Huizen', 'Appartementen', 'Villa\'s', 'Vakantiewoningen'],
    informatie: ['Over Sint Eustatius', 'Belastingen', 'Financiering', 'Wonen op Sint Eustatius', 'Contact']
  },
  'sint-maarten': {
    koop: ['Huizen', 'Appartementen', 'Villa\'s', 'Gronden'],
    huur: ['Huizen', 'Appartementen', 'Villa\'s', 'Vakantiewoningen'],
    informatie: ['Over Sint Maarten', 'Belastingen', 'Financiering', 'Wonen op Sint Maarten', 'Contact']
  }
} as const;

// Locations per island (simplified - you can expand these)
const ISLAND_LOCATIONS = {
  aruba: ['Oranjestad', 'Noord', 'Eagle Beach', 'Palm Beach', 'Santa Cruz', 'Savaneta'],
  bonaire: ['Kralendijk', 'Rincon', 'Antriol', 'Nikiboko', 'Belnem', 'Tera Kora'],
  curacao: ['Willemstad', 'Punda', 'Otrobanda', 'Scharloo', 'Jan Thiel', 'Westpunt'],
  saba: ['The Bottom', 'Windwardside', "St. John's", "Hell's Gate", "Zion's Hill"],
  'sint-eustatius': ['Oranjestad', 'Golden Rock', 'Concordia', 'Lynch', 'Jeems', 'Union'],
  'sint-maarten': ['Philipsburg', 'Simpson Bay', 'Cupecoy', 'Maho', 'Cole Bay', 'Marigot', 'Grand Case', 'Oyster Pond', 'Dawn Beach', 'Beacon Hill', 'Point Blanche', 'St. Peters', 'French Quarter', 'Lowlands', 'Terres Basses', 'Middle Region', 'Dutch Quarter', 'Sandy Ground', 'Orient Bay', 'Anse Marcel']
} as const;

// Cache for island data to improve performance
const islandDataCache = new Map<Island, Partial<IslandData>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const lastFetchTimes = new Map<Island, number>();

// Helper function to map island names to country names for database filtering
const getIslandCountryName = (island: string): string => {
  const islandCountryMap: Record<string, string> = {
    'aruba': 'Aruba',
    'bonaire': 'Bonaire',
    'curacao': 'Curaçao',
    'saba': 'Saba',
    'sint-eustatius': 'Sint Eustatius',
    'sint-maarten': 'Sint Maarten'
  };
  
  return islandCountryMap[island] || island;
};

export function MasterIslandProvider({ children }: { children: React.ReactNode }) {
  // Initialize island selection with user preference and location detection
  const [selectedIsland, setSelectedIsland] = useState<Island>(() => {
    const savedIsland = localStorage.getItem('selectedIsland');
    const wasAutoDetected = localStorage.getItem('islandAutoDetected') === 'true';
    
    // If user manually set an island, use that
    if (savedIsland && !wasAutoDetected && ['aruba', 'bonaire', 'curacao', 'saba', 'sint-eustatius', 'sint-maarten'].includes(savedIsland)) {
      return savedIsland as Island;
    }
    
    // Otherwise, default to bonaire (will be auto-detected in useEffect)
    return 'bonaire';
  });

  const [islandData, setIslandData] = useState<IslandData>({
    properties: [],
    featuredProperties: [],
    realtors: [],
    carouselSlides: [],
    locations: [],
    menuItems: { koop: [], huur: [], informatie: [] },
    config: ISLAND_CONFIGS.bonaire,
    loading: { properties: true, realtors: true, carousel: true, all: true },
    errors: { properties: null, realtors: null, carousel: null }
  });

  // Fetch all data for a specific island
  const fetchIslandData = useCallback(async (island: Island, forceRefresh = false) => {
    console.log('🏝️ fetchIslandData called for:', island, 'forceRefresh:', forceRefresh);
    const now = Date.now();
    const lastFetch = lastFetchTimes.get(island) || 0;
    const cached = islandDataCache.get(island);
    
    // Use cache if available and not expired
    if (!forceRefresh && cached && (now - lastFetch) < CACHE_DURATION) {
      console.log('🏝️ Using cached data for:', island);
      setIslandData(() => ({
        properties: [...(cached.properties || [])],
        featuredProperties: [...(cached.featuredProperties || [])],
        realtors: [...(cached.realtors || [])],
        carouselSlides: [...(cached.carouselSlides || [])],
        locations: [...ISLAND_LOCATIONS[island]],
        menuItems: {
          koop: [...ISLAND_MENUS[island].koop],
          huur: [...ISLAND_MENUS[island].huur],
          informatie: [...ISLAND_MENUS[island].informatie]
        },
        config: { ...ISLAND_CONFIGS[island] },
        loading: { properties: false, realtors: false, carousel: false, all: false },
        errors: { properties: null, realtors: null, carousel: null }
      }));
      return;
    }

    console.log('🏝️ Fetching fresh data for:', island);

    // Set loading states
    setIslandData(prev => ({
      ...prev,
      loading: { properties: true, realtors: true, carousel: true, all: true },
      errors: { properties: null, realtors: null, carousel: null }
    }));

    try {
      // Fetch all data in parallel for maximum performance
      const [propertiesResult, realtorsResult, carouselResult] = await Promise.allSettled([
        // Fetch properties for this island
        supabase
          .from('properties')
          .select('*')
          .eq('status', 'actief')
          .ilike('country', getIslandCountryName(island))
          .order('featured', { ascending: false })
          .order('date_posted', { ascending: false }),
        
        // Fetch realtors for this island
        supabase
          .from('realtors')
          .select('*')
          .eq('island', island)
          .order('name'),
        
        // Fetch carousel slides for this island
        supabase
          .from('carousel_slides')
          .select('*')
          .eq('island', island)
          .eq('is_active', true)
          .order('display_order')
      ]);

      // Process properties
      let properties: Property[] = [];
      let featuredProperties: Property[] = [];
      let propertiesError: string | null = null;

      if (propertiesResult.status === 'fulfilled' && propertiesResult.value.data && propertiesResult.value.data.length > 0) {
        properties = propertiesResult.value.data.map(mapDbToProperty);
        featuredProperties = properties.filter(p => p.featured);
      } else {
        // Use mock properties as fallback when no database properties found
        const countryName = getIslandCountryName(island);
        const mockProps = MOCK_LISTINGS.filter(prop => prop.country === countryName);
        properties = mockProps;
        featuredProperties = mockProps.filter(p => p.featured);
        
        // Only set error if both database fetch failed AND no mock properties are available
        if (propertiesResult.status === 'rejected' && mockProps.length === 0) {
          propertiesError = 'Failed to load properties';
        }
      }

      // Process realtors
      let realtors: any[] = [];
      let realtorsError: string | null = null;

      if (realtorsResult.status === 'fulfilled' && realtorsResult.value.data) {
        realtors = realtorsResult.value.data;
      } else if (realtorsResult.status === 'rejected') {
        realtorsError = 'Failed to load realtors';
      }

      // Process carousel
      let carouselSlides: CarouselSlide[] = [];
      let carouselError: string | null = null;

      if (carouselResult.status === 'fulfilled' && carouselResult.value.data) {
        const realSlides = carouselResult.value.data as CarouselSlide[];
        
        // Always ensure we have 8 slides total (real slides + placeholders)
        const totalSlots = 8;
        carouselSlides = [...realSlides];
        
        // Add placeholder slides to reach 8 total (only for supported carousel islands)
        const carouselSupportedIslands: ('bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius')[] = 
          ['bonaire', 'aruba', 'curacao', 'saba', 'sint-eustatius'];
        
        if (carouselSupportedIslands.includes(island as any)) {
          for (let i = realSlides.length; i < totalSlots; i++) {
            carouselSlides.push({
              id: `placeholder-${i}`,
              title: `Advertentie slot ${i + 1}`,
              description: `Beschikbare advertentieruimte voor ${island}`,
              image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
              external_link: undefined,
              island: island as 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius',
              is_active: true,
              display_order: i + 1,
              year: new Date().getFullYear(),
              always_visible: false,
              click_count: 0,
              last_clicked_at: undefined,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
      } else if (carouselResult.status === 'rejected') {
        carouselError = 'Failed to load carousel';
        
        // Even on error, create 8 placeholder slides (only for supported carousel islands)
        const carouselSupportedIslands: ('bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius')[] = 
          ['bonaire', 'aruba', 'curacao', 'saba', 'sint-eustatius'];
        
        if (carouselSupportedIslands.includes(island as any)) {
          for (let i = 0; i < 8; i++) {
            carouselSlides.push({
              id: `placeholder-${i}`,
              title: `Advertentie slot ${i + 1}`,
              description: `Beschikbare advertentieruimte voor ${island}`,
              image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
              external_link: undefined,
              island: island as 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius',
              is_active: true,
              display_order: i + 1,
              year: new Date().getFullYear(),
              always_visible: false,
              click_count: 0,
              last_clicked_at: undefined,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
      }

      // Cache the data
      islandDataCache.set(island, {
        properties,
        featuredProperties,
        realtors,
        carouselSlides
      });
      lastFetchTimes.set(island, now);

      // Update state with a completely new object reference to ensure re-renders
      console.log('🏝️ Setting island data for:', island, 'properties:', properties.length, 'featured:', featuredProperties.length);
      setIslandData(() => ({
        properties: [...properties],
        featuredProperties: [...featuredProperties],
        realtors: [...realtors],
        carouselSlides: [...carouselSlides],
        locations: [...ISLAND_LOCATIONS[island]],
        menuItems: {
          koop: [...ISLAND_MENUS[island].koop],
          huur: [...ISLAND_MENUS[island].huur],
          informatie: [...ISLAND_MENUS[island].informatie]
        },
        config: { ...ISLAND_CONFIGS[island] },
        loading: { properties: false, realtors: false, carousel: false, all: false },
        errors: { properties: propertiesError, realtors: realtorsError, carousel: carouselError }
      }));

    } catch (error) {
      console.error('Failed to fetch island data:', error);
      setIslandData(prev => ({
        ...prev,
        loading: { properties: false, realtors: false, carousel: false, all: false },
        errors: {
          properties: 'Network error',
          realtors: 'Network error',
          carousel: 'Network error'
        }
      }));
    }
  }, []);

  // Auto-detect user location on first load
  useEffect(() => {
    const shouldAutoDetect = () => {
      const savedIsland = localStorage.getItem('selectedIsland');
      const wasAutoDetected = localStorage.getItem('islandAutoDetected') === 'true';
      const hasManualSelection = savedIsland && !wasAutoDetected;
      
      // Check if location was already detected today (cache check)
      const locationCache = localStorage.getItem('tropicalrealtors_location_cache');
      if (locationCache) {
        try {
          const cache = JSON.parse(locationCache);
          const cacheAge = Date.now() - cache.timestamp;
          const dayInMs = 24 * 60 * 60 * 1000;
          if (cacheAge < dayInMs) {
            return false;
          }
        } catch (error) {
          console.warn('Error checking location cache:', error);
        }
      }
      
      // Only auto-detect if user hasn't manually selected an island
      return !hasManualSelection;
    };

    if (shouldAutoDetect()) {
      detectUserIsland()
        .then((detectedIsland) => {
          // All islands are now supported
          setSelectedIsland(detectedIsland);
          localStorage.setItem('selectedIsland', detectedIsland);
          localStorage.setItem('islandAutoDetected', 'true');
          fetchIslandData(detectedIsland);
        })
        .catch((error) => {
          console.warn('Auto-detection failed, using default:', error);
          fetchIslandData(selectedIsland);
        });
    } else {
      // User has manual selection or already detected today, just load the data
      fetchIslandData(selectedIsland);
    }
  }, []);

  // Switch to a different island
  const switchIsland = useCallback((island: Island) => {
    console.log('🏝️ switchIsland called:', island, 'current:', selectedIsland);
    if (island !== selectedIsland) {
      console.log('🏝️ Actually switching island from', selectedIsland, 'to', island);
      
      // Clear cache for this island to ensure fresh data
      islandDataCache.delete(island);
      lastFetchTimes.delete(island);
      
      setSelectedIsland(island);
      // Mark as manual selection
      localStorage.setItem('selectedIsland', island);
      localStorage.setItem('islandAutoDetected', 'false');
      
      // Force refresh the data
      fetchIslandData(island, true);
    } else {
      console.log('🏝️ Island is already selected, forcing refresh anyway for mobile compatibility');
      // Force refresh even if same island (mobile compatibility)
      fetchIslandData(island, true);
    }
  }, [selectedIsland, fetchIslandData]);

  // Refresh current island data
  const refreshIslandData = useCallback((island?: Island) => {
    const targetIsland = island || selectedIsland;
    fetchIslandData(targetIsland, true);
  }, [selectedIsland, fetchIslandData]);

  // Load initial data
  useEffect(() => {
    fetchIslandData(selectedIsland);
  }, []);

  // Memoized values for performance
  const isLoading = useMemo(() => {
    return islandData.loading.all || 
           islandData.loading.properties || 
           islandData.loading.realtors || 
           islandData.loading.carousel;
  }, [islandData.loading]);

  const hasErrors = useMemo(() => {
    return !!(islandData.errors.properties || 
              islandData.errors.realtors || 
              islandData.errors.carousel);
  }, [islandData.errors]);

  const contextValue: MasterIslandContextType = {
    selectedIsland,
    islandData,
    switchIsland,
    refreshIslandData,
    isLoading,
    hasErrors
  };

  return (
    <MasterIslandContext.Provider value={contextValue}>
      {children}
    </MasterIslandContext.Provider>
  );
}

// Hook to use the master island context
export function useMasterIsland() {
  const context = useContext(MasterIslandContext);
  if (!context) {
    throw new Error('useMasterIsland must be used within a MasterIslandProvider');
  }
  return context;
}

// Convenience hooks for specific data
export function useIslandProperties() {
  const { islandData } = useMasterIsland();
  console.log('🏝️ useIslandProperties called, properties:', islandData.properties.length, 'featured:', islandData.featuredProperties.length);
  
  // Use useMemo to ensure stable references but trigger re-renders when data changes
  return useMemo(() => ({
    properties: islandData.properties,
    featuredProperties: islandData.featuredProperties,
    loading: islandData.loading.properties,
    error: islandData.errors.properties
  }), [islandData.properties, islandData.featuredProperties, islandData.loading.properties, islandData.errors.properties]);
}

export function useIslandRealtors() {
  const { islandData } = useMasterIsland();
  return {
    realtors: islandData.realtors,
    loading: islandData.loading.realtors,
    error: islandData.errors.realtors
  };
}

export function useIslandCarousel() {
  const { islandData } = useMasterIsland();
  return {
    carouselSlides: islandData.carouselSlides,
    loading: islandData.loading.carousel,
    error: islandData.errors.carousel
  };
}

export function useIslandMenu() {
  const { islandData } = useMasterIsland();
  return {
    menuItems: islandData.menuItems,
    locations: islandData.locations
  };
}

export function useIslandConfig() {
  const { islandData } = useMasterIsland();
  return islandData.config;
}

// Backward compatibility hook
export const useIsland = () => {
  const { selectedIsland, switchIsland, isLoading } = useMasterIsland();
  return { 
    selectedIsland, 
    setSelectedIsland: switchIsland, 
    isAutoDetected: false, // You could add this to MasterIslandContext if needed
    isDetecting: isLoading 
  };
};
