import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Wifi, 
  Car, 
  Waves, 
  Coffee, 
  Shield, 
  Heart, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Calendar,
  Phone,
  Mail,
  Share2,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { vacationProperties } from '../data/vacationProperties';
import { VacationProperty } from '../components/vakantie/PropertyCard';

const amenityIcons: { [key: string]: any } = {
  wifi: Wifi,
  parking: Car,
  pool: Waves,
  breakfast: Coffee,
  freeCancellation: Shield,
  gym: Users,
  restaurant: Coffee,
  ac: Shield
};

const amenityLabels: { [key: string]: string } = {
  wifi: 'Gratis WiFi',
  parking: 'Gratis parkeren',
  pool: 'Zwembad',
  breakfast: 'Ontbijt inbegrepen',
  gym: 'Fitnesscentrum',
  restaurant: 'Restaurant',
  ac: 'Airconditioning'
};

// Mock reviews data
const mockReviews = [
  {
    id: '1',
    name: 'Maria S.',
    rating: 5,
    date: '2024-09-15',
    comment: 'Prachtige locatie met geweldig uitzicht! Het personeel was zeer vriendelijk en de faciliteiten waren uitstekend. Zeker een aanrader voor een ontspannen vakantie.',
    helpful: 12
  },
  {
    id: '2',
    name: 'John D.',
    rating: 4,
    date: '2024-08-22',
    comment: 'Goede prijs-kwaliteitverhouding. Kamers waren schoon en comfortabel. Het zwembad was perfect om af te koelen na een dag op het strand.',
    helpful: 8
  },
  {
    id: '3',
    name: 'Sophie L.',
    rating: 5,
    date: '2024-07-10',
    comment: 'Onvergetelijke ervaring! Het ontbijt was heerlijk en de locatie was ideaal om het eiland te verkennen. Komen zeker terug!',
    helpful: 15
  }
];

export function VacationPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<VacationProperty | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    checkIn: '',
    checkOut: ''
  });
  const [guests, setGuests] = useState(2);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (id) {
      const foundProperty = vacationProperties.find(p => p.id === id);
      setProperty(foundProperty || null);
    }
  }, [id]);

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accommodatie niet gevonden</h2>
          <p className="text-gray-600 mb-6">De gevraagde accommodatie bestaat niet of is niet meer beschikbaar.</p>
          <button
            onClick={() => navigate('/vakantie')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Terug naar zoeken
          </button>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleBooking = () => {
    // Handle booking logic here
    alert(`Reservering voor ${property.name} - functionaliteit wordt binnenkort toegevoegd!`);
  };

  const calculateNights = () => {
    if (selectedDates.checkIn && selectedDates.checkOut) {
      const checkIn = new Date(selectedDates.checkIn);
      const checkOut = new Date(selectedDates.checkOut);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    return 0;
  };

  const totalPrice = calculateNights() * property.pricePerNight;

  // Get tomorrow's date as minimum check-in date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get minimum check-out date (day after check-in)
  const checkInDate = selectedDates.checkIn ? new Date(selectedDates.checkIn) : new Date();
  checkInDate.setDate(checkInDate.getDate() + 1);
  const minCheckOutDate = checkInDate.toISOString().split('T')[0];

  const displayedAmenities = showAllAmenities ? property.amenities : property.amenities.slice(0, 6);
  const displayedReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/vakantie')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Terug naar zoeken</span>
            </button>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Share2 className="w-5 h-5" />
                <span>Delen</span>
              </button>
              <button
                onClick={toggleWishlist}
                className={`flex items-center gap-2 transition-colors ${
                  isWishlisted ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                <span>Opslaan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{property.rating}</span>
                  <span className="text-gray-600">({property.reviewCount} beoordelingen)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{property.location}</span>
                </div>
              </div>
              {property.featured && (
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Uitgelicht
                </div>
              )}
            </div>

            {/* Image Gallery */}
            <div className="relative mb-8 rounded-xl overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>

                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Over deze accommodatie</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Voorzieningen</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayedAmenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || Check;
                  return (
                    <div key={amenity} className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">{amenityLabels[amenity] || amenity}</span>
                    </div>
                  );
                })}
              </div>
              {property.amenities.length > 6 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showAllAmenities ? 'Toon minder' : `Toon alle ${property.amenities.length} voorzieningen`}
                </button>
              )}
            </div>

            {/* Reviews */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Beoordelingen</h2>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{property.rating}</span>
                  <span className="text-gray-600">({property.reviewCount} beoordelingen)</span>
                </div>
              </div>

              <div className="space-y-6">
                {displayedReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-blue-600">
                            {review.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.name}</p>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{review.comment}</p>
                    <p className="text-sm text-gray-500">{review.helpful} mensen vonden dit nuttig</p>
                  </div>
                ))}
              </div>

              {mockReviews.length > 2 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showAllReviews ? 'Toon minder beoordelingen' : 'Toon alle beoordelingen'}
                </button>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">€{property.pricePerNight}</span>
                    <span className="text-gray-600">per nacht</span>
                  </div>
                  {property.freeCancellation && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Gratis annulering</span>
                    </div>
                  )}
                </div>

                {/* Date Selection */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Aankomst
                      </label>
                      <input
                        type="date"
                        value={selectedDates.checkIn}
                        onChange={(e) => setSelectedDates(prev => ({ ...prev, checkIn: e.target.value }))}
                        min={minDate}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Vertrek
                      </label>
                      <input
                        type="date"
                        value={selectedDates.checkOut}
                        onChange={(e) => setSelectedDates(prev => ({ ...prev, checkOut: e.target.value }))}
                        min={selectedDates.checkIn || minCheckOutDate}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Gasten
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'gast' : 'gasten'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price Breakdown */}
                {calculateNights() > 0 && (
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>€{property.pricePerNight} x {calculateNights()} nachten</span>
                        <span>€{totalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Servicetoeslag</span>
                        <span>€{Math.round(totalPrice * 0.1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Schoonmaakkosten</span>
                        <span>€25</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Totaal</span>
                        <span>€{totalPrice + Math.round(totalPrice * 0.1) + 25}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Button */}
                <button
                  onClick={handleBooking}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
                >
                  Reserveren
                </button>

                <p className="text-xs text-gray-500 text-center mb-4">
                  Je wordt pas belast na bevestiging
                </p>

                {/* Contact Information */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>+599 123 4567</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>info@tropicalrealtors.com</span>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                      <ExternalLink className="w-4 h-4" />
                      <span>Website bezoeken</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}