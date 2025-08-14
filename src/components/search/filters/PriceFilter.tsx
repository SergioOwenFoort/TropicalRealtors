import React from 'react';
import { Euro } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const PRICE_RANGES = [
  { min: 0, max: 200000, label: '< €200.000' },
  { min: 200000, max: 300000, label: '€200.000 - €300.000' },
  { min: 300000, max: 400000, label: '€300.000 - €400.000' },
  { min: 400000, max: 500000, label: '€400.000 - €500.000' },
  { min: 500000, max: null, label: '> €500.000' }
];

export function PriceFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilter = (min: number, max: number | null) => {
    const newParams = new URLSearchParams(searchParams);
    const value = `${min}-${max || ''}`;
    if (value) {
      newParams.set('price', value);
    } else {
      newParams.delete('price');
    }
    setSearchParams(newParams);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Euro className="w-5 h-5" />
        Prijsklasse
      </h3>
      <div className="space-y-2">
        {PRICE_RANGES.map((range) => (
          <button
            key={range.label}
            onClick={() => updateFilter(range.min, range.max)}
            className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
              searchParams.get('price') === `${range.min}-${range.max || ''}`
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}
