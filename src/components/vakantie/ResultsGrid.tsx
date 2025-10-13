import { PropertyCard, VacationProperty } from './PropertyCard';

interface ResultsGridProps {
  properties: VacationProperty[];
}

export function ResultsGrid({ properties }: ResultsGridProps) {
  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Geen accommodaties gevonden
        </h3>
        <p className="text-gray-600 mb-4">
          Probeer je zoekfilters aan te passen om meer resultaten te vinden.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-sm text-gray-500">Probeer:</span>
          <span className="text-sm bg-gray-100 px-2 py-1 rounded">Andere datums</span>
          <span className="text-sm bg-gray-100 px-2 py-1 rounded">Andere locatie</span>
          <span className="text-sm bg-gray-100 px-2 py-1 rounded">Meer gasten</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}