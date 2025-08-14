import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Heart, Calendar, Home } from 'lucide-react';
import { Property } from '../../types';
import { deleteProperty } from '../../services/propertyService';
import { PropertyFavoriteTracker } from '../../services/propertyFavoriteTracker';
import { toast } from 'react-hot-toast';

interface OwnerPropertyCardProps {
  property: Property;
  onPropertyDeleted: () => void;
}

export function OwnerPropertyCard({ property, onPropertyDeleted }: OwnerPropertyCardProps) {
  const navigate = useNavigate();
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Get real favorite count from database
  useEffect(() => {
    const fetchFavoriteCount = async () => {
      try {
        const count = await PropertyFavoriteTracker.getPropertyFavoriteCount(property.id);
        setFavoriteCount(count);
      } catch (error) {
        console.error('Error fetching favorite count:', error);
        setFavoriteCount(0);
      }
    };

    fetchFavoriteCount();
  }, [property.id]);

  const handleEdit = () => {
    navigate(`/owner/woning/${property.id}/bewerken`);
  };

  const handleDelete = async () => {
    if (window.confirm('Weet u zeker dat u deze woning wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      setLoading(true);
      try {
        await deleteProperty(property.id);
        toast.success('Woning succesvol verwijderd');
        onPropertyDeleted();
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Fout bij het verwijderen van de woning');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'actief': return 'bg-green-100 text-green-800';
      case 'concept': return 'bg-yellow-100 text-yellow-800';
      case 'verkocht': return 'bg-red-100 text-red-800';
      case 'verhuurd': return 'bg-blue-100 text-blue-800';
      case 'ingetrokken': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Header with image and basic info */}
      <div className="relative">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-32 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-32 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <Home className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Status badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(property.status)}`}>
          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="mb-3">
          <Link 
            to={`/woning/${property.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
          >
            {property.title}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(property.price)}
            </span>
            {property.originalPrice && property.originalPrice > property.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(property.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        <p className="text-gray-600 text-sm mb-3">
          {property.address}, {property.city}, {property.country}
        </p>

        {/* Property Details */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{property.bedrooms}</div>
            <div className="text-xs text-gray-500">Slaapkamers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{property.bathrooms}</div>
            <div className="text-xs text-gray-500">Badkamers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{property.size}</div>
            <div className="text-xs text-gray-500">m²</div>
          </div>
        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-3 gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1 text-sm">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">{property.view_count || 0}</span>
            <span className="text-gray-500 text-xs">views</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Heart className="w-4 h-4 text-red-600" />
            <span className="font-semibold">{favoriteCount}</span>
            <span className="text-gray-500 text-xs">favs</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-gray-500 text-xs">{formatDate(property.datePosted)}</span>
          </div>
        </div>

        {/* Unique Listing ID */}
        <div className="mb-4 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
          <div className="text-xs text-blue-700 font-medium">Listing ID</div>
          <div className="text-sm font-mono text-blue-800">
            {property.listingId || property.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/woning/${property.id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            Bekijken
          </Link>
          
          <button
            onClick={handleEdit}
            disabled={loading}
            className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Edit className="w-4 h-4 inline mr-1" />
            Bewerken
          </button>
          
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
            title="Verwijderen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
