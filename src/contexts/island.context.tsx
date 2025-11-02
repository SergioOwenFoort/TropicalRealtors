import React, { createContext, useState, useContext, useEffect } from 'react';

type Island = 'bonaire' | 'aruba' | 'curacao' | 'saba';

interface IslandContextType {
  selectedIsland: Island;
  setSelectedIsland: (island: Island) => void;
  isAutoDetected: boolean;
  isDetecting: boolean;
}

const IslandContext = createContext<IslandContextType | undefined>(undefined);

export const IslandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDetecting] = useState(false);
  const [isAutoDetected] = useState(false);
  
  // Initialize island selection from localStorage or default to bonaire
  const [selectedIsland, setSelectedIsland] = useState<Island>(() => {
    const savedIsland = localStorage.getItem('selectedIsland');
    
    // If user set an island, use that
    if (savedIsland && ['bonaire', 'aruba', 'curacao', 'saba'].includes(savedIsland)) {
      return savedIsland as Island;
    }
    
    // Otherwise, default to bonaire
    return 'bonaire';
  });

  // Custom setter that saves to localStorage
  const handleSetSelectedIsland = (island: Island) => {
    setSelectedIsland(island);
    localStorage.setItem('selectedIsland', island);
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
