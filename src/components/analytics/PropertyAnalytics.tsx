import React, { useState, useEffect } from 'react';
import { Eye, TrendingUp, Home, BarChart3 } from 'lucide-react';
import { PropertyViewTracker } from '../../services/propertyViewTracker';

interface PropertyViewStats {
  id: string;
  title: string;
  view_count: number;
  last_viewed_at?: string;
  created_by?: string;
  created_at?: string;
  owner_id?: string;
  property_type?: string;
  country?: string;
}

interface PropertyAnalyticsProps {
  userId?: string;
  country?: string;
  propertyType?: string;
  showTitle?: boolean;
  showDetailedStats?: boolean;
}

/**
 * Property Analytics Component - Similar to CarouselAnalytics but for property views
 * Displays property view statistics in a clean dashboard format
 */
export const PropertyAnalytics: React.FC<PropertyAnalyticsProps> = ({
  userId,
  country,
  propertyType,
  showTitle = true,
  showDetailedStats = true
}) => {
  const [stats, setStats] = useState<PropertyViewStats[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPropertyStats();
  }, [userId, country, propertyType]);

  const loadPropertyStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        userId,
        country,
        propertyType
      };

      const [propertyStats, total] = await Promise.all([
        PropertyViewTracker.getViewStats(filters),
        PropertyViewTracker.getTotalViews(filters)
      ]);

      setStats(propertyStats);
      setTotalViews(total);

    } catch (err) {
      console.error('Error loading property analytics:', err);
      setError('Kon property statistieken niet laden');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Laden...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadPropertyStats}
          className="mt-2 text-red-700 hover:text-red-800 underline text-sm"
        >
          Probeer opnieuw
        </button>
      </div>
    );
  }

  const activeProperties = stats.filter(p => p.view_count > 0);

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Property Weergaven</h3>
        </div>
      )}

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Totaal Weergaven</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{totalViews.toLocaleString()}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Totaal Properties</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.length}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Actieve Properties</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">{activeProperties.length}</p>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-600">Gem. per Property</span>
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            {stats.length > 0 ? Math.round(totalViews / stats.length) : 0}
          </p>
        </div>
      </div>

      {/* Detailed Property Stats Table */}
      {showDetailedStats && stats.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h4 className="font-medium text-gray-900">Property Prestaties</h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weergaven
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Laatst Bekeken
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Populariteit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.slice(0, 10).map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {property.title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {property.property_type || 'Onbekend'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {property.view_count || 0}
                        </span>
                        {property.view_count > 0 && (
                          <div 
                            className="ml-2 bg-blue-200 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (property.view_count / Math.max(...stats.map(s => s.view_count || 0))) * 100)}px` 
                            }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {property.last_viewed_at 
                        ? new Date(property.last_viewed_at).toLocaleDateString('nl-NL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : 'Nooit'
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {property.view_count === Math.max(...stats.map(s => s.view_count || 0)) && property.view_count > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800">
                            🏆 Populairste
                          </span>
                        )}
                        {property.view_count === 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Geen weergaven
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {stats.length > 10 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-600">
                Toont top 10 van {stats.length} properties
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {stats.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Home className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Geen property data</h3>
          <p className="text-gray-500">
            Er zijn nog geen properties met weergaven gevonden.
          </p>
        </div>
      )}
    </div>
  );
};
