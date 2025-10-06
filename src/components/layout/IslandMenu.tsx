import React from 'react';
import { Link } from 'react-router-dom';
import { CARIBBEAN_COUNTRIES } from '../../data/countries';
import { useIsland } from '../../contexts/MasterIslandContext';
import { Flag } from '../ui/Flag';

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

  // Helper function to convert island label to flag country format
  const getCountryFromLabel = (label: string): 'aruba' | 'bonaire' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten' => {
    const labelMap: Record<string, any> = {
      'Aruba': 'aruba',
      'Bonaire': 'bonaire',
      'Curaçao': 'curacao',
      'Saba': 'saba',
      'Sint Eustatius': 'sint-eustatius',
      'Sint Maarten': 'sint-maarten'
    };
    return labelMap[label] || 'bonaire';
  };

  if (mobile) {
    return (
      <>
        {CARIBBEAN_COUNTRIES.map((island) => (
          <Link
            key={island.label}
            to="#"
            className={`flex items-center gap-2 py-2 ${selectedIsland === island.label ? 'text-blue-600 font-medium' : 'text-gray-600'} hover:text-blue-600`}
            onClick={(e) => handleIslandSelect(island.label, e)}
          >
            <Flag country={getCountryFromLabel(island.label)} size="sm" />
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
          <Flag country={getCountryFromLabel(island.label)} size="sm" />
          <span className={selectedIsland === island.label ? 'text-blue-600' : 'text-gray-700'}>
            {island.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
