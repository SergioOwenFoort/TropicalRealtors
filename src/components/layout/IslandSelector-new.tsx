import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useIsland } from '../../contexts/MasterIslandContext';
import { getIslandDisplayName } from '../../data/countries';
import { Flag } from '../ui/Flag';

export function IslandSelector() {
  const { selectedIsland, setSelectedIsland } = useIsland();
  const [isOpen, setIsOpen] = useState(false);

  const islands = [
    { id: 'aruba' as const, name: 'Aruba' },
    { id: 'bonaire' as const, name: 'Bonaire' },
    { id: 'curacao' as const, name: 'Curaçao' },
  ];

  const handleIslandSelect = (island: 'bonaire' | 'aruba' | 'curacao') => {
    setSelectedIsland(island);
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
          <Flag country={selectedIsland as any} size="sm" className="mr-2" />{getIslandDisplayName(selectedIsland)}
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
              {islands.map((island) => (
                <button
                  key={island.id}
                  onClick={() => handleIslandSelect(island.id)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    selectedIsland === island.id 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      <Flag country={island.id as any} size="sm" className="mr-2" />
                    </span>
                    <span>{island.name}</span>
                    {selectedIsland === island.id && (
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
