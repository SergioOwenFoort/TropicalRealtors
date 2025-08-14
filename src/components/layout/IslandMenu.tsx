import React from 'react';
import { Link } from 'react-router-dom';
import { CARIBBEAN_COUNTRIES } from '../../data/countries';
import { useIsland } from '../../contexts/MasterIslandContext';

interface IslandMenuProps {
  mobile?: boolean;
  onSelect?: () => void;
}

export function IslandMenu({ mobile, onSelect }: IslandMenuProps) {
  const { selectedIsland, setSelectedIsland } = useIsland();

  const handleIslandSelect = (islandName: string, event: React.MouseEvent) => {
    event.preventDefault();
    setSelectedIsland(islandName as any);
    if (onSelect) {
      onSelect();
    }
  };

  if (mobile) {
    return (
      <>
        {CARIBBEAN_COUNTRIES.map((island) => (
          <Link
            key={island.label}
            to="#"
            className={`block py-2 ${selectedIsland === island.label ? 'text-blue-600 font-medium' : 'text-gray-600'} hover:text-blue-600`}
            onClick={(e) => handleIslandSelect(island.label, e)}
          >
            <span className="mr-2">{island.flag}</span>
            {island.label}
          </Link>
        ))}
      </>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border py-2 w-48">
      {CARIBBEAN_COUNTRIES.map((island) => (
        <Link
          key={island.label}
          to="#"
          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${selectedIsland === island.label ? 'bg-gray-50 text-blue-600 font-medium' : ''}`}
          onClick={(e) => handleIslandSelect(island.label, e)}
        >
          <span className="inline-block w-6 text-center">{island.flag}</span>
          <span className={selectedIsland === island.label ? 'text-blue-600' : 'text-gray-700'}>
            {island.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
