import { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface MapPreviewProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  className?: string;
  showFullAddress?: boolean;
  height?: number;
}

export function MapPreview({ 
  latitude, 
  longitude, 
  address, 
  city, 
  country, 
  className = '',
  showFullAddress = true,
  height = 300
}: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fullAddress = address && city && country 
    ? `${address}, ${city}, ${country}`
    : city && country 
      ? `${city}, ${country}`
      : 'Locatie niet beschikbaar';

  useEffect(() => {
    if (!latitude || !longitude) {
      setIsLoading(false);
      return;
    }

    const initializeMap = () => {
      if (!mapRef.current || !latitude || !longitude) return;

      try {
        const google = (window as any).google;
        if (!google || !google.maps) {
          setMapError('Google Maps API niet geladen');
          setIsLoading(false);
          return;
        }

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 15,
          mapTypeId: 'hybrid', // Show both satellite and street view
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        // Add marker using modern AdvancedMarkerElement or fallback to Marker
        let marker;
        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
          // Use new AdvancedMarkerElement
          marker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: latitude, lng: longitude },
            map: map,
            title: fullAddress
          });
        } else {
          // Fallback to legacy Marker for older API versions
          marker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map,
            title: fullAddress,
            icon: {
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="32" height="32">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 32)
            }
          });
        }

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${fullAddress}</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">
                ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
              </p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        setMapLoaded(true);
        setMapError(null);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Fout bij initialiseren van kaart');
      } finally {
        setIsLoading(false);
      }
    };

    const loadGoogleMaps = () => {
      if ((window as any).google && (window as any).google.maps) {
        initializeMap();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setMapError('Google Maps API key niet geconfigureerd');
        setIsLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setMapError('Fout bij laden van Google Maps');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [latitude, longitude, fullAddress]);

  if (!latitude || !longitude) {
    return (
      <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <MapPin size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Geen locatie beschikbaar</p>
          <p className="text-gray-400 text-xs mt-1">Gebruik "Zoek locatie" om de kaart te tonen</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-2" />
          <p className="text-red-600 text-sm">{mapError}</p>
          <a
            href={`https://www.google.com/maps/@${latitude},${longitude},15z`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-xs mt-2 inline-flex items-center"
          >
            <ExternalLink size={12} className="mr-1" />
            Bekijk op Google Maps
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden border border-gray-300 ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-2" />
            <p className="text-gray-600 text-sm">Kaart laden...</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
      
      {mapLoaded && showFullAddress && (
        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin size={16} className="text-red-600" />
              <span className="text-sm font-medium text-gray-800">{fullAddress}</span>
            </div>
            <a
              href={`https://www.google.com/maps/@${latitude},${longitude},17z`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
            >
              <ExternalLink size={12} className="mr-1" />
              Openen
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
