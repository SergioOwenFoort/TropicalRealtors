import { useState } from 'react';
import { Sliders, Euro, Star, MapPin, Wifi, Car, Waves, Coffee, Shield, Dumbbell, Utensils, Wind } from 'lucide-react';

interface SearchFilters {
  priceRange: [number, number];
  starRating: number;
  distanceFromCenter: number;
  amenities: string[];
  freeCancellation: boolean;
}

interface FilterSidebarProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  mobile?: boolean;
}

const amenityOptions = [
  { id: 'wifi', label: 'Gratis WiFi', icon: Wifi },
  { id: 'parking', label: 'Parkeerplaats', icon: Car },
  { id: 'pool', label: 'Zwembad', icon: Waves },
  { id: 'breakfast', label: 'Ontbijt', icon: Coffee },
  { id: 'gym', label: 'Fitnessruimte', icon: Dumbbell },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils },
  { id: 'ac', label: 'Airconditioning', icon: Wind }
];

export function FilterSidebar({ filters, onFilterChange, mobile = false }: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handlePriceChange = (min: number, max: number) => {
    const newPriceRange: [number, number] = [min, max];
    setLocalFilters(prev => ({ ...prev, priceRange: newPriceRange }));
    onFilterChange({ priceRange: newPriceRange });
  };

  const handleStarRatingChange = (rating: number) => {
    setLocalFilters(prev => ({ ...prev, starRating: rating }));
    onFilterChange({ starRating: rating });
  };

  const handleDistanceChange = (distance: number) => {
    setLocalFilters(prev => ({ ...prev, distanceFromCenter: distance }));
    onFilterChange({ distanceFromCenter: distance });
  };

  const handleAmenityToggle = (amenityId: string) => {
    const newAmenities = localFilters.amenities.includes(amenityId)
      ? localFilters.amenities.filter(id => id !== amenityId)
      : [...localFilters.amenities, amenityId];
    
    setLocalFilters(prev => ({ ...prev, amenities: newAmenities }));
    onFilterChange({ amenities: newAmenities });
  };

  const handleFreeCancellationToggle = () => {
    const newValue = !localFilters.freeCancellation;
    setLocalFilters(prev => ({ ...prev, freeCancellation: newValue }));
    onFilterChange({ freeCancellation: newValue });
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      priceRange: [0, 1000] as [number, number],
      starRating: 0,
      distanceFromCenter: 50,
      amenities: [],
      freeCancellation: false
    };
    setLocalFilters(prev => ({ ...prev, ...defaultFilters }));
    onFilterChange(defaultFilters);
  };

  const containerClasses = mobile 
    ? "space-y-6" 
    : "bg-white rounded-lg shadow-md p-6 space-y-6 h-fit";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-lg">Filters</h3>
        </div>
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Wis alles
        </button>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Euro className="w-4 h-4 text-gray-600" />
          <h4 className="font-medium">Prijs per nacht</h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1000"
              value={localFilters.priceRange[0]}
              onChange={(e) => handlePriceChange(parseInt(e.target.value), localFilters.priceRange[1])}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <span className="text-sm text-gray-600 min-w-[60px]">€{localFilters.priceRange[0]}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1000"
              value={localFilters.priceRange[1]}
              onChange={(e) => handlePriceChange(localFilters.priceRange[0], parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <span className="text-sm text-gray-600 min-w-[60px]">€{localFilters.priceRange[1]}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>€0</span>
            <span>€1000+</span>
          </div>
        </div>
      </div>

      {/* Star Rating */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-gray-600" />
          <h4 className="font-medium">Sterren beoordeling</h4>
        </div>
        <div className="space-y-2">
          {[0, 3, 4, 5].map((rating) => (
            <label key={rating} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="starRating"
                value={rating}
                checked={localFilters.starRating === rating}
                onChange={() => handleStarRatingChange(rating)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1">
                {rating === 0 ? (
                  <span className="text-sm text-gray-700">Alle beoordelingen</span>
                ) : (
                  <>
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-700 ml-1">{rating}+ sterren</span>
                  </>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Distance from Center */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-600" />
          <h4 className="font-medium">Afstand tot centrum</h4>
        </div>
        <div className="space-y-3">
          <input
            type="range"
            min="1"
            max="50"
            value={localFilters.distanceFromCenter}
            onChange={(e) => handleDistanceChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Max {localFilters.distanceFromCenter} km
            </span>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>1 km</span>
              <span>50+ km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h4 className="font-medium mb-3">Voorzieningen</h4>
        <div className="space-y-2">
          {amenityOptions.map((amenity) => {
            const IconComponent = amenity.icon;
            return (
              <label key={amenity.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.amenities.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <IconComponent className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{amenity.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Free Cancellation */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={localFilters.freeCancellation}
            onChange={handleFreeCancellationToggle}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-700">Gratis annulering</span>
        </label>
      </div>

      {/* Apply filters button for mobile */}
      {mobile && (
        <div className="pt-4 border-t border-gray-200">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
            Filters toepassen
          </button>
        </div>
      )}
    </div>
  );
}