import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink, Image as ImageIcon, MousePointer, BarChart3, Copy, Check } from 'lucide-react';
import { CarouselSlideUploader } from '../shared/CarouselSlideUploader';
import { useCarouselSlides } from '../../hooks/useCarouselSlides';
import { useUserRole } from '../../hooks/useUserRole';
import { useAuth } from '../../hooks/useAuth';
import { CarouselSlide } from '../../types';

type CarouselManagementProps = {
  searchId?: string;
};

export function CarouselManagement({ searchId }: CarouselManagementProps) {
  const { isAdmin } = useUserRole();
  const { user } = useAuth();
  const { slides, userSlides, loading, fetchSlidesByUser, fetchAllSlides, deleteSlide, toggleSlideStatus } = useCarouselSlides();
  const [showUploader, setShowUploader] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [displaySlides, setDisplaySlides] = useState<CarouselSlide[]>([]);
  const [clickStats, setClickStats] = useState<{ [key: string]: number }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) fetchAllSlides();
    else if (user?.id) fetchSlidesByUser(user.id);
  }, [isAdmin, user?.id]);

  useEffect(() => {
    let currentSlides = isAdmin ? slides : userSlides;
    if (searchId && searchId.trim() !== '') {
      currentSlides = currentSlides.filter(slide => slide.id.toLowerCase().includes(searchId.toLowerCase()));
    }
    setDisplaySlides(currentSlides);
    const loadClickStats = async () => {
      const stats: { [key: string]: number } = {};
      for (const slide of currentSlides) {
        stats[slide.id] = slide.click_count || 0;
      }
      setClickStats(stats);
    };
    if (currentSlides.length > 0) loadClickStats();
  }, [slides, userSlides, isAdmin, searchId]);

  const handleDeleteSlide = async (id: string, island: string) => {
    if (window.confirm('Weet u zeker dat u deze slide wilt verwijderen?')) {
      await deleteSlide(id, island);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, island: string) => {
    await toggleSlideStatus(id, !currentStatus, island);
  };

  const handleEditSlide = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setShowUploader(true);
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCloseUploader = () => {
    setShowUploader(false);
    setEditingSlide(null);
  };

  const handleSuccess = () => {
    if (isAdmin) fetchAllSlides();
    else if (user?.id) fetchSlidesByUser(user.id);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Carousel Beheer & Analytics
            {isAdmin && <span className="text-sm text-gray-500 ml-2">(Alle slides)</span>}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Beheer carousel slides en bekijk click-statistieken in één overzicht
          </p>
        </div>
        <button
          onClick={() => setShowUploader(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Nieuwe Slide
        </button>
      </div>

      {displaySlides.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Totaal Clicks</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {Object.values(clickStats).reduce((sum, count) => sum + count, 0)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Actieve Slides</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {displaySlides.filter(s => s.is_active).length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Gem. per Slide</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {displaySlides.length > 0 ? Math.round(Object.values(clickStats).reduce((sum, count) => sum + count, 0) / displaySlides.length) : 0}
            </p>
          </div>
        </div>
      )}

      {displaySlides.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Geen slides gevonden</h3>
          <p className="text-gray-500 mb-6">
            {isAdmin
              ? 'Er zijn nog geen carousel slides aangemaakt.'
              : 'U heeft nog geen carousel slides aangemaakt.'}
          </p>
          <button
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
          >
            <Plus className="w-4 h-4" /> Eerste Slide Aanmaken
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displaySlides.map((slide) => (
            <div
              key={slide.id}
              className={`border rounded-lg p-4 transition-colors ${
                slide.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-24 h-16 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 truncate">{slide.title}</h3>
                      {slide.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{slide.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                        <span>🏝️ {slide.island.charAt(0).toUpperCase() + slide.island.slice(1)}</span>
                        <span>📊 Volgorde: {slide.display_order}</span>
                        <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
                          <MousePointer className="w-3 h-3 text-blue-600" />
                          <span className="text-blue-700 font-medium">{clickStats[slide.id] || 0} clicks</span>
                        </div>
                        {slide.external_link && (
                          <a
                            href={slide.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Link
                          </a>
                        )}
                        {slide.last_clicked_at && (
                          <div className="mt-2 text-xs text-gray-500">
                            Laatst geklikt: {new Date(slide.last_clicked_at).toLocaleDateString('nl-NL', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                        <button
                          onClick={() => handleCopyId(slide.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title={copiedId === slide.id ? 'Copied!' : 'Copy ID to clipboard'}
                        >
                          {copiedId === slide.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleStatus(slide.id, slide.is_active, slide.island)}
                        className={`p-2 rounded-lg transition-colors ${
                          slide.is_active
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={slide.is_active ? 'Deactiveren' : 'Activeren'}
                      >
                        {slide.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEditSlide(slide)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        title="Bewerken"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id, slide.island)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    slide.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {slide.is_active ? 'Actief' : 'Inactief'}
                </span>
                <span className="text-xs text-gray-500">
                  Aangemaakt: {new Date(slide.created_at).toLocaleDateString('nl-NL')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploader && (
        <CarouselSlideUploader
          onClose={handleCloseUploader}
          onSuccess={handleSuccess}
          initialData={editingSlide || undefined}
          isEditing={!!editingSlide}
          slideId={editingSlide?.id}
        />
      )}
    </div>
  );
}
