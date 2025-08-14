import React from 'react';
import { Property } from '../../types';
import { PropertyStatusBadge } from '../realtor/PropertyStatusBadge';
import { Star, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../../hooks/useProperties';

interface UserPropertiesProps {
  userId: string;
  onClose: () => void;
}

export function UserProperties({ userId, onClose }: UserPropertiesProps) {
  const navigate = useNavigate();
  const { properties, toggleFeatured } = useProperties();
  const userProperties = properties.filter(p => p.makelaarId === userId);

  const handleEditProperty = (propertyId: string) => {
    navigate(`/admin/woning/${propertyId}/bewerken`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-8">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Woningen</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>

        <div className="divide-y">
          {userProperties.map((property) => (
            <div 
              key={property.id} 
              className="p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{property.title}</h3>
                    <p className="text-gray-600 text-sm">{property.address}</p>
                    <p className="text-gray-600 text-sm">€ {property.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <PropertyStatusBadge status={property.status} />
                  <button
                    onClick={() => toggleFeatured(property.id)}
                    className={`p-2 rounded-full ${
                      property.featured
                        ? 'text-yellow-500 hover:bg-yellow-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${property.featured ? 'fill-yellow-500' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleEditProperty(property.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {userProperties.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Geen woningen gevonden voor deze gebruiker
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
