import { Star, MapPin, Wifi, Car, Waves, Coffee, Shield, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { VacationProperty } from '../../types';

interface PropertyCardProps {
  property: VacationProperty;
}

const amenityIcons: { [key: string]: any } = {
  wifi: Wifi,
  parking: Car,
  pool: Waves,
  breakfast: Coffee,
  freeCancellation: Shield
};

const amenityLabels: { [key: string]: string } = {
  wifi: 'WiFi',
  parking: 'Parkeren',
  pool: 'Zwembad',
  breakfast: 'Ontbijt',
  gym: 'Fitness',
  restaurant: 'Restaurant',
  ac: 'Airco'
};

export function PropertyCard({ property }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleReserve = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle reservation logic here
    alert(`Reservering voor ${property.name} - functionaliteit wordt binnenkort toegevoegd!`);
  };

  const displayedAmenities = property.amenities.slice(0, 4);
  const remainingAmenitiesCount = property.amenities.length - 4;

  return (
    <Link to={`/vakantie/${property.id}`} className="block">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer">
        {/* Image Carousel */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.images[currentImageIndex] || 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop&auto=format'}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop&auto=format';
            }}
          />
        
        {/* Image Navigation */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
            
            {/* Image Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors duration-200"
        >
          <Heart 
            className={`w-4 h-4 ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
            } transition-colors duration-200`} 
          />
        </button>

        {/* Featured Badge */}
        {property.featured && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
            Aanbevolen
          </div>
        )}

        {/* Free Cancellation Badge */}
        {property.cancellation_policy === 'flexible' && (
          <div className="absolute bottom-3 left-3 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Gratis annulering
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
              {property.name}
            </h3>
            <div className="flex items-center gap-1 text-gray-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{property.city}, {property.island}</span>
              <span className="text-sm">• {property.distance_from_center} km van centrum</span>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-sm font-medium">{property.rating}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {property.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {displayedAmenities.map((amenity) => {
            const IconComponent = amenityIcons[amenity];
            const label = amenityLabels[amenity] || amenity;
            
            return (
              <div key={amenity} className="flex items-center gap-1 text-gray-600">
                {IconComponent && <IconComponent className="w-3 h-3" />}
                <span className="text-xs">{label}</span>
              </div>
            );
          })}
          {remainingAmenitiesCount > 0 && (
            <span className="text-xs text-gray-500">
              +{remainingAmenitiesCount} meer
            </span>
          )}
        </div>

        {/* Price and Reserve Button */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                €{property.price}
              </span>
              <span className="text-sm text-gray-600">per nacht</span>
            </div>
            <div className="text-xs text-gray-500">
              {property.rating || 0} sterren
            </div>
          </div>
          
          <button
            onClick={handleReserve}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Bekijk deal
          </button>
        </div>
      </div>
      </div>
    </Link>
  );
}