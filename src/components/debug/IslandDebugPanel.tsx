import { useMasterIsland } from '../../contexts/MasterIslandContext';

export function IslandDebugPanel() {
  const { 
    selectedIsland, 
    islandData, 
    isLoading, 
    hasErrors 
  } = useMasterIsland();

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-2">🏝️ Island Debug Panel</h3>
      
      <div className="text-xs space-y-1">
        <div><strong>Current:</strong> {selectedIsland}</div>
        <div><strong>Status:</strong> {isLoading ? 'Loading...' : 'Ready'}</div>
        
        {hasErrors && (
          <div className="text-red-600"><strong>Errors:</strong> Yes</div>
        )}
        
        <div className="mt-2">
          <strong>Data:</strong>
          <div className="ml-2">
            <div>Properties: {islandData.properties.length}</div>
            <div>Featured: {islandData.featuredProperties.length}</div>
            <div>Realtors: {islandData.realtors.length}</div>
            <div>Carousel: {islandData.carouselSlides.length}</div>
          </div>
        </div>
        
        <div className="mt-2">
          <strong>Loading States:</strong>
          <div className="ml-2">
            <div>Properties: {islandData.loading.properties ? '⏳' : '✅'}</div>
            <div>Realtors: {islandData.loading.realtors ? '⏳' : '✅'}</div>
            <div>Carousel: {islandData.loading.carousel ? '⏳' : '✅'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
