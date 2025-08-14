import React from 'react';
import { useNavigate } from 'react-router-dom';

const POPULAR_CITIES = [
  {
    name: 'Amsterdam',
    image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 2453
  },
  {
    name: 'Rotterdam',
    image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 1832
  },
  {
    name: 'Den Haag',
    image: 'https://images.unsplash.com/photo-1558865869-c93f6f8482af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 1654
  },
  {
    name: 'Utrecht',
    image: 'https://images.unsplash.com/photo-1558865869-c93f6f8482af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 1243
  }
];

export function PopularCities() {
  const navigate = useNavigate();

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Populaire Steden</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {POPULAR_CITIES.map((city) => (
            <div
              key={city.name}
              onClick={() => navigate(`/zoeken?city=${encodeURIComponent(city.name)}`)}
              className="relative rounded-lg overflow-hidden cursor-pointer group"
            >
              <div className="aspect-[4/3]">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-xl font-semibold mb-1">{city.name}</h3>
                <p className="text-sm opacity-90">{city.count} woningen</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
