import { useSearchParams } from 'react-router-dom';
import { create } from 'zustand';

type FilterState = {
  resetTrigger: number;
  triggerReset: () => void;
  updateFilter: (key: string, value: string) => void;
};

export const useFilterStore = create<FilterState>()((set) => ({
  resetTrigger: 0,
  triggerReset: () => set((state) => ({ resetTrigger: state.resetTrigger + 1 })),
  updateFilter: (key: string, value: string) => set(() => ({ resetTrigger: 0 })) // Placeholder implementation
}));

export function useFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const triggerReset = useFilterStore((state) => state.triggerReset);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Update the store's updateFilter function
  useFilterStore.setState({ updateFilter });

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
    triggerReset();
  };

  return {
    searchParams,
    resetFilters,
    updateFilter
  };
}
