/**
 * Nominatim Geocoding Service
 * Uses OpenStreetMap's free Nominatim API to convert addresses to coordinates
 * No API key required - completely free!
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  display_name: string;
  address: {
    city?: string;
    country?: string;
    state?: string;
  };
}

export interface GeocodingError {
  error: string;
  message: string;
}

/**
 * Geocode an address to coordinates using Nominatim (OpenStreetMap)
 * @param address - Full address string (e.g., "Palm Beach 123, Noord, Aruba")
 * @param city - Optional city name
 * @param country - Optional country name
 * @returns Promise with coordinates or null if not found
 */
export async function geocodeAddress(
  address: string,
  city?: string,
  country?: string
): Promise<GeocodingResult | null> {
  try {
    // Build the search query
    let query = address;
    if (city) query += `, ${city}`;
    if (country) query += `, ${country}`;

    // Nominatim API endpoint
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', query);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '1');
    url.searchParams.append('addressdetails', '1');

    // Make the request with proper headers (Nominatim requires a User-Agent)
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'TropicalRealtors.com/1.0', // Nominatim requires this
      },
    });

    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    // Check if we got results
    if (!data || data.length === 0) {
      console.warn('No geocoding results found for:', query);
      return null;
    }

    const result = data[0];

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      display_name: result.display_name,
      address: {
        city: result.address?.city || result.address?.town || result.address?.village,
        country: result.address?.country,
        state: result.address?.state,
      },
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Geocode multiple addresses in sequence (with delay to respect rate limits)
 * Nominatim has a rate limit of 1 request per second
 * @param addresses - Array of address objects
 * @returns Promise with array of results
 */
export async function geocodeMultipleAddresses(
  addresses: Array<{ address: string; city?: string; country?: string }>
): Promise<Array<GeocodingResult | null>> {
  const results: Array<GeocodingResult | null> = [];

  for (const addr of addresses) {
    const result = await geocodeAddress(addr.address, addr.city, addr.country);
    results.push(result);

    // Wait 1 second between requests to respect Nominatim's rate limit
    if (addresses.indexOf(addr) < addresses.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Reverse geocode coordinates to an address
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise with address details or null if not found
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.append('lat', latitude.toString());
    url.searchParams.append('lon', longitude.toString());
    url.searchParams.append('format', 'json');
    url.searchParams.append('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'TropicalRealtors.com/1.0',
      },
    });

    if (!response.ok) {
      console.error('Nominatim reverse geocoding error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data || data.error) {
      console.warn('No reverse geocoding results found');
      return null;
    }

    return {
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lon),
      display_name: data.display_name,
      address: {
        city: data.address?.city || data.address?.town || data.address?.village,
        country: data.address?.country,
        state: data.address?.state,
      },
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Validate if coordinates are within Caribbean region
 * @param latitude 
 * @param longitude 
 * @returns boolean indicating if coordinates are in Caribbean region
 */
export function isInCaribbeanRegion(latitude: number, longitude: number): boolean {
  // Caribbean region bounds (covering all 6 Dutch Caribbean islands)
  const CARIBBEAN_BOUNDS = {
    north: 18.2,
    south: 11.7,
    west: -70.5,
    east: -62.5,
  };

  return (
    latitude >= CARIBBEAN_BOUNDS.south &&
    latitude <= CARIBBEAN_BOUNDS.north &&
    longitude >= CARIBBEAN_BOUNDS.west &&
    longitude <= CARIBBEAN_BOUNDS.east
  );
}

/**
 * Get island name from coordinates
 * @param latitude 
 * @param longitude 
 * @returns Island name or null
 */
export function getIslandFromCoordinates(latitude: number, longitude: number): string | null {
  // Island boundaries (approximate)
  const ISLAND_BOUNDS = {
    Aruba: { latMin: 12.38, latMax: 12.65, lonMin: -70.08, lonMax: -69.86 },
    Bonaire: { latMin: 12.0, latMax: 12.3, lonMin: -68.45, lonMax: -68.15 },
    Curaçao: { latMin: 12.05, latMax: 12.4, lonMin: -69.2, lonMax: -68.8 },
    'Sint Maarten': { latMin: 18.0, latMax: 18.13, lonMin: -63.15, lonMax: -63.0 },
    Saba: { latMin: 17.61, latMax: 17.65, lonMin: -63.26, lonMax: -63.2 },
    'Sint Eustatius': { latMin: 17.46, latMax: 17.53, lonMin: -63.02, lonMax: -62.94 },
  };

  for (const [island, bounds] of Object.entries(ISLAND_BOUNDS)) {
    if (
      latitude >= bounds.latMin &&
      latitude <= bounds.latMax &&
      longitude >= bounds.lonMin &&
      longitude <= bounds.lonMax
    ) {
      return island;
    }
  }

  return null;
}
