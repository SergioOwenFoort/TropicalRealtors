import { Link } from 'react-router-dom';
import { getLocationsByIsland } from '../../data/countries';
import { useIsland } from '../../contexts/MasterIslandContext';
import { Flag } from '../ui/Flag';

interface CountryMenuProps {
  mobile?: boolean;
  onSelect?: () => void;
}

export function CountryMenu({ mobile, onSelect }: CountryMenuProps) {
  const { selectedIsland } = useIsland();

  // Get locations for the selected island
  const locations = getLocationsByIsland(selectedIsland as any);

  if (mobile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-1 gap-2">
          {locations.map((location, index) => {
            const locationName = typeof location === 'object' && location && 'label' in location 
              ? location.label 
              : typeof location === 'string' 
              ? location 
              : 'Unknown Location';

            return (
              <Link
                key={`${locationName}-${index}`}
                to={`/locaties/${locationName.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                onClick={onSelect}
              >
                <Flag country={selectedIsland as any} size="md" />
                <span className="text-base">{locationName}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border p-4 max-h-80 overflow-y-auto min-w-[400px] z-50">
      <div className="grid grid-cols-2 gap-3">
        {locations.map((location, index) => {
          const locationName = typeof location === 'object' && location && 'label' in location 
            ? location.label 
            : typeof location === 'string' 
            ? location 
            : 'Unknown Location';

          return (
            <Link
              key={`${locationName}-${index}`}
              to={`/locaties/${locationName.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium border border-gray-100 hover:border-blue-200"
              onClick={onSelect}
            >
              <Flag country={selectedIsland as any} size="md" />
              <span className="text-base font-semibold">{locationName}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
