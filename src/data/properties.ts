import { Property } from '../types';

// Common features that can be suggested when adding properties
export const COMMON_FEATURES = [
  'Balkon',
  'Terras',
  'Tuin',
  'Garage',
  'Parkeerplaats',
  'Lift',
  'Airconditioning',
  'Sauna',
  'Zwembad',
  'Zeezicht',
  'Bergzicht',
  'Dakterras',
  'Smart home',
  'Zonnepanelen',
  'Energielabel A',
  'Dubbel glas',
  'Gemeubileerd',
  'Nieuwbouw',
  'Historisch pand'
];

const JAN_ID = 'jan.devries@makelaardij.nl';

export const FEATURED_PROPERTIES: Property[] = [
  // Nederland
  {
    id: 'amsterdam-1',
    title: 'Luxe Penthouse in Amsterdam',
    price: 875000,
    address: 'Herengracht 123',
    city: 'Amsterdam',
    country: 'Nederland',
    postalCode: '1017 BM',
    bedrooms: 3,
    bathrooms: 2,
    size: 150,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Prachtig penthouse met panoramisch uitzicht over de grachten van Amsterdam. Voorzien van alle moderne gemakken.',
    type: 'koop',
    category: 'appartementen',
    features: ['Dakterras', 'Lift', 'Parkeerplaats', 'Smart home'],
    datePosted: '2024-03-15',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  },
  // Spanje
  {
    id: 'barcelona-1',
    title: 'Villa met Zeezicht in Barcelona',
    price: 1250000,
    address: 'Carrer de la Marina 456',
    city: 'Barcelona',
    country: 'Spanje',
    postalCode: '08013',
    bedrooms: 4,
    bathrooms: 3,
    size: 280,
    images: [
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Prachtige villa met adembenemend uitzicht over de Middellandse Zee. Moderne architectuur en luxe afwerking.',
    type: 'koop',
    category: 'huizen',
    features: ['Zwembad', 'Zeezicht', 'Tuin', 'Smart home'],
    datePosted: '2024-03-13',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  },
  // Frankrijk
  {
    id: 'nice-1',
    title: 'Luxe Appartement in Nice',
    price: 890000,
    address: 'Promenade des Anglais 789',
    city: 'Nice',
    country: 'Frankrijk',
    postalCode: '06000',
    bedrooms: 3,
    bathrooms: 2,
    size: 120,
    images: [
      'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Modern appartement met panoramisch uitzicht over de Middellandse Zee. Op loopafstand van het strand en het centrum.',
    type: 'koop',
    category: 'appartementen',
    features: ['Zeezicht', 'Balkon', 'Airconditioning', 'Parkeerplaats'],
    datePosted: '2024-03-12',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  },
  // Italië
  {
    id: 'toscane-1',
    title: 'Toscaanse Villa met Wijngaard',
    price: 1450000,
    address: 'Via del Chianti 234',
    city: 'Siena',
    country: 'Italië',
    postalCode: '53100',
    bedrooms: 5,
    bathrooms: 4,
    size: 350,
    images: [
      'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Authentieke Toscaanse villa met eigen wijngaard en olijfboomgaard. Volledig gerenoveerd met behoud van originele details.',
    type: 'koop',
    category: 'huizen',
    features: ['Zwembad', 'Wijngaard', 'Open haard', 'Historisch pand'],
    datePosted: '2024-03-11',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  },
  // Portugal
  {
    id: 'algarve-1',
    title: 'Villa aan de Algarve',
    price: 750000,
    address: 'Rua do Mar 567',
    city: 'Albufeira',
    country: 'Portugal',
    postalCode: '8200',
    bedrooms: 4,
    bathrooms: 3,
    size: 200,
    images: [
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Moderne villa met privé zwembad en prachtig uitzicht over de Atlantische Oceaan. Perfect voor permanente bewoning of verhuur.',
    type: 'koop',
    category: 'huizen',
    features: ['Zwembad', 'Zeezicht', 'Tuin', 'Airconditioning'],
    datePosted: '2024-03-10',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  },
  // Griekenland
  {
    id: 'santorini-1',
    title: 'Traditionele Woning op Santorini',
    price: 680000,
    address: 'Oia Main Street 123',
    city: 'Oia',
    country: 'Griekenland',
    postalCode: '847 02',
    bedrooms: 2,
    bathrooms: 2,
    size: 120,
    images: [
      'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Authentieke Cycladische woning met adembenemend uitzicht over de caldera. Volledig gerenoveerd met behoud van traditionele elementen.',
    type: 'koop',
    category: 'huizen',
    features: ['Zeezicht', 'Terras', 'Traditionele architectuur'],
    datePosted: '2024-03-09',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  },
  // Kroatië
  {
    id: 'split-1',
    title: 'Appartement in Split',
    price: 450000,
    address: 'Riva 456',
    city: 'Split',
    country: 'Kroatië',
    postalCode: '21000',
    bedrooms: 3,
    bathrooms: 2,
    size: 95,
    images: [
      'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Modern appartement in het historische centrum van Split. Op loopafstand van alle voorzieningen en het strand.',
    type: 'koop',
    category: 'appartementen',
    features: ['Historische locatie', 'Airconditioning', 'Balkon'],
    datePosted: '2024-03-08',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  },
  // Oostenrijk
  {
    id: 'tirol-1',
    title: 'Chalet in Tirol',
    price: 1200000,
    address: 'Bergweg 789',
    city: 'Kitzbühel',
    country: 'Oostenrijk',
    postalCode: '6370',
    bedrooms: 4,
    bathrooms: 3,
    size: 180,
    images: [
      'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Luxe chalet met directe toegang tot de skipiste. Perfect voor wintersport en zomervakanties.',
    type: 'koop',
    category: 'vakantiewoningen',
    features: ['Ski-in/ski-out', 'Open haard', 'Sauna', 'Bergzicht'],
    datePosted: '2024-03-07',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  },
  // Duitsland
  {
    id: 'munich-1',
    title: 'Penthouse in München',
    price: 1350000,
    address: 'Maximilianstraße 123',
    city: 'München',
    country: 'Duitsland',
    postalCode: '80539',
    bedrooms: 3,
    bathrooms: 2,
    size: 160,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Hoogwaardig afgewerkt penthouse in het centrum van München. Met grote dakterras en panoramisch uitzicht.',
    type: 'koop',
    category: 'appartementen',
    features: ['Dakterras', 'Lift', 'Smart home', 'Parkeergarage'],
    datePosted: '2024-03-06',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  },
  // België
  {
    id: 'brugge-1',
    title: 'Herenhuis in Brugge',
    price: 895000,
    address: 'Markt 456',
    city: 'Brugge',
    country: 'België',
    postalCode: '8000',
    bedrooms: 4,
    bathrooms: 3,
    size: 220,
    images: [
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Prachtig gerenoveerd herenhuis in het historische centrum van Brugge. Met authentieke details en moderne comfort.',
    type: 'koop',
    category: 'huizen',
    features: ['Historisch pand', 'Tuin', 'Open haard', 'Stadszicht'],
    datePosted: '2024-03-05',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  },
  // Caribbean Properties - Bonaire
  {
    id: 'bonaire-1',
    title: 'Villa met Zeezicht in Kralendijk',
    price: 675000,
    address: 'Kaya Grandi 45',
    city: 'Kralendijk',
    country: 'Bonaire',
    postalCode: '',
    bedrooms: 3,
    bathrooms: 2,
    size: 180,
    images: [
      'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Moderne villa met prachtig uitzicht over de Caribische Zee. Gelegen in het centrum van Kralendijk met alle voorzieningen op loopafstand.',
    type: 'koop',
    category: 'huizen',
    features: ['Zeezicht', 'Zwembad', 'Airconditioning', 'Tuin'],
    datePosted: '2024-03-01',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  },
  {
    id: 'bonaire-2',
    title: 'Appartement in Rincon',
    price: 285000,
    address: 'Kaya Korona 12',
    city: 'Rincon',
    country: 'Bonaire',
    postalCode: '',
    bedrooms: 2,
    bathrooms: 1,
    size: 85,
    images: [
      'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Gezellig appartement in het historische dorp Rincon. Perfect voor starter of als vakantiewoning.',
    type: 'koop',
    category: 'appartementen',
    features: ['Balkon', 'Airconditioning', 'Parkeerplaats'],
    datePosted: '2024-02-28',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: false
  },
  // Caribbean Properties - Aruba  
  {
    id: 'aruba-1',
    title: 'Luxe Penthouse Palm Beach',
    price: 950000,
    address: 'J.E. Irausquin Boulevard 230',
    city: 'Palm Beach',
    country: 'Aruba',
    postalCode: '',
    bedrooms: 3,
    bathrooms: 3,
    size: 165,
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Exclusief penthouse direct aan het beroemde Palm Beach. Luxe afwerking en adembenemend zeezicht.',
    type: 'koop',
    category: 'appartementen',
    features: ['Zeezicht', 'Dakterras', 'Zwembad', 'Lift', 'Concierge'],
    datePosted: '2024-02-25',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  },
  // Caribbean Properties - Curaçao
  {
    id: 'curacao-1',
    title: 'Historisch Pand Willemstad',
    price: 485000,
    address: 'Handelskade 8',
    city: 'Willemstad',
    country: 'Curaçao',
    postalCode: '',
    bedrooms: 4,
    bathrooms: 2,
    size: 220,
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80'
    ],
    description: 'Authentiek gerestaureerd pand in UNESCO werelderfgoed Willemstad. Unieke kans om te wonen in het hart van de historie.',
    type: 'koop',
    category: 'huizen',
    features: ['Historisch pand', 'Binnenplaats', 'Airconditioning', 'Monument'],
    datePosted: '2024-02-20',
    status: 'actief',
    makelaarId: JAN_ID,
    featured: true
  }
];

export function getPropertyCountByCountry(countryName: string): number {
  return FEATURED_PROPERTIES.filter(property => property.country === countryName).length;
}

export function getPropertyCountByType(type: string): number {
  return FEATURED_PROPERTIES.filter(property => {
    switch (type.toLowerCase()) {
      case 'appartementen':
        return property.category === 'appartementen';
      case 'huizen':
        return property.category === 'huizen';
      case 'vakantiewoningen':
        return property.category === 'vakantiewoningen';
      case 'nieuwbouw':
        return property.category === 'nieuwbouw';
      default:
        return false;
    }
  }).length;
}
