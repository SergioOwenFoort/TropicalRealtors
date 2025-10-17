import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, Icon, divIcon } from 'leaflet';
import { VacationProperty } from '../../types';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

interface InteractiveVacationMapProps {
  properties: VacationProperty[];
  selectedIsland: string | null;
}

// Island center coordinates (accurate coordinates for Dutch Caribbean islands)
const ISLAND_COORDINATES: Record<string, { center: LatLngExpression; zoom: number }> = {
  'Aruba': { center: [12.5211, -69.9683], zoom: 11 },
  'Bonaire': { center: [12.1784, -68.2385], zoom: 11 },
  'Curaçao': { center: [12.1696, -68.9900], zoom: 11 },
  'Sint Maarten': { center: [18.0708, -63.0501], zoom: 12 },
  'Saba': { center: [17.6350, -63.2300], zoom: 14 },
  'Sint Eustatius': { center: [17.4895, -62.9736], zoom: 13 },
};

// All islands view (Caribbean region covering both ABC and SSS island groups)
// Area bounds: North: 18.15°N, South: 11.75°N, West: -70.3°W, East: -62.8°W
const ALL_ISLANDS_VIEW = { center: [14.95, -66.55] as LatLngExpression, zoom: 6 };

// Custom marker icon using TropicalRealtors logo
const createCustomIcon = () => {
  return new Icon({
    iconUrl: '/map-marker.svg',
    iconSize: [40, 52],
    iconAnchor: [20, 52],
    popupAnchor: [0, -52],
  });
};

// Component to handle map view updates
function MapViewController({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);
  
  return null;
}

export function InteractiveVacationMap({ properties, selectedIsland }: InteractiveVacationMapProps) {
  // Debug logging
  console.log('🗺️ InteractiveVacationMap - Total properties received:', properties.length);
  console.log('🗺️ InteractiveVacationMap - Selected island:', selectedIsland);
  
  // Determine map center and zoom based on selected island
  const { center, zoom } = useMemo(() => {
    if (selectedIsland && ISLAND_COORDINATES[selectedIsland]) {
      return ISLAND_COORDINATES[selectedIsland];
    }
    return ALL_ISLANDS_VIEW;
  }, [selectedIsland]);

  // Filter properties that have valid coordinates
  const propertiesWithCoordinates = useMemo(() => {
    const filtered = properties.filter(
      property => 
        property.latitude !== undefined && 
        property.latitude !== null &&
        property.longitude !== undefined &&
        property.longitude !== null &&
        !isNaN(property.latitude) &&
        !isNaN(property.longitude)
    );
    console.log('🗺️ Properties with valid coordinates:', filtered.length);
    return filtered;
  }, [properties]);

  const customIcon = useMemo(() => createCustomIcon(), []);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapViewController center={center} zoom={zoom} />
        
        {propertiesWithCoordinates.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
            icon={customIcon}
          >
            <Popup maxWidth={300} className="vacation-property-popup">
              <div className="p-2">
                {property.images && property.images.length > 0 && (
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                )}
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                  {property.name}
                </h3>
                <p className="text-blue-600 font-bold text-sm mb-2">
                  {formatPrice(property.price)}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  📍 {property.city}, {property.country}
                </p>
                <Link
                  to={`/vakantie/${property.id}`}
                  className="block w-full text-center bg-blue-600 text-white text-xs py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Bekijk Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {propertiesWithCoordinates.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 pointer-events-none">
          <div className="text-center">
            <p className="text-gray-600 font-medium">Geen woningen met locatiegegevens gevonden</p>
            <p className="text-gray-500 text-sm mt-1">
              Probeer een andere zoekopdracht of filter
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
