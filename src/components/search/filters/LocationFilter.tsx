import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getLocationsByIsland } from '../../../data/countries';
import { useFilter } from '../../../hooks/useFilter';
import { useIsland } from '../../../contexts/MasterIslandContext';
import { Flag } from '../../ui/Flag';

// Optionally, import cities if you want to include them
// import { CITIES } from '../../../data/cities';

export function LocationFilter() {
  const [searchParams] = useSearchParams();
  const [showAllLocations, setShowAllLocations] = useState(false);
  const { updateFilter } = useFilter();
  const { selectedIsland } = useIsland();

  // Get selected locations from URL parameters
  const selectedLocations = searchParams.get('location')?.split(',') || [];
  
  // Get locations for the currently selected island
  const currentIslandLocations = getLocationsByIsland(selectedIsland);

  // Effect to show all locations if a non-top location is selected
  useEffect(() => {
    if (selectedLocations.some(location => !currentIslandLocations.slice(0, 10).some(c => c.label === location))) {
      setShowAllLocations(true);
    }
  }, [selectedLocations, currentIslandLocations]);

  const handleLocationChange = (location: string) => {
    const newSelectedLocations = selectedLocations.includes(location)
      ? selectedLocations.filter(l => l !== location)
      : [...selectedLocations, location];
    updateFilter('location', newSelectedLocations.length > 0 ? newSelectedLocations.join(',') : '');
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Locaties
      </h3>
      <div className="space-y-2">
        {/* Show first 10 locations or all locations based on showAllLocations state */}
        {(showAllLocations ? currentIslandLocations : currentIslandLocations.slice(0, 10)).map(location => (
          <label key={location.label} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedLocations.includes(location.label)}
              onChange={() => handleLocationChange(location.label)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm flex items-center gap-1">
              <Flag country={selectedIsland} size="sm" />
              {location.label}
            </span>
          </label>
        ))}

        {/* Show the toggle button only if there are more than 10 locations */}
        {currentIslandLocations.length > 10 && (
          <button
            onClick={() => setShowAllLocations(!showAllLocations)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            {showAllLocations ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Minder locaties tonen
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Meer locaties tonen ({currentIslandLocations.length - 10} extra)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}