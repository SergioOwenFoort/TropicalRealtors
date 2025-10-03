import { useState } from 'react';
import { useIslandProperties, useMasterIsland } from '../../contexts/MasterIslandContext';

export function MobileDebugInfo() {
  const [isVisible, setIsVisible] = useState(false);
  const { properties, featuredProperties, loading, error } = useIslandProperties();
  const { selectedIsland, switchIsland, refreshIslandData } = useMasterIsland();

  const handleForceRefresh = () => {
    console.log('Force refreshing island data for:', selectedIsland);
    refreshIslandData();
  };

  const handleSwitchIsland = (island: string) => {
    console.log('Force switching to island:', island);
    switchIsland(island as any);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full text-xs z-50 md:hidden"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-xs text-xs md:hidden">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 text-gray-500 text-lg"
      >
        ×
      </button>
      <div className="space-y-2">
        <div><strong>Island:</strong> {selectedIsland}</div>
        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        <div><strong>Error:</strong> {error || 'None'}</div>
        <div><strong>Properties:</strong> {properties?.length || 0}</div>
        <div><strong>Featured:</strong> {featuredProperties?.length || 0}</div>
        <div><strong>Screen:</strong> {window.innerWidth}x{window.innerHeight}</div>
        <div><strong>User Agent:</strong> {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</div>
        
        <button 
          onClick={handleForceRefresh}
          className="w-full bg-blue-500 text-white p-1 rounded text-xs mt-2"
        >
          Force Refresh
        </button>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {['aruba', 'bonaire', 'curacao', 'saba', 'sint-eustatius', 'sint-maarten'].map(island => (
            <button
              key={island}
              onClick={() => handleSwitchIsland(island)}
              className={`px-2 py-1 text-xs rounded ${
                selectedIsland === island 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {island.charAt(0).toUpperCase() + island.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
