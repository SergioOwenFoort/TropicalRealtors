import { useState, useEffect } from 'react';
import { BarChart3, Eye, TrendingUp, Calendar, Copy, Check } from 'lucide-react';
import { CarouselClickTracker } from '../../services/carouselClickTracker';
import { useAuth } from '../../hooks/useAuth';

interface ClickStats {
  id: string;
  title: string;
  image_url: string;
  island: string;
  click_count: number;
  last_clicked_at: string | null;
  created_by: string | null;
  created_at: string;
}

interface CarouselAnalyticsProps {
  showOnlyOwned?: boolean; // For realtors/owners to see only their slides
  island?: 'bonaire' | 'aruba' | 'curacao';
}

export function CarouselAnalytics({ showOnlyOwned = false, island }: CarouselAnalyticsProps) {
  const [stats, setStats] = useState<ClickStats[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadAnalytics();
  }, [showOnlyOwned, island, user]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      
      if (island) {
        filters.island = island;
      }
      
      if (showOnlyOwned && user?.id) {
        filters.createdBy = user.id;
      }

      const [clickStats, total] = await Promise.all([
        CarouselClickTracker.getClickStats(filters),
        CarouselClickTracker.getTotalClicks(filters)
      ]);

      setStats(clickStats);
      setTotalClicks(total);
    } catch (error) {
      console.error('Error loading carousel analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nooit';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); // Clear feedback after 2 seconds
      console.log('ID copied to clipboard:', id);
    } catch (err) {
      console.error('Failed to copy ID:', err);
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Carousel Analytics
        </h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Carousel Analytics
          {island && <span className="text-sm text-gray-500 capitalize">- {island}</span>}
        </h3>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Totaal Clicks</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{totalClicks.toLocaleString()}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Actieve Slides</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">{stats.length}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Gem. per Slide</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {stats.length > 0 ? Math.round(totalClicks / stats.length) : 0}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {stats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nog geen carousel slides gevonden</p>
            <p className="text-sm">Upload slides om analytics te zien</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Slide Performance</h4>
            
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slide
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Eiland
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Laatste Click
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.map((slide) => (
                    <tr key={slide.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={slide.image_url} 
                            alt={slide.title}
                            className="w-12 h-8 object-cover rounded mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {slide.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="capitalize text-sm text-gray-900">
                          {slide.island}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {slide.click_count || 0}
                          </span>
                          {slide.click_count > 0 && (
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.min(100, (slide.click_count / Math.max(...stats.map(s => s.click_count || 0))) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(slide.last_clicked_at)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-mono">
                              ID: {slide.id}
                            </span>
                            <button
                              onClick={() => handleCopyId(slide.id)}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title={copiedId === slide.id ? "Copied!" : "Copy ID to clipboard"}
                            >
                              {copiedId === slide.id ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
