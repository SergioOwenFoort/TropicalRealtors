import React from 'react';
import { Bed } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const BEDROOM_OPTIONS = [
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' }
];

export function BedroomFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilter = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('bedrooms', value);
    } else {
      newParams.delete('bedrooms');
    }
    setSearchParams(newParams);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Bed className="w-5 h-5" />
        Slaapkamers
      </h3>
      <div className="flex gap-2">
        {BEDROOM_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateFilter(value)}
            className={`px-4 py-2 rounded-lg text-sm ${
              searchParams.get('bedrooms') === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
