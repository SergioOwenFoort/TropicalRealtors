import React, { useState, useEffect } from 'react';
import { Link2, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { webhookService } from '../../services/webhookService';
import { storageService } from '../../services/storageService';
import { ListingUrl } from '../../types/listing';
import { toast } from 'react-hot-toast';

export function ListingUrlInput() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentListings, setRecentListings] = useState<ListingUrl[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRecentListings();
    }
  }, [user]);

  const loadRecentListings = async () => {
    if (!user) return;
    try {
      const listings = await storageService.getUserListings(user.id);
      setRecentListings(listings);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !user) {
      toast.error('U moet ingelogd zijn en een URL invoeren');
      return;
    }

    setLoading(true);
    try {
      // Save URL to Firebase
      await storageService.saveListingUrl(url.trim(), user.id);
      
      // Send to webhook
      await webhookService.processListingUrl(url.trim(), user.id);
      
      toast.success('URL succesvol verwerkt');
      setUrl('');
      
      // Refresh listings
      await loadRecentListings();
    } catch (error) {
      console.error('Error processing URL:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Er is een fout opgetreden bij het verwerken van de URL';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Listing URL verwerken</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Link2 className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Plak een listing URL..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 min-w-[120px] justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verwerken...</span>
            </>
          ) : (
            <span>Verwerken</span>
          )}
        </button>
      </form>

      {recentListings.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recente URLs</h3>
          <div className="space-y-2">
            {recentListings.map((listing) => (
              <div
                key={listing.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {listing.url}
                    </p>
                    <p className="text-xs text-gray-500">
                      {listing.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  listing.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : listing.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {listing.status === 'completed' ? 'Voltooid' :
                   listing.status === 'failed' ? 'Mislukt' : 'In behandeling'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
