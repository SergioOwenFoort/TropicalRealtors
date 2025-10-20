import { Link } from 'react-router-dom';
import { Plus, AlertCircle, Heart, Bell, Trash2, User, MessageSquare, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useRoleBasedProperties } from '../../hooks/useRoleBasedProperties';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites } from '../../hooks/useFavorites';
import { useProfile } from '../../hooks/useProfile';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import { usePaginatedFavorites } from '../../hooks/usePaginatedFavorites';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { OwnerPropertyTable } from '../../components/owner/OwnerPropertyTable';
import { CarouselManagement } from '../../components/admin/CarouselManagement';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ConversationsDashboard } from '../../components/messages/ConversationsDashboard';
import { VacationPropertyUploader } from '../../components/horo/VacationPropertyUploader';
import { useEffect, useState } from 'react';

export function OwnerDashboard() {
  const { user } = useAuth();
  const { properties, loading: propertiesLoading, refreshProperties } = useRoleBasedProperties();
  const { profile, loading: profileLoading } = useProfile();
  const { favorites } = useFavorites();
  const { savedSearches, deleteSearch } = useSavedSearches();
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(false);
  const [showAddListing, setShowAddListing] = useState(false);
  const { 
    properties: favoriteProperties, 
    loading: favoritesLoading, 
    hasMore, 
    loadMore 
  } = usePaginatedFavorites(6);
  
  const userProperties = properties; // All properties returned by getPropertiesByUser are already user's properties
  const canAddProperty = userProperties.length < 3;

  // Handlers for property management
  const handlePropertyDeleted = () => {
    refreshProperties();
  };

  // Simplified initialization - no need for complex claim logic
  useEffect(() => {
    // Properties load automatically via useProperties hook
    // No additional action needed
  }, []);

  if (profileLoading || propertiesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Section */}
      <div className="mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <span className="text-lg font-medium text-gray-900">
                {profile?.display_name || user?.email?.split('@')[0] || 'Gebruiker'}
              </span>
            </div>
            <Link
              to="/profiel"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              <User className="w-4 h-4" />
              Mijn Profiel
            </Link>
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Mijn Berichten</h2>
          <button
            onClick={() => setIsMessagesExpanded(!isMessagesExpanded)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            {isMessagesExpanded ? (
              <>
                <span>Verbergen</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Bekijken</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        {isMessagesExpanded && (
          <ConversationsDashboard />
        )}
      </div>

      {/* Carousel Management */}
      <div className="mb-12">
        <CarouselManagement />
      </div>

      {/* Mijn Listings Section - Enhanced Table */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Mijn Listings ({userProperties.length}/3)</h1>
            <p className="text-gray-600 mt-1">Beheer uw woningaanbod met uitgebreide statistieken</p>
          </div>
          <div className="flex gap-3">
            {canAddProperty && (
              <button
                onClick={() => setShowAddListing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nieuwe listing toevoegen
              </button>
            )}
            {!canAddProperty && userProperties.length >= 3 && (
              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Limiet bereikt (3/3)
              </div>
            )}
          </div>
        </div>

        <OwnerPropertyTable 
          properties={userProperties}
          onPropertyDeleted={handlePropertyDeleted}
          onAddListing={() => setShowAddListing(true)}
        />

        {userProperties.length > 0 && (
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-600">
              <p className="font-semibold">Let op:</p>
              <p>Als huiseigenaar kunt u maximaal 3 woningen beheren ({userProperties.length}/3 gebruikt). Neem contact op met een makelaar als u meer woningen wilt aanbieden.</p>
            </div>
          </div>
        )}
      </div>

      {/* User Dashboard Features - Stats Cards */}
      <div className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Favorieten</h3>
                <p className="text-2xl font-bold">{favorites.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Zoekopdrachten</h3>
                <p className="text-2xl font-bold">{savedSearches.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Dashboard Features - Favorites and Saved Searches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Favoriete Woningen</h2>
            </div>
            <div className="p-6">
              {favoriteProperties.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favoriteProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                  {hasMore && (
                    <div className="text-center mt-6">
                      <button
                        onClick={loadMore}
                        disabled={favoritesLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {favoritesLoading ? 'Laden...' : 'Meer laden'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Heart className="w-12 h-12 mx-auto mb-4 stroke-1" />
                  <p>U heeft nog geen woningen als favoriet gemarkeerd</p>
                  <Link to="/zoeken" className="text-blue-600 hover:underline mt-2 inline-block">
                    Bekijk alle woningen
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Zoekopdrachten</h2>
            </div>
            <div className="divide-y">
              {savedSearches.map((search) => {
                // Convert search params back to URL string
                const searchUrl = new URLSearchParams(search.searchParams).toString();
                const searchLink = searchUrl ? `/zoeken?${searchUrl}` : '/zoeken';
                
                return (
                  <div key={search.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <Link to={searchLink} className="block flex-1">
                        <h3 className="font-medium mb-1">{search.name}</h3>
                        <p className="text-sm text-gray-500">
                          Opgeslagen op {new Date(search.date).toLocaleDateString()}
                        </p>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (window.confirm('Weet u zeker dat u deze zoekopdracht wilt verwijderen?')) {
                            deleteSearch(search.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 ml-2"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {savedSearches.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Bell className="w-12 h-12 mx-auto mb-4 stroke-1" />
                  <p>U heeft nog geen zoekopdrachten opgeslagen</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Listing Modal */}
      {showAddListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddListing(false)} />
          <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Nieuwe listing toevoegen</h2>
              <button
                onClick={() => setShowAddListing(false)}
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Sluiten"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <VacationPropertyUploader
                onClose={() => setShowAddListing(false)}
                onSuccess={() => {
                  setShowAddListing(false);
                  // Optionally refresh properties after successful add
                  try { refreshProperties(); } catch {}
                }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
