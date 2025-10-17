import { useState, useMemo } from 'react';
import { SearchBar } from '../components/vakantie/SearchBar';
import { FilterSidebar } from '../components/vakantie/FilterSidebar';
import { ResultsGrid } from '../components/vakantie/ResultsGrid';
import { MapToggle } from '../components/vakantie/MapToggle';
import { SortDropdown } from '../components/vakantie/SortDropdown';
import { InteractiveVacationMap } from '../components/vakantie/InteractiveVacationMap';
import { useVacationProperties } from '../hooks/useVacationProperties';
import { Filter } from 'lucide-react';

interface SearchFilters {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  propertyType: string;
  priceRange: [number, number];
  starRating: number;
  distanceFromCenter: number;
  amenities: string[];
  freeCancellation: boolean;
}

interface SortOption {
  value: string;
  label: string;
}

const sortOptions: SortOption[] = [
  { value: 'recommended', label: 'Aanbevolen' },
  { value: 'price-low', label: 'Laagste prijs' },
  { value: 'price-high', label: 'Hoogste prijs' },
  { value: 'rating', label: 'Hoogste beoordeling' },
  { value: 'distance', label: 'Afstand tot centrum' }
];

export function VakantiePage() {
  const { properties: vacationProperties, loading, error } = useVacationProperties();
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState<SearchFilters>({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    propertyType: '',
    priceRange: [0, 1000],
    starRating: 0,
    distanceFromCenter: 50,
    amenities: [],
    freeCancellation: false
  });

  // Filter and sort properties based on current filters and sort option
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = vacationProperties.filter(property => {
      // Apply filters - using database field names (snake_case)
      if (filters.destination) {
        const searchTerm = filters.destination.toLowerCase();
        const matchesCity = property.city?.toLowerCase().includes(searchTerm);
        const matchesIsland = property.island?.toLowerCase().includes(searchTerm);
        const matchesCountry = property.country?.toLowerCase().includes(searchTerm);
        if (!matchesCity && !matchesIsland && !matchesCountry) {
          return false;
        }
      }
      if (filters.propertyType && property.property_type !== filters.propertyType) {
        return false;
      }
      if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
        return false;
      }
      if (filters.starRating > 0 && (property.rating || 0) < filters.starRating) {
        return false;
      }
      if ((property.distance_from_center || 0) > filters.distanceFromCenter) {
        return false;
      }
      if (filters.amenities.length > 0 && !filters.amenities.every(amenity => property.amenities?.includes(amenity))) {
        return false;
      }
      if (filters.freeCancellation && property.cancellation_policy !== 'flexible') {
        return false;
      }
      return true;
    });

    // Apply sorting - using database field names
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'distance':
        filtered.sort((a, b) => (a.distance_from_center || 0) - (b.distance_from_center || 0));
        break;
      default: // recommended
        // Keep original order for recommended
        break;
    }

    return filtered;
  }, [vacationProperties, filters, sortBy]);

  const handleSearch = (searchData: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...searchData }));
  };

  const handleFilterChange = (filterData: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...filterData }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vakantiehuizen laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Er is een fout opgetreden bij het laden van de accommodaties.</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Vind jouw perfecte vakantieverblijf
            </h1>
            <p className="text-lg text-gray-600">
              Ontdek de mooiste accommodaties op de Caribische eilanden
            </p>
          </div>
          
          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} filters={filters} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <FilterSidebar 
                filters={filters} 
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>

                {/* Results Count */}
                <div className="text-gray-600">
                  <span className="font-semibold">{filteredAndSortedProperties.length}</span> accommodaties gevonden
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <SortDropdown
                  value={sortBy}
                  onChange={setSortBy}
                  options={sortOptions}
                />

                {/* Map Toggle */}
                <MapToggle
                  showMap={showMap}
                  onToggle={() => setShowMap(!showMap)}
                />
              </div>
            </div>

            {/* Mobile Filter Panel */}
            {showFilters && (
              <div className="lg:hidden mb-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                  <FilterSidebar 
                    filters={filters} 
                    onFilterChange={handleFilterChange}
                    mobile
                  />
                </div>
              </div>
            )}

            {/* Results Grid */}
            {showMap ? (
              <InteractiveVacationMap 
                properties={vacationProperties}
                selectedIsland={filters.destination || null}
              />
            ) : (
              <ResultsGrid properties={filteredAndSortedProperties} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}