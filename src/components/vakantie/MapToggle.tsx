import { Map, Grid } from 'lucide-react';

interface MapToggleProps {
  showMap: boolean;
  onToggle: () => void;
}

export function MapToggle({ showMap, onToggle }: MapToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {showMap ? (
        <>
          <Grid className="w-4 h-4" />
          <span>Lijst</span>
        </>
      ) : (
        <>
          <Map className="w-4 h-4" />
          <span>Kaart</span>
        </>
      )}
    </button>
  );
}