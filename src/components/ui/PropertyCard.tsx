import { Heart, Bed, Bath, Square, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Property } from '../../types';
import { useFavorites } from '../../hooks/useFavorites';
import { Flag } from './Flag';

// Helper function to map country names to flag country codes
const getCountryCode = (countryName: string): 'aruba' | 'bonaire' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten' | null => {
  const countryMap: Record<string, 'aruba' | 'bonaire' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten'> = {
    'Aruba': 'aruba',
    'Bonaire': 'bonaire',
    'Curaçao': 'curacao',
    'Saba': 'saba',
    'Sint Eustatius': 'sint-eustatius',
    'Sint Maarten': 'sint-maarten'
  };
  
  return countryMap[countryName] || null;
};

// Helper function to map country codes to proper country names
const getCountryNameFromCode = (countryCode: string): string => {
  const codeMap: Record<string, string> = {
    'AW': 'Aruba',
    'BQ': 'Bonaire', 
    'CW': 'Curaçao',
    'SX': 'Sint Maarten'
  };
  
  return codeMap[countryCode] || countryCode;
};

// Helper function to detect if a city field contains a country code instead of city name
const isCountryCode = (cityName: string): boolean => {
  return ['AW', 'BQ', 'CW', 'SX'].includes(cityName);
};

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(property.id);

  return (
    <Link 
      to={`/woning/${property.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-24 sm:h-32 object-cover rounded-t-xl"
          loading="lazy"
          decoding="async"
        />
        <button 
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(property.id);
          }}
        >
          <Heart className={`w-5 h-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
        <div className="absolute top-3 left-3 flex gap-1">
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {property.type === 'koop' ? 'Te koop' : 'Te huur'}
          </span>
          {property.featured && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              Uitgelicht
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{property.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</h3>
        </div>
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <p className="truncate text-sm sm:text-base">
            {property.address}
            {isCountryCode(property.city) ? (
              // If city contains a country code, show the proper country name with flag
              <span className="ml-2 inline-flex items-center gap-1">
                <Flag country={getCountryCode(getCountryNameFromCode(property.city))!} size="sm" />
                <span>{getCountryNameFromCode(property.city)}</span>
              </span>
            ) : (
              // Normal case: show city and country
              <>
                , {property.city}
                {getCountryCode(property.country) && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <Flag country={getCountryCode(property.country)!} size="sm" />
                    <span>{property.country}</span>
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4 text-gray-500 text-sm sm:text-base">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="w-4 h-4" />
            <span>{property.size}m²</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
