/**
 * Google Maps utilities for property location features
 */

export interface GoogleMapsConfig {
  apiKey: string;
  libraries?: string[];
  language?: string;
  region?: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  addressComponents: any[];
}

export interface GeocodeError {
  status: string;
  message: string;
}

class GoogleMapsService {
  private static instance: GoogleMapsService;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  /**
   * Load Google Maps API if not already loaded
   */
  async loadGoogleMaps(config?: GoogleMapsConfig): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = this.loadMapsScript(config);
    return this.loadPromise;
  }

  private loadMapsScript(config?: GoogleMapsConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        this.isLoaded = true;
        this.isLoading = false;
        resolve();
        return;
      }

      const apiKey = config?.apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        reject(new Error('Google Maps API key not configured'));
        return;
      }

      const script = document.createElement('script');
      const libraries = config?.libraries || ['places', 'marker'];
      const language = config?.language || 'nl';
      const region = config?.region || 'NL';

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}&language=${language}&region=${region}&loading=async`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        this.isLoading = false;
        resolve();
      };

      script.onerror = () => {
        this.isLoading = false;
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    await this.loadGoogleMaps();

    return new Promise((resolve, reject) => {
      const geocoder = new (window as any).google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results: any[], status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const location = result.geometry.location;
          
          resolve({
            latitude: location.lat(),
            longitude: location.lng(),
            formattedAddress: result.formatted_address,
            addressComponents: result.address_components
          });
        } else {
          reject({
            status,
            message: this.getGeocodeErrorMessage(status)
          } as GeocodeError);
        }
      });
    });
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
    await this.loadGoogleMaps();

    return new Promise((resolve, reject) => {
      const geocoder = new (window as any).google.maps.Geocoder();
      const latlng = { lat: latitude, lng: longitude };
      
      geocoder.geocode({ location: latlng }, (results: any[], status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          
          resolve({
            latitude,
            longitude,
            formattedAddress: result.formatted_address,
            addressComponents: result.address_components
          });
        } else {
          reject({
            status,
            message: this.getGeocodeErrorMessage(status)
          } as GeocodeError);
        }
      });
    });
  }

  /**
   * Create a map instance
   */
  async createMap(element: HTMLElement, options: any): Promise<any> {
    await this.loadGoogleMaps();
    return new (window as any).google.maps.Map(element, options);
  }

  /**
   * Create a marker
   */
  async createMarker(options: any): Promise<any> {
    await this.loadGoogleMaps();
    return new (window as any).google.maps.Marker(options);
  }

  /**
   * Get error message for geocoding status
   */
  private getGeocodeErrorMessage(status: string): string {
    switch (status) {
      case 'ZERO_RESULTS':
        return 'Geen resultaten gevonden voor dit adres';
      case 'OVER_QUERY_LIMIT':
        return 'Te veel aanvragen. Probeer het later opnieuw';
      case 'REQUEST_DENIED':
        return 'Aanvraag geweigerd. Controleer de API-sleutel';
      case 'INVALID_REQUEST':
        return 'Ongeldig verzoek. Controleer het adres';
      case 'UNKNOWN_ERROR':
        return 'Onbekende fout. Probeer het opnieuw';
      default:
        return 'Fout bij het zoeken van locatie';
    }
  }

  /**
   * Check if Google Maps is loaded
   */
  isGoogleMapsLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Get current loading state
   */
  isGoogleMapsLoading(): boolean {
    return this.isLoading;
  }
}

// Export singleton instance
export const googleMapsService = GoogleMapsService.getInstance();

// Export utility functions
export const geocodeAddress = (address: string): Promise<GeocodeResult> =>
  googleMapsService.geocodeAddress(address);

export const reverseGeocode = (latitude: number, longitude: number): Promise<GeocodeResult> =>
  googleMapsService.reverseGeocode(latitude, longitude);

export const loadGoogleMaps = (config?: GoogleMapsConfig): Promise<void> =>
  googleMapsService.loadGoogleMaps(config);

// Common map configurations for different use cases
export const mapConfigs = {
  propertyDetail: {
    zoom: 15,
    mapTypeId: 'hybrid',
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
    zoomControl: true,
    gestureHandling: 'cooperative',
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      }
    ]
  },
  propertyList: {
    zoom: 12,
    mapTypeId: 'roadmap',
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    zoomControl: true,
    gestureHandling: 'cooperative',
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  },
  preview: {
    zoom: 15,
    mapTypeId: 'hybrid',
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
    zoomControl: true,
    gestureHandling: 'cooperative',
    disableDefaultUI: false,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      }
    ]
  }
};

export default googleMapsService;
