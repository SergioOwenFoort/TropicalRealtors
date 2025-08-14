import React from 'react';
import { Home } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export function TypeFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilter = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentType = searchParams.get('type');
    
    // If clicking the same button that's already active, deselect it
    if (currentType === value) {
      newParams.delete('type');
    } else {
      newParams.set('type', value);
    }
    
    setSearchParams(newParams);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Home className="w-5 h-5" />
        Type
      </h3>
      <div className="flex gap-2">
        <button
          onClick={() => updateFilter('koop')}
          className={`px-4 py-2 rounded-lg text-sm ${
            searchParams.get('type') === 'koop'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Koop
        </button>
        <button
          onClick={() => updateFilter('huur')}
          className={`px-4 py-2 rounded-lg text-sm ${
            searchParams.get('type') === 'huur'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Huur
        </button>
      </div>
    </div>
  );
}
