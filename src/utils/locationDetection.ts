// Location detection utilities for automatic island selection

type Island = 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten';

// Mapping of country codes and regions to islands
const LOCATION_TO_ISLAND_MAP: Record<string, Island> = {
  // Direct matches for the islands themselves
  'BQ': 'bonaire', // Bonaire
  'AW': 'aruba',   // Aruba
  'CW': 'curacao', // Curaçao
  'SA': 'saba',    // Saba
  'BL': 'sint-eustatius', // Sint Eustatius (Statia)
  'SX': 'sint-maarten',   // Sint Maarten
  
  // Netherlands and its territories (historically connected to all islands)
  'NL': 'bonaire', // Netherlands - default to Bonaire as it's part of Netherlands
  
  // Caribbean neighbors - map to closest island
  'VE': 'curacao', // Venezuela - closest to Curaçao
  'CO': 'aruba',   // Colombia - between Aruba and Curaçao, default to Aruba
  
  // Other Caribbean islands
  'JM': 'aruba',   // Jamaica
  'DO': 'aruba',   // Dominican Republic
  'PR': 'aruba',   // Puerto Rico
  'VI': 'aruba',   // US Virgin Islands
  'BB': 'aruba',   // Barbados
  'LC': 'aruba',   // Saint Lucia
  'GD': 'aruba',   // Grenada
  'TT': 'curacao', // Trinidad and Tobago - closer to Curaçao
  
  // North American markets (major tourism sources)
  'US': 'aruba',   // United States - Aruba is popular with US tourists
  'CA': 'aruba',   // Canada
  
  // European markets
  'DE': 'bonaire', // Germany
  'FR': 'sint-maarten', // France - Sint Maarten has French territory
  'GB': 'bonaire', // United Kingdom
  'BE': 'bonaire', // Belgium
  'IT': 'bonaire', // Italy
  'ES': 'bonaire', // Spain
};

// Browser-based country detection using timezone and language
function detectCountryFromBrowser(): string | null {
  try {
    // Try to get country from Intl.DateTimeFormat
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Map common Caribbean timezones
    const timezoneMap: Record<string, string> = {
      'America/Kralendijk': 'BQ', // Bonaire
      'America/Aruba': 'AW',      // Aruba
      'America/Curacao': 'CW',    // Curaçao
      'America/Lower_Princes': 'SX', // Sint Maarten
      'America/Philipsburg': 'SX',   // Sint Maarten
      'America/Caracas': 'VE',    // Venezuela
      'America/Bogota': 'CO',     // Colombia
      'America/New_York': 'US',   // US Eastern
      'America/Los_Angeles': 'US', // US Pacific
      'America/Toronto': 'CA',    // Canada
      'Europe/Amsterdam': 'NL',   // Netherlands
      'Europe/Berlin': 'DE',      // Germany
      'Europe/Paris': 'FR',       // France
      'Europe/London': 'GB',      // UK
    };
    
    if (timezoneMap[timezone]) {
      return timezoneMap[timezone];
    }
    
    // Try to extract region from timezone (e.g., America/Curacao -> CW)
    const parts = timezone.split('/');
    if (parts.length >= 2) {
      const city = parts[parts.length - 1];
      if (city === 'Curacao') return 'CW';
      if (city === 'Aruba') return 'AW';
      if (city === 'Kralendijk') return 'BQ';
      if (city === 'Philipsburg' || city === 'Lower_Princes') return 'SX';
    }
    
    return null;
  } catch (error) {
    console.warn('Could not detect timezone:', error);
    return null;
  }
}

// Get country from browser language
function detectCountryFromLanguage(): string | null {
  try {
    const languages = navigator.languages || [navigator.language];
    
    for (const lang of languages) {
      // Language tags like 'en-US', 'nl-NL', 'es-VE'
      const parts = lang.split('-');
      if (parts.length === 2) {
        const countryCode = parts[1].toUpperCase();
        if (LOCATION_TO_ISLAND_MAP[countryCode]) {
          return countryCode;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Could not detect language:', error);
    return null;
  }
}

// IP-based geolocation using a free service
async function detectCountryFromIP(): Promise<string | null> {
  try {
    // Using ipapi.co - free tier allows 1000 requests/day
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('IP geolocation service unavailable');
    }
    
    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.warn('IP geolocation failed:', error);
    
    // Fallback to another free service
    try {
      const fallbackResponse = await fetch('https://api.country.is/');
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        return fallbackData.country || null;
      }
    } catch (fallbackError) {
      console.warn('Fallback IP geolocation also failed:', fallbackError);
    }
    
    return null;
  }
}

// Main function to detect user's location and return appropriate island
export async function detectUserIsland(): Promise<Island> {
  // 1. First try browser-based detection (fastest, most privacy-friendly)
  const browserCountry = detectCountryFromBrowser() || detectCountryFromLanguage();
  
  if (browserCountry && LOCATION_TO_ISLAND_MAP[browserCountry]) {
    console.log(`Island detected from browser: ${LOCATION_TO_ISLAND_MAP[browserCountry]} (${browserCountry})`);
    return LOCATION_TO_ISLAND_MAP[browserCountry];
  }
  
  // 2. Try IP-based geolocation as fallback
  try {
    const ipCountry = await detectCountryFromIP();
    if (ipCountry && LOCATION_TO_ISLAND_MAP[ipCountry]) {
      console.log(`Island detected from IP: ${LOCATION_TO_ISLAND_MAP[ipCountry]} (${ipCountry})`);
      return LOCATION_TO_ISLAND_MAP[ipCountry];
    }
  } catch (error) {
    console.warn('IP geolocation failed:', error);
  }
  
  // 3. Default to Bonaire if no detection worked
  console.log('No location detected, defaulting to Bonaire');
  return 'bonaire';
}

// Function to check if user is likely from one of our target islands
export function isFromTargetRegion(countryCode: string): boolean {
  return ['BQ', 'AW', 'CW', 'NL', 'VE', 'CO'].includes(countryCode);
}

// Function to get a user-friendly explanation of why an island was selected
export function getIslandSelectionReason(island: Island, detectedCountry?: string): string {
  if (!detectedCountry) {
    return 'Standaard selectie';
  }
  
  const countryNames: Record<string, string> = {
    'BQ': 'Bonaire',
    'AW': 'Aruba', 
    'CW': 'Curaçao',
    'NL': 'Nederland',
    'VE': 'Venezuela',
    'CO': 'Colombia',
    'US': 'Verenigde Staten',
    'CA': 'Canada',
    'DE': 'Duitsland',
    'FR': 'Frankrijk',
    'GB': 'Verenigd Koninkrijk',
    'BE': 'België',
  };
  
  const countryName = countryNames[detectedCountry] || detectedCountry;
  
  if (detectedCountry === island.toUpperCase()) {
    return `Gedetecteerd vanuit ${countryName}`;
  }
  
  return `Geselecteerd voor ${countryName}`;
}
