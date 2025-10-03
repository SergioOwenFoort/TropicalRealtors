import { LoadingSpinner } from '../LoadingSpinner';
import { PropertyCard } from '../ui/PropertyCard';
import { useIslandProperties, useMasterIsland } from '../../contexts/MasterIslandContext';

export function FeaturedProperties() {
  const { properties, featuredProperties, loading, error } = useIslandProperties();
  const { selectedIsland } = useMasterIsland();

  // Debug logging
  console.log('🏝️ FeaturedProperties render:', {
    selectedIsland,
    propertiesCount: properties?.length || 0,
    featuredCount: featuredProperties?.length || 0,
    loading,
    error
  });

  const getIslandDisplayName = (island: string) => {
    switch (island) {
      case 'bonaire':
        return 'Bonaire';
      case 'aruba':
        return 'Aruba';
      case 'curacao':
        return 'Curaçao';
      case 'saba':
        return 'Saba';
      case 'sint-eustatius':
        return 'Sint Eustatius';
      case 'sint-maarten':
        return 'Sint Maarten';
      default:
        return island;
    }
  };

  if (loading) {
    return (
      <div className="py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Uitgelichte Woningen</h2>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Uitgelichte Woningen</h2>
          <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
            <p className="text-sm sm:text-base">
              Er is een fout opgetreden bij het laden van de woningen. Probeer het later opnieuw.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Uitgelichte Woningen</h2>
          <div className="text-center text-gray-600 p-6 bg-gray-50 rounded-lg">
            <p className="text-sm sm:text-base">
              Er zijn momenteel geen woningen beschikbaar voor {getIslandDisplayName(selectedIsland)}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section key={selectedIsland} className="py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Uitgelichte Woningen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard key={`${selectedIsland}-${property.id}`} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
