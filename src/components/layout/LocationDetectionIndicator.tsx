import { MapPin } from 'lucide-react';
import { useIsland } from '../../contexts/MasterIslandContext';

export function LocationDetectionIndicator() {
  const { isDetecting } = useIsland();

  if (!isDetecting) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-3 border border-gray-200 animate-pulse">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-blue-600 animate-bounce" />
        <span className="text-sm text-gray-700">Locatie detecteren...</span>
      </div>
    </div>
  );
}
