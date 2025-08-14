import React from 'react';
import { Bed, Bath, Square, Check } from 'lucide-react';
import { Property } from '../../types';

interface PropertyFeaturesProps {
  property: Property;
}

export function PropertyFeatures({ property }: PropertyFeaturesProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Kenmerken</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Basis details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Bed className="w-5 h-5 text-gray-500" />
              <span>{property.bedrooms} slaapkamer{property.bedrooms !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-3">
              <Bath className="w-5 h-5 text-gray-500" />
              <span>{property.bathrooms} badkamer{property.bathrooms !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-3">
              <Square className="w-5 h-5 text-gray-500" />
              <span>{property.size}m² woonoppervlak</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Extra's</h3>
          <div className="space-y-2">
            {property.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
