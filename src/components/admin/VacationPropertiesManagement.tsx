import { useState, useMemo } from 'react';
import { Search, Trash2, Edit, Eye, Copy, Check } from 'lucide-react';
import { useVacationProperties } from '../../hooks/useVacationProperties';
import { supabase } from '../../config/supabase.config';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CARIBBEAN_ISLANDS = [
  'Aruba',
  'Bonaire',
  'Curaçao',
  'Sint Maarten',
  'Saba',
  'Sint Eustatius'
];

export function VacationPropertiesManagement() {
  const { properties, loading, error, refetch } = useVacationProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIsland, setSelectedIsland] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter properties based on search and island
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = !searchTerm || 
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesIsland = selectedIsland === 'all' || property.island === selectedIsland;
      
      return matchesSearch && matchesIsland;
    });
  }, [properties, searchTerm, selectedIsland]);

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('ID gekopieerd naar klembord');
    } catch (error) {
      console.error('Error copying ID:', error);
      toast.error('Fout bij kopiëren van ID');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Weet u zeker dat u "${name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vacation_properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Vakantiewoning verwijderd');
      refetch();
    } catch (error) {
      console.error('Error deleting vacation property:', error);
      toast.error('Fout bij verwijderen van vakantiewoning');
    }
  };

  const handleView = (id: string) => {
    navigate(`/vakantie/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Fout bij laden van vakantiewoningen: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Vakantiewoningen Beheer</h2>
        <p className="text-gray-600 mt-1">{properties.length} vakantiewoningen in totaal</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Zoek op naam, stad of ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Island Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedIsland('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedIsland === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alle eilanden ({properties.length})
          </button>
          {CARIBBEAN_ISLANDS.map(island => {
            const count = properties.filter(p => p.island === island).length;
            return (
              <button
                key={island}
                onClick={() => setSelectedIsland(island)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedIsland === island
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {island} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{filteredProperties.length}</span> {filteredProperties.length === 1 ? 'resultaat' : 'resultaten'}
        </p>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Woning
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locatie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prijs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gasten
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <p className="text-lg font-medium">Geen vakantiewoningen gevonden</p>
                      <p className="text-sm mt-1">Probeer een andere zoekopdracht of filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {property.images && property.images.length > 0 && (
                          <img
                            src={property.images[0]}
                            alt={property.name}
                            className="h-10 w-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {property.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>ID: {property.id.slice(0, 8)}...</span>
                            <button
                              onClick={() => handleCopyId(property.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Kopieer volledig ID"
                            >
                              {copiedId === property.id ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.city}</div>
                      <div className="text-xs text-gray-500">{property.island}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.property_type.replace('vacation_', '').replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        €{property.price.toLocaleString('nl-NL')}
                      </div>
                      <div className="text-xs text-gray-500">per nacht</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.max_guests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : property.status === 'booked'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status === 'available' ? 'Beschikbaar' : 
                         property.status === 'booked' ? 'Geboekt' : 
                         property.status === 'maintenance' ? 'Onderhoud' : 'Inactief'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(property.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Bekijken"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(property.id, property.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Verwijderen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
