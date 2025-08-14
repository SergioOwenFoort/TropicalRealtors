import React from 'react';
import { Square } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const SIZES = [
  { min: 0, max: 50, label: '< 50m²' },
  { min: 50, max: 75, label: '50 - 75m²' },
  { min: 75, max: 100, label: '75 - 100m²' },
  { min: 100, max: 150, label: '100 - 150m²' },
  { min: 150, max: null, label: '> 150m²' }
];

export function SizeFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilter = (min: number, max: number | null) => {
    const newParams = new URLSearchParams(searchParams);
    const value = `${min}-${max || ''}`;
    if (value) {
      newParams.set('size', value);
    } else {
      newParams.delete('size');
    }
    setSearchParams(newParams);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Square className="w-5 h-5" />
        Woonoppervlak
      </h3>
      <div className="space-y-2">
        {SIZES.map((size) => (
          <button
            key={size.label}
            onClick={() => updateFilter(size.min, size.max)}
            className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
              searchParams.get('size') === `${size.min}-${size.max || ''}`
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
}
