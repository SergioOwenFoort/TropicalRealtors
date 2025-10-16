import React, { useState, useRef, useEffect } from 'react';
import { getEnabledIslandOptions } from '../../utils/islandVisibility';
import { Upload, X, Image as ImageIcon, MapPin, Home, Bed, Bath, FileText, Tag, Eye, Map, Star, Users, Clock, Shield } from 'lucide-react';
import { VacationProperty } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { ImageEnhancer } from '../../utils/imageEnhancer';
import { MapPreview } from '../common/MapPreview';
import { virusScanner } from '../../services/virusScanner';
import { geocodeAddress } from '../../services/geocodingService';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabase.config';

interface VacationPropertyUploaderProps {
  onClose?: () => void;
  onSuccess?: () => void;
  initialData?: Partial<VacationProperty>;
  isEditing?: boolean;
  propertyId?: string;
}

interface VacationPropertyFormData {
  name: string;
  price: number;
  address: string;
  city: string;
  country: string;
  phone_number: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  images: string[];
  description: string;
  property_type: 'vacation_villa' | 'vacation_apartment' | 'vacation_resort' | 'vacation_hotel' | 'vacation_studio' | 'vacation_penthouse';
  amenities: string[];
  features: string[];
  rating: number;
  distance_from_center: number;
  featured: boolean;
  check_in_time: string;
  check_out_time: string;
  minimum_stay: number;
  maximum_stay: number;
  cancellation_policy: string;
  house_rules: string[];
  instant_booking: boolean;
  status: 'available' | 'booked' | 'maintenance' | 'inactive';
  island: string;
}

const VACATION_PROPERTY_TYPES = [
  { value: 'vacation_villa', label: 'Villa' },
  { value: 'vacation_apartment', label: 'Appartement' },
  { value: 'vacation_resort', label: 'Resort' },
  { value: 'vacation_hotel', label: 'Hotel' },
  { value: 'vacation_studio', label: 'Studio' },
  { value: 'vacation_penthouse', label: 'Penthouse' }
];

const VACATION_AMENITIES = [
  'pool', 'beach_access', 'wifi', 'kitchen', 'air_conditioning',
  'parking', 'balcony', 'sea_view', 'garden', 'bbq',
  'washing_machine', 'dishwasher', 'tv', 'sound_system', 'safe'
];

const VACATION_FEATURES = [
  'beachfront', 'ocean_view', 'private_pool', 'chef_service',
  'concierge', 'spa_access', 'golf_course', 'diving_center',
  'snorkeling', 'fishing', 'hiking_trails', 'restaurant_nearby'
];

const CANCELLATION_POLICIES = [
  { value: 'flexible', label: 'Flexibel - Gratis annulering tot 24 uur voor aankomst' },
  { value: 'moderate', label: 'Gematigd - Gratis annulering tot 5 dagen voor aankomst' },
  { value: 'strict', label: 'Strikt - Gratis annulering tot 14 dagen voor aankomst' },
  { value: 'super_strict', label: 'Super strikt - 50% restitutie tot 30 dagen voor aankomst' }
];

const DEFAULT_HOUSE_RULES = [
  'Niet roken',
  'Geen huisdieren',
  'Geen feesten of evenementen',
  'Check-in na 15:00',
  'Check-out voor 11:00'
];

export function VacationPropertyUploader({ 
  onClose, 
  onSuccess, 
  initialData,
  isEditing = false,
  propertyId 
}: VacationPropertyUploaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [formData, setFormData] = useState<VacationPropertyFormData>({
    name: '',
    price: 0,
    address: '',
    city: '',
    country: '',
    phone_number: '',
    latitude: undefined,
    longitude: undefined,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    images: [],
    description: '',
    property_type: 'vacation_apartment',
    amenities: [],
    features: [],
    rating: 5,
    distance_from_center: 0,
    featured: false,
    check_in_time: '15:00',
    check_out_time: '11:00',
    minimum_stay: 1,
    maximum_stay: 30,
    cancellation_policy: 'moderate',
    house_rules: [...DEFAULT_HOUSE_RULES],
    instant_booking: true,
    status: 'available',
    island: ''
  });

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData && isEditing) {
      setFormData(prev => ({ ...prev, ...initialData }));
      setImageUrls(initialData.images || []);
    }
  }, [initialData, isEditing]);

  const handleInputChange = (field: keyof VacationPropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeocodeAddress = async () => {
    // Validate required fields
    if (!formData.address || !formData.city) {
      toast.error('Vul eerst een adres en stad in voordat u coördinaten kunt zoeken');
      return;
    }

    setIsGeocoding(true);
    
    try {
      // Call geocoding service
      const result = await geocodeAddress(
        formData.address,
        formData.city,
        formData.country || 'Caribbean'
      );

      if (result) {
        // Update form data with coordinates
        setFormData(prev => ({
          ...prev,
          latitude: result.latitude,
          longitude: result.longitude
        }));
        
        toast.success(`Coördinaten gevonden: ${result.display_name}`);
      } else {
        toast.error('Geen coördinaten gevonden voor dit adres. Probeer het adres aan te passen.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Fout bij het zoeken van coördinaten. Probeer het later opnieuw.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploadingImages(true);
    const newUrls: string[] = [];

    try {
      for (const file of files) {
        // Virus scan
        const scanResult = await virusScanner.scanFile(file);
        if (!scanResult.safe) {
          toast.error(`Bestand ${file.name} is niet veilig en wordt overgeslagen.`);
          continue;
        }

        // Enhance image
        const enhancedFile = await ImageEnhancer.enhanceImage(file);
        
        // Upload to Supabase
        const fileName = `vacation-${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, enhancedFile);

        if (error) {
          toast.error(`Fout bij uploaden van ${file.name}: ${error.message}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        newUrls.push(publicUrl);
      }

      const updatedUrls = [...imageUrls, ...newUrls];
      setImageUrls(updatedUrls);
      handleInputChange('images', updatedUrls);
      
      if (newUrls.length > 0) {
        toast.success(`${newUrls.length} afbeelding(en) succesvol geüpload!`);
      }
    } catch (error) {
      toast.error('Er ging iets mis bij het uploaden van de afbeeldingen.');
      console.error('Image upload error:', error);
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedUrls);
    handleInputChange('images', updatedUrls);
  };

  const toggleAmenity = (amenity: string) => {
    const current = formData.amenities;
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    handleInputChange('amenities', updated);
  };

  const toggleFeature = (feature: string) => {
    const current = formData.features;
    const updated = current.includes(feature)
      ? current.filter(f => f !== feature)
      : [...current, feature];
    handleInputChange('features', updated);
  };

  const addHouseRule = () => {
    const newRule = prompt('Nieuwe huisregel toevoegen:');
    if (newRule && newRule.trim()) {
      handleInputChange('house_rules', [...formData.house_rules, newRule.trim()]);
    }
  };

  const removeHouseRule = (index: number) => {
    const updated = formData.house_rules.filter((_, i) => i !== index);
    handleInputChange('house_rules', updated);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      toast.error('U moet ingelogd zijn om een listing toe te voegen.');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Voeg ten minste één afbeelding toe.');
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        horo_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let result;
      if (isEditing && propertyId) {
        const { data, error } = await supabase
          .from('vacation_properties')
          .update(submissionData)
          .eq('id', propertyId)
          .select()
          .single();
        result = { data, error };
      } else {
        const { data, error } = await supabase
          .from('vacation_properties')
          .insert([submissionData])
          .select()
          .single();
        result = { data, error };
      }

      if (result.error) {
        throw result.error;
      }

      toast.success(isEditing ? 'Vakantiewoning bijgewerkt!' : 'Vakantiewoning toegevoegd!');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting vacation property:', error);
      toast.error('Er ging iets mis bij het opslaan van de vakantiewoning.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Basis Informatie
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam van de vakantiewoning *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Bijvoorbeeld: Luxe Villa met Zeezicht"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type woning *
                </label>
                <select
                  value={formData.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  {VACATION_PROPERTY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prijs per nacht (€) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="150"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eiland *
                </label>
                <select
                  value={formData.island}
                  onChange={(e) => handleInputChange('island', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecteer een eiland</option>
                  {getEnabledIslandOptions().map(island => (
                    <option key={island.value} value={island.value}>
                      {island.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Slaapkamers</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', Number(e.target.value))}
                    className="w-16 p-1 border border-gray-300 rounded text-center"
                    min="0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Badkamers</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', Number(e.target.value))}
                    className="w-16 p-1 border border-gray-300 rounded text-center"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Max gasten</label>
                  <input
                    type="number"
                    value={formData.max_guests}
                    onChange={(e) => handleInputChange('max_guests', Number(e.target.value))}
                    className="w-16 p-1 border border-gray-300 rounded text-center"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <label className="text-sm font-medium text-gray-700">Rating</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => handleInputChange('rating', Number(e.target.value))}
                    className="p-1 border border-gray-300 rounded"
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>
                        {rating} ster{rating > 1 ? 'ren' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Afstand centrum (km)</label>
                  <input
                    type="number"
                    value={formData.distance_from_center}
                    onChange={(e) => handleInputChange('distance_from_center', Number(e.target.value))}
                    className="w-20 p-1 border border-gray-300 rounded text-center"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschrijving *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Beschrijf de vakantiewoning, omgeving en bijzondere kenmerken..."
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Locatie Informatie
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Straatnaam en huisnummer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefoonnummer
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+599 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stad *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Stad"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Land *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Land"
                  required
                />
              </div>

              {/* Geocoding Button */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleGeocodeAddress}
                  disabled={isGeocoding || !formData.address || !formData.city || !formData.country}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Map className="w-5 h-5" />
                  {isGeocoding ? 'Coördinaten zoeken...' : 'Zoek Coördinaten'}
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  Klik om automatisch de GPS coördinaten te vinden op basis van het adres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude (optioneel)
                </label>
                <input
                  type="number"
                  value={formData.latitude || ''}
                  onChange={(e) => handleInputChange('latitude', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="12.1234"
                  step="any"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (optioneel)
                </label>
                <input
                  type="number"
                  value={formData.longitude || ''}
                  onChange={(e) => handleInputChange('longitude', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="-68.1234"
                  step="any"
                />
              </div>
            </div>

            {formData.latitude && formData.longitude && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locatie Preview
                </label>
                <div className="h-64 border border-gray-300 rounded-md overflow-hidden">
                  <MapPreview
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    title={formData.name}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Afbeeldingen
            </h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="images" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Sleep afbeeldingen hierheen of klik om te uploaden
                    </span>
                  </label>
                  <input
                    ref={fileInputRef}
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF tot 10MB per afbeelding
                </p>
              </div>
            </div>

            {isUploadingImages && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <p className="text-sm text-gray-600 mt-2">Afbeeldingen uploaden...</p>
              </div>
            )}

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Voorzieningen & Kenmerken
            </h3>
            
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">Voorzieningen</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {VACATION_AMENITIES.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {amenity.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">Bijzondere Kenmerken</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {VACATION_FEATURES.map(feature => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {feature.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                ⭐ Uitgelichte woning (wordt prominenter weergegeven)
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Boekingsvoorwaarden
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in tijd
                </label>
                <input
                  type="time"
                  value={formData.check_in_time}
                  onChange={(e) => handleInputChange('check_in_time', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out tijd
                </label>
                <input
                  type="time"
                  value={formData.check_out_time}
                  onChange={(e) => handleInputChange('check_out_time', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum verblijf (nachten)
                </label>
                <input
                  type="number"
                  value={formData.minimum_stay}
                  onChange={(e) => handleInputChange('minimum_stay', Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum verblijf (nachten)
                </label>
                <input
                  type="number"
                  value={formData.maximum_stay}
                  onChange={(e) => handleInputChange('maximum_stay', Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annuleringsbeleid
                </label>
                <select
                  value={formData.cancellation_policy}
                  onChange={(e) => handleInputChange('cancellation_policy', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {CANCELLATION_POLICIES.map(policy => (
                    <option key={policy.value} value={policy.value}>
                      {policy.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="available">Beschikbaar</option>
                  <option value="booked">Geboekt</option>
                  <option value="maintenance">Onderhoud</option>
                  <option value="inactive">Inactief</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Huisregels
              </label>
              <div className="space-y-2">
                {formData.house_rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 text-sm text-gray-700">• {rule}</span>
                    <button
                      type="button"
                      onClick={() => removeHouseRule(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addHouseRule}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  + Huisregel toevoegen
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Step Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 5 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 5 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Basis</span>
          <span>Locatie</span>
          <span>Foto's</span>
          <span>Voorzieningen</span>
          <span>Voorwaarden</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Vorige
        </button>

        <div className="flex gap-2">
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Volgende
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || formData.images.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditing ? 'Bijwerken...' : 'Toevoegen...'}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  {isEditing ? 'Vakantiewoning Bijwerken' : 'Vakantiewoning Toevoegen'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}