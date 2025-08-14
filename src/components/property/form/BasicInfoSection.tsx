import React from 'react';
import { Property } from '../../../types';

const PROPERTY_CATEGORIES = [
  { value: 'appartementen', label: 'Appartement' },
  { value: 'huizen', label: 'Huis' },
  { value: 'vakantiewoningen', label: 'Vakantiewoning' },
  { value: 'nieuwbouw', label: 'Nieuwbouw' }
];

interface BasicInfoSectionProps {
  property: Omit<Property, 'id' | 'datePosted' | 'makelaarId'>;
  onChange: (updates: Partial<typeof property>) => void;
  isAdmin: boolean;
}

export function BasicInfoSection({ property, onChange, isAdmin }: BasicInfoSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Basis Informatie</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titel
          </label>
          <input
            type="text"
            value={property.title}
            onChange={e => onChange({ title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={property.type}
            onChange={e => onChange({ type: e.target.value as 'koop' | 'huur' })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          >
            <option value="koop">Koop</option>
            <option value="huur">Huur</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categorie
          </label>
          <select
            value={property.category}
            onChange={e => onChange({ category: e.target.value as Property['category'] })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          >
            {PROPERTY_CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prijs
          </label>
          <input
            type="number"
            value={property.price}
            onChange={e => onChange({ price: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={property.status}
            onChange={e => onChange({ status: e.target.value as Property['status'] })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          >
            <option value="concept">Concept</option>
            <option value="actief">Actief</option>
            <option value="verkocht">Verkocht</option>
            <option value="verhuurd">Verhuurd</option>
            <option value="ingetrokken">Ingetrokken</option>
          </select>
        </div>

        {isAdmin && (
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={property.featured}
                onChange={e => onChange({ featured: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Uitgelicht
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
