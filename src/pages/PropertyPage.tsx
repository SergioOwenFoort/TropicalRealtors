import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Calendar, Home as HomeIcon, Edit } from 'lucide-react';
import { PropertyCard } from '../components/ui/PropertyCard';
import { getDistance } from '../utils/geo';
import { useProperties } from '../hooks/useProperties';

// Temporary mock listings for each island
const MOCK_LISTINGS: Property[] = [
  // Aruba koop huizen
  {
    id: 'mock-aruba-1',
    title: 'Mock Aruba Villa',
    price: 450000,
    address: 'Palm Beach 1',
    city: 'Noord',
    country: '',
    bedrooms: 3,
    bathrooms: 2,
    size: 120,
    images: ['/placeholder-house.jpg'],
    description: 'Testwoning op Aruba',
    type: 'koop',
    category: 'huizen',
    features: [],
    datePosted: new Date().toISOString(),
    status: 'actief',
    makelaarId: 'mock',
    featured: false,
    latitude: 12.5657,
    longitude: -70.0265,
  },
  {
    id: 'mock-aruba-2',
    title: 'Mock Aruba Family Home',
    price: 390000,
    address: 'Oranjestad 5',
    city: 'Oranjestad',
    country: '',
    bedrooms: 4,
    bathrooms: 2,
    size: 140,
    images: ['/placeholder-house.jpg'],
    description: 'Familiewoning op Aruba',
    type: 'koop',
    category: 'huizen',
    features: [],
    datePosted: new Date().toISOString(),
    status: 'actief',
    makelaarId: 'mock',
    featured: false,
    latitude: 12.5200,
    longitude: -70.0300,
  },
  // Bonaire huur appartementen
  {
    id: 'mock-bonaire-1',
    title: 'Mock Bonaire Apartment',
    price: 1200,
    address: 'Kaya Grandi 2',
    city: 'Kralendijk',
    country: '',
    bedrooms: 2,
    bathrooms: 1,
    size: 80,
    images: ['/placeholder-house.jpg'],
    description: 'Testappartement op Bonaire',
    type: 'huur',
    category: 'appartementen',
    features: [],
    datePosted: new Date().toISOString(),
    status: 'actief',
    makelaarId: 'mock',
    featured: false,
    latitude: 12.1446,
    longitude: -68.2655,
  },
  {
    id: 'mock-bonaire-2',
    title: 'Mock Bonaire Studio',
    price: 950,
    address: 'Kaya Korona 10',
    city: 'Kralendijk',
    country: '',
    bedrooms: 1,
    bathrooms: 1,
    size: 45,
    images: ['/placeholder-house.jpg'],
    description: 'Studio op Bonaire',
    type: 'huur',
    category: 'appartementen',
    features: [],
    datePosted: new Date().toISOString(),
    status: 'actief',
    makelaarId: 'mock',
    featured: false,
    latitude: 12.1500,
    longitude: -68.2800,
  },
  // Curaçao koop resort
  {
    id: 'mock-curacao-1',
    title: 'Mock Curaçao Resort',
    price: 900000,
    address: 'Willemstad 3',
    city: 'Willemstad',
    country: '',
    bedrooms: 5,
    bathrooms: 4,
    size: 300,
    images: ['/placeholder-house.jpg'],
    description: 'Testresort op Curaçao',
    type: 'koop',
    category: 'resort',
    features: [],
    datePosted: new Date().toISOString(),
    status: 'actief',
    makelaarId: 'mock',
    featured: false,
    latitude: 12.1696,
    longitude: -68.99,
  },
  {
    id: 'mock-curacao-2',
    title: 'Mock Curaçao Beach Resort',
    price: 1100000,
    address: 'Jan Thiel 8',
    city: 'Willemstad',
    country: '',
    bedrooms: 6,
    bathrooms: 5,
    size: 400,
    images: ['/placeholder-house.jpg'],
    description: 'Beach resort op Curaçao',
    type: 'koop',
    category: 'resort',
    features: [],
    datePosted: new Date().toISOString(),
    status: 'actief',
    makelaarId: 'mock',
    featured: false,
    latitude: 12.1000,
    longitude: -68.9000,
  },
];
import { PropertyGallery } from '../components/property/PropertyGallery';
import { PropertyFeatures } from '../components/property/PropertyFeatures';
import { PropertyContact } from '../components/property/PropertyContact';
import { MapPreview } from '../components/common/MapPreview';
import { BackButton } from '../components/ui/BackButton';
import { useUserRole } from '../hooks/useUserRole';
import { getPropertyById } from '../services/propertyService';
import { PropertyViewTracker } from '../services/propertyViewTracker';
import { Property } from '../types';

export function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isRealtor } = useUserRole();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { properties: allProperties } = useProperties();
  const [nearest, setNearest] = useState<Property[]>([]);

  useEffect(() => {
    async function fetchProperty() {
      if (!id) {
        setError('Geen woning ID gevonden');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getPropertyById(id);
        
        if (result) {
          setProperty(result);
          // Track property view (fire-and-forget)
          PropertyViewTracker.trackView(id);
        } else {
          setError('Woning niet gevonden');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Er is een fout opgetreden bij het laden van de woning');
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
    window.scrollTo(0, 0);
  }, [id]);

  // Find two nearest properties of same type and island (excluding current)
  useEffect(() => {
    if (!property) return;
    let candidates = allProperties.filter(
      p => p.id !== property.id && p.country === property.country && p.type === property.type && p.category === property.category && p.latitude && p.longitude
    );
    // If not enough, add mock listings for this island/type/category
    if (candidates.length < 2) {
      const mocks = MOCK_LISTINGS.filter(
        m => m.country === property.country && m.type === property.type && m.category === property.category
      );
      candidates = candidates.concat(mocks);
    }
    // Sort by distance
    if (property.latitude && property.longitude) {
      candidates.sort((a, b) => {
        const da = getDistance(property.latitude!, property.longitude!, a.latitude!, a.longitude!);
        const db = getDistance(property.latitude!, property.longitude!, b.latitude!, b.longitude!);
        return da - db;
      });
    }
    setNearest(candidates.slice(0, 2));
  }, [property, allProperties]);

  const handleEdit = () => {
    if (isAdmin) {
      navigate(`/admin/woning/${id}/bewerken`);
    } else if (isRealtor) {
      navigate(`/makelaar/woning/${id}/bewerken`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="text-center text-gray-600">Woning wordt geladen...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="text-center text-gray-600">{error || 'Woning niet gevonden'}</div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative">
            <PropertyGallery images={property.images} />
            {(isAdmin || isRealtor) && (
              <button
                onClick={handleEdit}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                title="Bewerk woning"
              >
                <Edit className="w-5 h-5 text-blue-600" />
              </button>
            )}
          </div>
          
          <div className="mt-6">
            <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{property.address}, {property.city}, {property.country}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-5 h-5" />
                <span>{property.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} {property.type === 'huur' ? 'p/m' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>Geplaatst op {new Date(property.datePosted).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <HomeIcon className="w-5 h-5" />
                <span>{property.type === 'koop' ? 'Te koop' : 'Te huur'}</span>
              </div>
            </div>

            <PropertyFeatures property={property} />
            
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Omschrijving</h2>
              <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-6">
            <PropertyContact property={property} disableSticky={true} />
            {/* Google Maps Location */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-xl font-semibold mb-4">Locatie</h3>
              <MapPreview
                latitude={property.latitude}
                longitude={property.longitude}
                address={property.address}
                city={property.city}
                country={property.country}
                height={300}
                className="w-full"
              />
            </div>
            {/* Nearest Properties */}
            {nearest.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Vergelijkbare woningen in de buurt</h3>
                <div className="space-y-4">
                  {nearest.map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
