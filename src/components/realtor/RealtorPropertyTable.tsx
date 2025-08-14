import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Heart, Calendar, Home } from 'lucide-react';
import { Property } from '../../types';
import { deleteProperty } from '../../services/propertyService';
import { PropertyFavoriteTracker } from '../../services/propertyFavoriteTracker';
import { toast } from 'react-hot-toast';

interface RealtorPropertyTableProps {
  properties: Property[];
  onPropertyDeleted: () => void;
  statusFilter: Property['status'] | 'all';
}

interface PropertyWithStats extends Property {
  favorite_count: number;
}

export function RealtorPropertyTable({ properties, onPropertyDeleted, statusFilter }: RealtorPropertyTableProps) {
  const navigate = useNavigate();
  const [propertiesWithStats, setPropertiesWithStats] = useState<PropertyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter properties based on status using useMemo to prevent unnecessary recalculations
  const filteredProperties = useMemo(() => {
    return properties.filter(p => statusFilter === 'all' || p.status === statusFilter);
  }, [properties, statusFilter]);

  // Load favorite counts for all filtered properties
  useEffect(() => {
    const loadFavoriteCounts = async () => {
      setLoading(true);
      try {
        if (filteredProperties.length > 0) {
          const propertyIds = filteredProperties.map(p => p.id);
          const favoriteCounts = await PropertyFavoriteTracker.getMultiplePropertyFavoriteCounts(propertyIds);
          
          const enrichedProperties = filteredProperties.map(property => ({
            ...property,
            favorite_count: favoriteCounts[property.id] || 0
          }));
          
          setPropertiesWithStats(enrichedProperties);
        } else {
          setPropertiesWithStats([]);
        }
      } catch (error) {
        console.error('Error loading favorite counts:', error);
        // Fallback to properties without favorite counts
        setPropertiesWithStats(filteredProperties.map(p => ({ ...p, favorite_count: 0 })));
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteCounts();
  }, [filteredProperties]);

  const handleEdit = (propertyId: string) => {
    navigate(`/makelaar/woning/${propertyId}/bewerken`);
  };

  const handleDelete = async (propertyId: string) => {
    if (window.confirm('Weet u zeker dat u deze woning wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      setActionLoading(propertyId);
      try {
        await deleteProperty(propertyId);
        toast.success('Woning succesvol verwijderd');
        onPropertyDeleted();
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Fout bij het verwijderen van de woning');
      } finally {
        setActionLoading(null);
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (propertiesWithStats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {statusFilter === 'all' ? 'Nog geen woningen toegevoegd' : `Geen woningen gevonden voor status: ${statusFilter}`}
        </h3>
        <p className="text-gray-600 mb-6">
          {statusFilter === 'all' 
            ? 'Begin met het toevoegen van woningen om uw portfolio te beheren'
            : 'Probeer een andere status filter of voeg nieuwe woningen toe'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Woning</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prijs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statistieken</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gepubliceerd</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {propertiesWithStats.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-11 h-8 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-11 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Home className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <Link 
                        to={`/woning/${property.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                      >
                        {property.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">{property.address}, {property.city}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{property.bedrooms} bed</span>
                        <span>•</span>
                        <span>{property.bathrooms} bad</span>
                        <span>•</span>
                        <span>{property.size} m²</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatPrice(property.price)}
                  </div>
                  {property.originalPrice && property.originalPrice > property.price && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatPrice(property.originalPrice)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{property.view_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-600" />
                      <span className="font-medium">{property.favorite_count}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {property.listingId || property.id.slice(0, 8).toUpperCase()}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {formatDate(property.datePosted)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <Link
                      to={`/woning/${property.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Bekijken"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleEdit(property.id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                      title="Bewerken"
                      disabled={actionLoading === property.id}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Verwijderen"
                      disabled={actionLoading === property.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-gray-200">
        {propertiesWithStats.map((property) => (
          <div key={property.id} className="p-4">
            <div className="flex gap-3">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-14 h-11 object-cover rounded-lg"
                />
              ) : (
                <div className="w-14 h-11 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Home className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <Link 
                    to={`/woning/${property.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                  >
                    {property.title}
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mt-1">{property.address}, {property.city}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(property.price)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                    {property.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {property.view_count || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {property.favorite_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(property.datePosted)}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {property.listingId || property.id.slice(0, 8).toUpperCase()}
                  </code>
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/woning/${property.id}`}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleEdit(property.id)}
                      className="p-1.5 text-gray-600 hover:bg-gray-50 rounded"
                      disabled={actionLoading === property.id}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      disabled={actionLoading === property.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
