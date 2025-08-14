import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useFilter } from '../../hooks/useFilter';
import { TypeFilter } from './filters/TypeFilter';
import { LocationFilter } from './filters/LocationFilter';
import { PriceFilter } from './filters/PriceFilter';
import { BedroomFilter } from './filters/BedroomFilter';
import { SizeFilter } from './filters/SizeFilter';
import { SaveSearchButton } from './SaveSearchButton';

export function SearchFilters() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { resetFilters } = useFilter();

  // Check if screen is desktop size
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

  // Set initial expanded state based on screen size
  useEffect(() => {
    setIsExpanded(isDesktop);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between lg:hidden"
      >
        <span className="font-semibold">Filters</span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden lg:block'} p-6 space-y-6`}>
        {/* Save Search Button */}
        <div className="flex justify-end">
          <SaveSearchButton />
        </div>
        
        <TypeFilter />
        <LocationFilter />
        <PriceFilter />
        <BedroomFilter />
        <SizeFilter />

        {/* Reset Filters Button */}
        <button
          onClick={resetFilters}
          className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-600"
        >
          Filters wissen
        </button>
      </div>
    </div>
  );
}
