import { createContext } from 'react';
import { Property } from '../types';

export interface PropertyContextType {
  properties: Property[];
  loading: boolean;
  error: string | null;
  refreshProperties: () => Promise<void>;
  addProperty: (property: Partial<Property>) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
}

export const PropertyContext = createContext<PropertyContextType | null>(null);