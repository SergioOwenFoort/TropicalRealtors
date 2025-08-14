import React, { createContext, useState, useContext, useEffect } from 'react';
import { detectUserIsland } from '../utils/locationDetection';

type Island = 'bonaire' | 'aruba' | 'curacao' | 'saba';

interface IslandContextType {
  selectedIsland: Island;
  setSelectedIsland: (island: Island) => void;
  isAutoDetected: boolean;
  isDetecting: boolean;
}

const IslandContext = createContext<IslandContextType | undefined>(undefined);

export const IslandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  
  // Initialize island selection with auto-detection
  const [selectedIsland, setSelectedIsland] = useState<Island>(() => {
    const savedIsland = localStorage.getItem('selectedIsland');
    const wasAutoDetected = localStorage.getItem('islandAutoDetected') === 'true';
    
    // If user manually set an island, use that
    if (savedIsland && !wasAutoDetected) {
      return savedIsland as Island;
    }
    
    // Otherwise, we'll auto-detect (default to bonaire for now)
    return 'bonaire';
  });

  // Auto-detect user location on first load
  useEffect(() => {
    const shouldAutoDetect = () => {
      const savedIsland = localStorage.getItem('selectedIsland');
      const wasAutoDetected = localStorage.getItem('islandAutoDetected') === 'true';
      const hasManualSelection = savedIsland && !wasAutoDetected;
      
      // Only auto-detect if user hasn't manually selected an island
      return !hasManualSelection;
    };

    if (shouldAutoDetect()) {
      setIsDetecting(true);
      
      detectUserIsland()
        .then((detectedIsland) => {
          setSelectedIsland(detectedIsland);
          setIsAutoDetected(true);
          localStorage.setItem('selectedIsland', detectedIsland);
          localStorage.setItem('islandAutoDetected', 'true');
          console.log(`Auto-detected island: ${detectedIsland}`);
        })
        .catch((error) => {
          console.warn('Auto-detection failed, using default:', error);
          setIsAutoDetected(false);
        })
        .finally(() => {
          setIsDetecting(false);
        });
    }
  }, []);

  // Custom setter that marks as manual selection
  const handleSetSelectedIsland = (island: Island) => {
    setSelectedIsland(island);
    setIsAutoDetected(false);
    localStorage.setItem('selectedIsland', island);
    localStorage.setItem('islandAutoDetected', 'false');
  };

  // Save to localStorage whenever the selected island changes
  useEffect(() => {
    localStorage.setItem('selectedIsland', selectedIsland);
  }, [selectedIsland]);

  return (
    <IslandContext.Provider value={{ 
      selectedIsland, 
      setSelectedIsland: handleSetSelectedIsland,
      isAutoDetected,
      isDetecting
    }}>
      {children}
    </IslandContext.Provider>
  );
};

export const useIsland = (): IslandContextType => {
  const context = useContext(IslandContext);
  if (context === undefined) {
    throw new Error('useIsland must be used within an IslandProvider');
  }
  return context;
};
