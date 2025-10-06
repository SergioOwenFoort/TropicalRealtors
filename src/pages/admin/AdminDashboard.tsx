import { useState, useEffect } from 'react';
const ALL_ISLANDS = [
  { key: 'bonaire', label: 'Bonaire' },
  { key: 'aruba', label: 'Aruba' },
  { key: 'curacao', label: 'Curaçao' },
  { key: 'sintmaarten', label: 'Sint Maarten' },
  { key: 'saba', label: 'Saba' },
  { key: 'sinteustatius', label: 'Sint Eustatius' }
];
import { useNavigate } from 'react-router-dom';
import { Plus, Star, Edit, Building2, Users, Trash2, FileText, Settings, Database, UserCheck, Image as ImageIcon, BarChart3, Copy, Check } from 'lucide-react';
import { PropertyStatusBadge } from '../../components/realtor/PropertyStatusBadge';
import { useAllProperties, useProperties } from '../../hooks/useProperties';
import { Property } from '../../types';
import { UserManagement } from './UserManagement';
import { CsvUploader } from '../../components/realtor/CsvUploader';
import { WebhookTest } from '../../components/realtor/WebhookTest';
import { ContentEditor } from '../../components/admin/ContentEditor';
import { DatabaseMaintenance } from '../../components/admin/DatabaseMaintenance';
import { RealtorManagement } from '../../components/admin/RealtorManagement';
import { CarouselManagement } from '../../components/admin/CarouselManagement';
import { PropertyAnalytics } from '../../components/analytics/PropertyAnalytics';
import { useUserRole } from '../../hooks/useUserRole';
// import { ListingUploader } from '../../components/realtor/ListingUploader';

type Tab = 'properties' | 'analytics' | 'users' | 'realtors' | 'carousel' | 'content' | 'tools' | 'maintenance';

export function AdminDashboard() {
  // Island visibility state (localStorage for persistence)
  const [islandVisibility, setIslandVisibility] = useState<{[key: string]: boolean}>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Load from localStorage or default to all enabled
    const stored = localStorage.getItem('islandVisibility');
    if (stored) {
      setIslandVisibility(JSON.parse(stored));
    } else {
      const allEnabled: {[key: string]: boolean} = {};
      ALL_ISLANDS.forEach(i => { allEnabled[i.key] = true; });
      setIslandVisibility(allEnabled);
    }
  }, []);

  const handleToggleIsland = (key: string) => {
    setIslandVisibility(prev => {
      setIsDirty(true);
      return { ...prev, [key]: !prev[key] };
    });
  };

  const handleSaveIslands = () => {
    localStorage.setItem('islandVisibility', JSON.stringify(islandVisibility));
    setIsDirty(false);
    // Optionally, trigger a reload or event for other components to update
  };

  // Helper to get enabled islands
  // const getEnabledIslands = () => ALL_ISLANDS.filter(i => islandVisibility[i.key]);
  const [carouselSearch, setCarouselSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [propertySearch, setPropertySearch] = useState('');

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = id;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };
  const navigate = useNavigate();
  const { properties } = useAllProperties();
  const { deleteProperty, toggleFeatured } = useProperties();
  const [statusFilter, setStatusFilter] = useState<Property['status'] | 'alle'>('alle');
  const [islandFilter, setIslandFilter] = useState<string>('alle');
  const [activeTab, setActiveTab] = useState<Tab>('properties');
  const { isAdmin, isLoading: roleLoading } = useUserRole();

  // Redirect non-admin users
  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

  const filteredProperties = properties.filter(p => {
    const statusMatches = statusFilter === 'alle' || p.status === statusFilter;
    const islandMatches = islandFilter === 'alle' || p.country === islandFilter;
    const searchMatch =
      !propertySearch ||
      p.address?.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.id?.toLowerCase().includes(propertySearch.toLowerCase());
    return statusMatches && islandMatches && searchMatch;
  });

  const handleEditProperty = (propertyId: string) => {
    navigate(`/admin/woning/${propertyId}/bewerken`);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Weet u zeker dat u deze woning wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      try {
        await deleteProperty(propertyId);
        console.log('Property deleted:', propertyId);
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const handleToggleFeatured = async (propertyId: string, currentFeatured: boolean) => {
    try {
      await toggleFeatured(propertyId, !currentFeatured);
      console.log('Toggle featured:', propertyId, !currentFeatured);
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold mb-3">Eilanden zichtbaar voor bezoekers</h3>
        <div className="flex flex-wrap gap-4">
          {ALL_ISLANDS.map(island => (
            <label key={island.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!islandVisibility[island.key]}
                onChange={() => handleToggleIsland(island.key)}
                className="accent-blue-600 w-5 h-5"
              />
              <span className="font-medium text-gray-700">{island.label}</span>
            </label>
          ))}
        </div>
        <button
          className={`mt-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow ${isDirty ? '' : 'opacity-50 cursor-not-allowed'}`}
          onClick={handleSaveIslands}
          disabled={!isDirty}
        >
          Opslaan
        </button>
        <p className="text-xs text-gray-500 mt-2">Uitgeschakelde eilanden worden overal verborgen voor bezoekers en bij uploads.</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => navigate('/admin/woning/nieuw')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow"
        >
          <Plus className="w-4 h-4" />
          Nieuwe woning toevoegen
        </button>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('properties')}
              className={`${
                activeTab === 'properties'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <Building2 className="w-4 h-4" />
              Woningen
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <BarChart3 className="w-4 h-4" />
              Statistieken
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <Users className="w-4 h-4" />
              Gebruikers
            </button>
            <button
              onClick={() => setActiveTab('realtors')}
              className={`${
                activeTab === 'realtors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <UserCheck className="w-4 h-4" />
              Makelaars
            </button>
            <button
              onClick={() => setActiveTab('carousel')}
              className={`${
                activeTab === 'carousel'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <ImageIcon className="w-4 h-4" />
              Carousel
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <FileText className="w-4 h-4" />
              Content Editor
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`${
                activeTab === 'tools'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <Settings className="w-4 h-4" />
              Tools
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`${
                activeTab === 'maintenance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
            >
              <Database className="w-4 h-4" />
              Database Beheer
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'properties' ? (
        <div className="space-y-6">
          {/* Property Search Bar */}
          <div className="mb-4 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Zoek op adres of ID..."
                className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={propertySearch}
                onChange={e => setPropertySearch(e.target.value)}
              />
              <svg className="absolute left-3 top-2.5 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="7"/><line x1="16" y1="16" x2="12.5" y2="12.5"/></svg>
              {propertySearch && (
                <button
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setPropertySearch('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            {/* Status Filter */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filter op Status:</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('alle')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusFilter === 'alle'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Alle
                </button>
                <button
                  onClick={() => setStatusFilter('actief')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusFilter === 'actief'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Actief
                </button>
                <button
                  onClick={() => setStatusFilter('verkocht')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusFilter === 'verkocht'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Verkocht
                </button>
                <button
                  onClick={() => setStatusFilter('verhuurd')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusFilter === 'verhuurd'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Verhuurd
                </button>
                <button
                  onClick={() => setStatusFilter('concept')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusFilter === 'concept'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Concept
                </button>
                <button
                  onClick={() => setStatusFilter('ingetrokken')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusFilter === 'ingetrokken'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Ingetrokken
                </button>
              </div>
            </div>

            {/* Island Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filter op Eiland:</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIslandFilter('alle')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    islandFilter === 'alle'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Alle Eilanden
                </button>
                <button
                  onClick={() => setIslandFilter('Aruba')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    islandFilter === 'Aruba'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Aruba
                </button>
                <button
                  onClick={() => setIslandFilter('Bonaire')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    islandFilter === 'Bonaire'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Bonaire
                </button>
                <button
                  onClick={() => setIslandFilter('Curaçao')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    islandFilter === 'Curaçao'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Curaçao
                </button>
                <button
                  onClick={() => setIslandFilter('Saba')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    islandFilter === 'Saba'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Saba
                </button>
                <button
                  onClick={() => setIslandFilter('Sint Eustatius')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    islandFilter === 'Sint Eustatius'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sint Eustatius
                </button>
                <button
                  onClick={() => setIslandFilter('Sint Maarten')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    islandFilter === 'Sint Maarten'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sint Maarten
                </button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">
                  {filteredProperties.length} van {properties.length} woningen
                </span>
                {statusFilter !== 'alle' && (
                  <span className="ml-2">
                    • Status: <span className="font-medium">{statusFilter}</span>
                  </span>
                )}
                {islandFilter !== 'alle' && (
                  <span className="ml-2">
                    • Eiland: <span className="font-medium">{islandFilter}</span>
                  </span>
                )}
              </div>
              {(statusFilter !== 'alle' || islandFilter !== 'alle') && (
                <button
                  onClick={() => {
                    setStatusFilter('alle');
                    setIslandFilter('alle');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Reset alle filters
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titel / ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Eiland
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prijs
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
                  {filteredProperties.map((property) => (
                    <tr key={property.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={property.images?.[0] || '/placeholder-house.jpg'}
                              alt=""
                            />
                            {property.featured && (
                              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                                <Star className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {property.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 font-mono">ID: {property.id}</span>
                              <button
                                onClick={() => handleCopyId(property.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title={copiedId === property.id ? "Copied!" : "Copy ID to clipboard"}
                              >
                                {copiedId === property.id ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{property.address}</div>
                        <div className="text-sm text-gray-500">{property.city}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{property.country || 'Niet ingesteld'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {property.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PropertyStatusBadge status={property.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleToggleFeatured(property.id, property.featured)}
                            title={property.featured ? "Verwijder van uitgelicht" : "Maak uitgelicht"}
                            className={`p-1.5 rounded-md ${
                              property.featured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                            } hover:bg-opacity-80`}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditProperty(property.id)}
                            className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-md"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-md"
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
          </div>
          {/* ListingUploader available via dedicated route or modal */}
        </div>
      ) : activeTab === 'users' ? (
        <UserManagement />
      ) : activeTab === 'analytics' ? (
        <div className="space-y-6">
          <PropertyAnalytics showTitle={true} showDetailedStats={true} />
        </div>
      ) : activeTab === 'realtors' ? (
        <RealtorManagement />
      ) : activeTab === 'carousel' ? (
        <div className="space-y-6">
          {/* Carousel Search Bar */}
          <div className="mb-4 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Zoek op ID..."
                className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={carouselSearch}
                onChange={e => setCarouselSearch(e.target.value)}
              />
              <svg className="absolute left-3 top-2.5 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="7"/><line x1="16" y1="16" x2="12.5" y2="12.5"/></svg>
              {carouselSearch && (
                <button
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setCarouselSearch('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <CarouselManagement searchId={carouselSearch} />
        </div>
      ) : activeTab === 'content' ? (
        <ContentEditor />
      ) : activeTab === 'maintenance' ? (
        <DatabaseMaintenance />
      ) : (
        <div className="space-y-8 mb-8">
          {/* ListingUrlInput removed */}
          <WebhookTest />
          <CsvUploader />
        </div>
      )}

      {/* ListingUploader removed */}
    </main>
  );
}
