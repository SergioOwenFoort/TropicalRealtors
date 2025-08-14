import React, { useState } from 'react';
import { getEnabledIslandOptions } from '../../utils/islandVisibility';
import { MapPin, ChevronDown } from 'lucide-react';
import { useIsland } from '../../contexts/MasterIslandContext';
import { getIslandDisplayLabel } from '../../data/countries';
import { Flag } from '../ui/Flag';

export function IslandSelector() {
  const { selectedIsland, setSelectedIsland } = useIsland();
  const [isOpen, setIsOpen] = useState(false);

  const [enabledIslands, setEnabledIslands] = useState<Array<{ key: string; label: string; flag: string }>>(getEnabledIslandOptions());
  // Listen for changes to localStorage islandVisibility and update enabledIslands
  React.useEffect(() => {
    let last = JSON.stringify(localStorage.getItem('islandVisibility'));
    const check = () => {
      const current = JSON.stringify(localStorage.getItem('islandVisibility'));
      if (current !== last) {
        last = current;
        setEnabledIslands(getEnabledIslandOptions());
      }
    };
    const interval = setInterval(check, 500);
    window.addEventListener('storage', check);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', check);
    };
  }, []);

  const handleIslandSelect = (island: string) => {
    setSelectedIsland(island as any);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MapPin className="w-4 h-4" />
        <span className="hidden sm:inline">
          <Flag country={selectedIsland as any} size="sm" className="mr-2" />
          {getIslandDisplayLabel(selectedIsland)}
        </span>
        <span className="sm:hidden">
          <Flag country={selectedIsland as any} size="sm" />
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {enabledIslands.map((island: { key: string; label: string; flag: string }) => (
                <button
                  key={island.key}
                  onClick={() => handleIslandSelect(island.key)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    selectedIsland === island.key 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Flag country={island.key as any} size="sm" />
                    <span>{island.label}</span>
                    {selectedIsland === island.key && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
