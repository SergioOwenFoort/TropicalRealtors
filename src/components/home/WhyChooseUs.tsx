import React from 'react';
import { Globe2, Shield, HeartHandshake, Search } from 'lucide-react';

const FEATURES = [
  {
    icon: Globe2,
    title: 'Caribisch Netwerk',
    description: 'Toegang tot vele woningen, vakantiehuizen, hotels en resorts via ons uitgebreid netwerk.'
  },
  {
    icon: Shield,
    title: 'Veilig & Betrouwbaar',
    description: 'Alle deelnemers zorgen zorgvuldig voor hun aanbod.'
  },
  {
    icon: HeartHandshake,
    title: 'Persoonlijke Service',
    description: 'Lokale experts staan klaar om u te helpen bij elke stap van het proces.'
  },
  {
    icon: Search,
    title: 'Slim Zoeken',
    description: 'Geavanceerde zoekfuncties helpen u de perfecte woning te vinden in uw droomeiland.'
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Waarom TropicalRealtors.com?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Wij maken het vinden van uw droomhuis in het Caribbisch gebied eenvoudig
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
