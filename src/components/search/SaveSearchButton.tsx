import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import { useAuth } from '../../hooks/useAuth';

interface SaveSearchButtonProps {
  className?: string;
}

export function SaveSearchButton({ className = '' }: SaveSearchButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const { saveSearch } = useSavedSearches();
  const { user } = useAuth();

  // Check if there are any active filters
  const hasActiveFilters = Array.from(searchParams.entries()).length > 0;

  const handleSaveSearch = async () => {
    if (!searchName.trim()) return;

    setIsSaving(true);
    const success = await saveSearch(searchName.trim(), searchParams);
    
    if (success) {
      setIsModalOpen(false);
      setSearchName('');
    }
    setIsSaving(false);
  };

  const handleOpenModal = () => {
    if (!user) {
      return;
    }
    
    // Generate a default name based on current filters
    let defaultName = 'Zoekopdracht';
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const price = searchParams.get('price');
    
    if (type) {
      defaultName = type === 'koop' ? 'Koopwoningen' : 'Huurwoningen';
    }
    
    if (location) {
      const locations = location.split(',');
      if (locations.length === 1) {
        defaultName += ` in ${locations[0]}`;
      } else if (locations.length > 1) {
        defaultName += ` in ${locations.length} locaties`;
      }
    }
    
    if (price) {
      const [min, max] = price.split('-');
      if (max) {
        defaultName += ` €${parseInt(min).toLocaleString()}-${parseInt(max).toLocaleString()}`;
      } else {
        defaultName += ` vanaf €${parseInt(min).toLocaleString()}`;
      }
    }
    
    setSearchName(defaultName);
    setIsModalOpen(true);
  };

  if (!user) {
    return null; // Don't show the button if user is not logged in
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={!hasActiveFilters}
        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
          hasActiveFilters
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        } ${className}`}
        title={hasActiveFilters ? 'Zoekopdracht opslaan' : 'Geen actieve filters om op te slaan'}
      >
        <Save className="w-4 h-4" />
        Opslaan
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Zoekopdracht opslaan</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <label htmlFor="searchName" className="block text-sm font-medium text-gray-700 mb-2">
                  Naam voor de zoekopdracht
                </label>
                <input
                  id="searchName"
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Bijv. Koopwoningen in Kralendijk"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveSearch();
                    }
                  }}
                />
              </div>

              <div className="mb-4 text-sm text-gray-600">
                <p className="mb-2">Deze zoekopdracht bevat:</p>
                <ul className="space-y-1">
                  {Array.from(searchParams.entries()).map(([key, value]) => {
                    let displayKey = key;
                    let displayValue = value;
                    
                    switch (key) {
                      case 'type':
                        displayKey = 'Type';
                        displayValue = value === 'koop' ? 'Koop' : 'Huur';
                        break;
                      case 'location':
                        displayKey = 'Locatie';
                        displayValue = value.split(',').join(', ');
                        break;
                      case 'price':
                        displayKey = 'Prijs';
                        const [min, max] = value.split('-');
                        displayValue = max ? 
                          `€${parseInt(min).toLocaleString()} - €${parseInt(max).toLocaleString()}` :
                          `vanaf €${parseInt(min).toLocaleString()}`;
                        break;
                      case 'bedrooms':
                        displayKey = 'Slaapkamers';
                        displayValue = `${value}+`;
                        break;
                      case 'size':
                        displayKey = 'Oppervlak';
                        const [minSize, maxSize] = value.split('-');
                        displayValue = maxSize ? 
                          `${minSize} - ${maxSize} m²` :
                          `vanaf ${minSize} m²`;
                        break;
                    }
                    
                    return (
                      <li key={key} className="flex justify-between">
                        <span>{displayKey}:</span>
                        <span className="font-medium">{displayValue}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSaveSearch}
                  disabled={!searchName.trim() || isSaving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
