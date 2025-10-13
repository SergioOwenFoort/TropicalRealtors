import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, Home } from 'lucide-react';

interface SearchFilters {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  propertyType: string;
}

interface SearchBarProps {
  onSearch: (filters: Partial<SearchFilters>) => void;
  filters: SearchFilters;
}

const propertyTypes = [
  { value: '', label: 'Alle types' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'resort', label: 'Resort' },
  { value: 'vacation-house', label: 'Vakantiehuis' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'villa', label: 'Villa' }
];

const popularDestinations = [
  'Aruba',
  'Bonaire',
  'Curaçao',
  'Saba',
  'Sint Eustatius',
  'Sint Maarten'
];

export function SearchBar({ onSearch, filters }: SearchBarProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const destinationRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };

    if (showDestinationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDestinationDropdown]);

  const handleInputChange = (field: keyof SearchFilters, value: string | number) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
  };

  const handleSearch = () => {
    onSearch(localFilters);
    setShowDestinationDropdown(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDestinationSelect = (destination: string) => {
    handleInputChange('destination', destination);
    setShowDestinationDropdown(false);
  };

  const toggleDestinationDropdown = () => {
    setShowDestinationDropdown(!showDestinationDropdown);
  };

  // Get tomorrow's date as minimum check-in date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get minimum check-out date (day after check-in)
  const checkInDate = localFilters.checkIn ? new Date(localFilters.checkIn) : new Date();
  checkInDate.setDate(checkInDate.getDate() + 1);
  const minCheckOutDate = checkInDate.toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Destination */}
        <div className="relative lg:col-span-2" ref={destinationRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Bestemming
          </label>
          <div className="relative">
            <input
              type="text"
              value={localFilters.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              onClick={toggleDestinationDropdown}
              onKeyPress={handleKeyPress}
              placeholder="Waar ga je naartoe?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            
            {showDestinationDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2">Populaire bestemmingen</div>
                  {popularDestinations.map((destination) => (
                    <button
                      key={destination}
                      onClick={() => handleDestinationSelect(destination)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      <MapPin className="w-3 h-3 inline mr-2 text-gray-400" />
                      {destination}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Aankomst
          </label>
          <input
            type="date"
            value={localFilters.checkIn}
            onChange={(e) => handleInputChange('checkIn', e.target.value)}
            min={minDate}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Vertrek
          </label>
          <input
            type="date"
            value={localFilters.checkOut}
            onChange={(e) => handleInputChange('checkOut', e.target.value)}
            min={localFilters.checkIn || minCheckOutDate}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Guests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Gasten
          </label>
          <select
            value={localFilters.guests}
            onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'gast' : 'gasten'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Second Row - Property Type and Search Button */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {/* Property Type */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Home className="w-4 h-4 inline mr-1" />
            Type accommodatie
          </label>
          <select
            value={localFilters.propertyType}
            onChange={(e) => handleInputChange('propertyType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
            {propertyTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Search className="w-5 h-5" />
            <span>Zoeken</span>
          </button>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-600">Snel zoeken:</span>
        {['Hotels in Aruba', 'Resorts in Curaçao', 'Vakantiehuizen Bonaire'].map((quickFilter) => (
          <button
            key={quickFilter}
            onClick={() => {
              const [type, location] = quickFilter.toLowerCase().includes('hotel') 
                ? ['hotel', quickFilter.split(' in ')[1]] 
                : quickFilter.toLowerCase().includes('resort')
                ? ['resort', quickFilter.split(' in ')[1]]
                : ['vacation-house', quickFilter.split(' ')[1]];
              
              setLocalFilters(prev => ({
                ...prev,
                propertyType: type,
                destination: location
              }));
            }}
            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            {quickFilter}
          </button>
        ))}
      </div>
    </div>
  );
}