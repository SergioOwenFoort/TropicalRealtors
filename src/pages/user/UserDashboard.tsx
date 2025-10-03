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
import { SimpleMessagesDashboard } from '../../components/messages/SimpleMessagesDashboard';

export const UserDashboard = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { favorites } = useFavorites();
  const { savedSearches, deleteSearch } = useSavedSearches();
  const { 
    properties: favoriteProperties, 
    loading: favoritesLoading, 
    hasMore, 
    loadMore 
  } = usePaginatedFavorites(6);
  
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(false);

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <h3 className="text-lg font-semibold">Bezichtigingen</h3>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Profiel</h3>
              <p className="text-sm text-gray-600">Voltooid</p>
            </div>
          </div>
        </div>

        {/* Collapsible Messages Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Berichten</h3>
              <p className="text-sm text-gray-600">Communicatie</p>
            </div>
            <button
              onClick={() => setIsMessagesExpanded(!isMessagesExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMessagesExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Messages Dashboard */}
      {isMessagesExpanded && (
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Uw Berichten</h2>
          <SimpleMessagesDashboard />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Uw Favorieten</h2>
            <Link to="/zoeken" className="text-red-600 hover:text-red-700 font-medium">
              Meer zoeken →
            </Link>
          </div>

          {favoriteProperties.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nog geen favorieten</h3>
              <p className="text-gray-600 mb-4">
                Begin met het verkennen van woningen en voeg ze toe aan uw favorieten
              </p>
              <Link 
                to="/zoeken" 
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Woningen bekijken
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favoriteProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              
              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={loadMore}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Meer laden
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Opgeslagen Zoekopdrachten</h3>
            {savedSearches.length === 0 ? (
              <p className="text-gray-600 text-sm">
                U heeft nog geen opgeslagen zoekopdrachten
              </p>
            ) : (
              <div className="space-y-3">
                {savedSearches.map((search) => (
                  <div key={search.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{search.name}</p>
                      <p className="text-sm text-gray-600">
                        Opgeslagen zoekopdracht
                      </p>
                    </div>
                    <button
                      onClick={() => deleteSearch(search.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Profiel Beheer</h3>
            <div className="space-y-3">
              <Link 
                to="/profiel"
                className="block w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <span>Profiel bewerken</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
