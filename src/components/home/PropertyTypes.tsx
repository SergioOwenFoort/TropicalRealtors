import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, Warehouse, TreePine } from 'lucide-react';
import { FEATURED_PROPERTIES } from '../../data/properties';

const getPropertyCountByType = (type: string): number => {
  return FEATURED_PROPERTIES.filter(p => {
    switch (type.toLowerCase()) {
      case 'appartementen':
        return p.title.toLowerCase().includes('appartement');
      case 'huizen':
        return p.title.toLowerCase().includes('huis') || p.title.toLowerCase().includes('villa');
      case 'vakantiewoningen':
        return p.title.toLowerCase().includes('vakantie') || p.title.toLowerCase().includes('chalet');
      case 'nieuwbouw':
        return p.features.some(f => f.toLowerCase() === 'nieuwbouw');
      default:
        return false;
    }
  }).length;
};

const PROPERTY_TYPES = [
  {
    name: 'Appartementen',
    icon: Building2,
    color: 'bg-blue-500'
  },
  {
    name: 'Huizen',
    icon: Home,
    color: 'bg-green-500'
  },
  {
    name: 'Vakantiewoningen',
    icon: TreePine,
    color: 'bg-orange-500'
  },
  {
    name: 'Nieuwbouw',
    icon: Warehouse,
    color: 'bg-purple-500'
  }
];

export function PropertyTypes() {
  const navigate = useNavigate();

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Ontdek per Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROPERTY_TYPES.map((type) => {
            const count = getPropertyCountByType(type.name);
            
            return (
              <div
                key={type.name}
                onClick={() => navigate(`/zoeken?type=${encodeURIComponent(type.name.toLowerCase())}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
              >
                <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mb-4`}>
                  <type.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{type.name}</h3>
                <p className="text-gray-600">
                  {count} {count === 1 ? 'beschikbaar' : 'beschikbaar'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
