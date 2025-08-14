/**
 * Google Maps TypeScript declarations
 * This file provides type definitions for Google Maps API
 */

declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options?: any) => any;
        Marker: new (options?: any) => any;
        InfoWindow: new (options?: any) => any;
        Size: new (width: number, height: number) => any;
        Point: new (x: number, y: number) => any;
        Geocoder: new () => {
          geocode: (request: any, callback: (results: any[], status: string) => void) => void;
        };
        LatLng: new (lat: number, lng: number) => any;
        places: {
          PlacesService: new (map: any) => any;
          PlacesServiceStatus: any;
        };
      };
    };
  }
}

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

export interface MapOptions {
  center?: { lat: number; lng: number };
  zoom?: number;
  mapTypeId?: string;
  streetViewControl?: boolean;
  mapTypeControl?: boolean;
  fullscreenControl?: boolean;
  zoomControl?: boolean;
  gestureHandling?: string;
  disableDefaultUI?: boolean;
  styles?: any[];
}

export interface MarkerOptions {
  position: { lat: number; lng: number };
  map?: any;
  title?: string;
  icon?: string | { url: string; scaledSize: any; anchor: any };
  draggable?: boolean;
  animation?: any;
}
