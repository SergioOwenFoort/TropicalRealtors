import { X, MapPin, Bed, Bath, Ruler, Euro, Tag } from 'lucide-react';
import { MapPreview } from '../common/MapPreview';

interface ListingPreviewProps {
  formData: {
    title: string;
    price: number;
    originalPrice?: number;
    address: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    bedrooms: number;
    bathrooms: number;
    size: number;
    images: string[];
    description: string;
    type: 'koop' | 'huur';
    category: 'appartementen' | 'huizen' | 'vakantiewoningen' | 'nieuwbouw' | 'hotel' | 'resort';
    features: string[];
    status: string;
    featured: boolean;
  };
  onClose: () => void;
}

export function ListingPreview({ formData, onClose }: ListingPreviewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Preview</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Property Card Preview */}
          <div className="border rounded-lg overflow-hidden shadow-sm">
            {/* Image */}
            {formData.images[0] && (
              <div className="relative">
                <img
                  src={formData.images[0]}
                  alt={formData.title}
                  className="w-full h-64 object-cover"
                />
                {formData.featured && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <Tag size={14} className="inline mr-1" />
                    Uitgelicht
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {formData.type === 'koop' ? 'Te koop' : 'Te huur'}
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Title & Price */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {formData.title || 'Titel niet ingevuld'}
                </h3>
                <div className="flex items-center text-2xl font-bold text-blue-600">
                  <Euro size={24} className="mr-1" />
                  {formatPrice(formData.price)}
                  {formData.type === 'huur' && (
                    <span className="text-sm text-gray-500 ml-2">per maand</span>
                  )}
                </div>
                
                {/* Original Price Display */}
                {formData.originalPrice && formData.originalPrice > formData.price && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="line-through mr-2">Oorspronkelijk: {formatPrice(formData.originalPrice)}</span>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                      -{Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin size={16} className="mr-2" />
                <span>
                  {formData.address && formData.city 
                    ? `${formData.address}, ${formData.city}, ${formData.country}`
                    : 'Adres niet ingevuld'
                  }
                </span>
              </div>

              {/* Property Details */}
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center text-gray-600">
                  <Bed size={16} className="mr-1" />
                  <span>{formData.bedrooms} slaapkamers</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Bath size={16} className="mr-1" />
                  <span>{formData.bathrooms} badkamers</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Ruler size={16} className="mr-1" />
                  <span>{formData.size} m²</span>
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                </span>
              </div>

              {/* Description */}
              {formData.description && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Beschrijving</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {formData.description}
                  </p>
                </div>
              )}

              {/* Map Preview */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Locatie</h4>
                <MapPreview
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  address={formData.address}
                  city={formData.city}
                  country={formData.country}
                  height={200}
                  className="w-full"
                />
              </div>

              {/* Features */}
              {formData.features.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Kenmerken</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Images */}
              {formData.images.length > 1 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Meer afbeeldingen ({formData.images.length - 1})
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.images.slice(1, 5).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Preview ${index + 2}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                    ))}
                    {formData.images.length > 5 && (
                      <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center text-gray-500 text-sm">
                        +{formData.images.length - 5} meer
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  formData.status === 'actief' 
                    ? 'bg-green-100 text-green-800'
                    : formData.status === 'concept'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  Status: {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
