import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bell, Trash2, User, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { useFavorites } from '../../hooks/useFavorites';
import { useProfile } from '../../hooks/useProfile';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import { usePaginatedFavorites } from '../../hooks/usePaginatedFavorites';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ConversationsDashboard } from '../../components/messages/ConversationsDashboard';

export function UserDashboard() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { favorites } = useFavorites();
  const { savedSearches, deleteSearch } = useSavedSearches();
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(false);
  const { 
    properties: favoriteProperties, 
    loading: favoritesLoading, 
    hasMore, 
    loadMore 
  } = usePaginatedFavorites(6);

  if (profileLoading || favoritesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welkom, {profile?.display_name || user?.email}</h1>
        <p className="text-gray-600">Beheer uw favorieten en bezichtigingsaanvragen</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Uw Berichten</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm mb-6">
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
    </main>
  );
}
