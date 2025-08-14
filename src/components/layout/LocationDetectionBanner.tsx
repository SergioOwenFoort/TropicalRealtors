import { useState, useEffect } from 'react';
import { MapPin, X, Check } from 'lucide-react';
import { useIsland } from '../../contexts/MasterIslandContext';
import { getIslandDisplayLabel } from '../../data/countries';
import { Flag } from '../ui/Flag';

export function LocationDetectionBanner() {
  const { selectedIsland, setSelectedIsland, isAutoDetected, isDetecting } = useIsland();
  const [showBanner, setShowBanner] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this banner
    const dismissed = localStorage.getItem('locationBannerDismissed') === 'true';
    setHasBeenDismissed(dismissed);
    
    // Show banner when auto-detection completes and hasn't been dismissed
    if (isAutoDetected && !dismissed && !isDetecting) {
      setShowBanner(true);
    }
  }, [isAutoDetected, isDetecting]);

  const handleDismiss = () => {
    setShowBanner(false);
    setHasBeenDismissed(true);
    localStorage.setItem('locationBannerDismissed', 'true');
  };

  const handleChangeIsland = (island: 'bonaire' | 'aruba' | 'curacao') => {
    setSelectedIsland(island);
    handleDismiss();
  };

  if (!showBanner || hasBeenDismissed || isDetecting) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Sluiten"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            Locatie gedetecteerd
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            We hebben automatisch <strong><Flag country={selectedIsland as any} size="sm" className="inline mr-1" />{getIslandDisplayLabel(selectedIsland)}</strong> geselecteerd 
            op basis van uw locatie. Is dit correct?
          </p>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
            >
              <Check className="w-3 h-3" />
              Ja, correct
            </button>
            
            <div className="flex gap-1">
              {(['aruba', 'bonaire', 'curacao'] as const)
                .filter(island => island !== selectedIsland)
                .map(island => (
                  <button
                    key={island}
                    onClick={() => handleChangeIsland(island)}
                    className="px-3 py-1 bg-white border border-blue-300 text-blue-700 text-xs rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <Flag country={island as any} size="sm" className="inline mr-1" />{getIslandDisplayLabel(island)}
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
