import { LoadingSpinner } from '../LoadingSpinner';
import { PropertyCard } from '../ui/PropertyCard';
import { useIslandProperties, useMasterIsland } from '../../contexts/MasterIslandContext';
export function FeaturedProperties() {
  const { properties, featuredProperties, loading, error } = useIslandProperties();
  const { selectedIsland } = useMasterIsland();

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
      default:
        return island;
    }
  };

  if (loading) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Uitgelichte Woningen</h2>
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600 p-4">
            Er is een fout opgetreden bij het laden van de woningen. Probeer het later opnieuw.
          </div>
        </div>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-600 p-4">
            Er zijn momenteel geen woningen beschikbaar voor {getIslandDisplayName(selectedIsland)}.
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Uitgelichte Woningen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
