import React, { useState, useRef, useEffect } from 'react';
import { getEnabledIslandOptions } from '../../utils/islandVisibility';
import { Upload, X, Image as ImageIcon, MapPin, Home, Bed, Bath, FileText, Tag, Eye, Map } from 'lucide-react';
import { Property } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useProperties } from '../../hooks/useProperties';
import { ImageEnhancer } from '../../utils/imageEnhancer';
import { FeatureSelector } from './FeatureSelector';
import { ListingPreview } from './ListingPreview';
import { MapPreview } from '../common/MapPreview';
import { virusScanner } from '../../services/virusScanner';
import { toast } from 'react-hot-toast';

interface ListingUploaderProps {
  onClose?: () => void;
  onSuccess?: () => void;
  initialData?: Partial<Property>;
  isEditing?: boolean;
  listingId?: string;
}

interface PropertyFormData {
  title: string;
  price: number;
  originalPrice?: number;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  images: string[];
  description: string;
  type: 'koop' | 'huur';
  category: 'appartementen' | 'huizen' | 'vakantiewoningen' | 'nieuwbouw' | 'hotel' | 'resort';
  features: string[];
  status: 'actief' | 'concept' | 'verkocht' | 'verhuurd' | 'ingetrokken';
  featured: boolean;
}

export function ListingUploader({ 
  onClose, 
  onSuccess, 
  initialData,
  isEditing = false,
  listingId 
}: ListingUploaderProps) {
  const { user } = useAuth();
  const { addProperty, updateProperty, properties } = useProperties();
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: initialData?.title || '',
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || undefined,
    address: initialData?.address || '',
    city: initialData?.city || '',
    country: initialData?.country || 'Bonaire',
    postalCode: initialData?.postalCode || '',
    latitude: initialData?.latitude || undefined,
    longitude: initialData?.longitude || undefined,
    bedrooms: initialData?.bedrooms || 1,
    bathrooms: initialData?.bathrooms || 1,
    size: initialData?.size || 0,
    images: initialData?.images || [],
    description: initialData?.description || '',
    type: initialData?.type || 'koop',
    category: initialData?.category || 'huizen',
    features: initialData?.features || [],
    status: initialData?.status || 'actief',
    featured: initialData?.featured || false
  });

  const [uploading, setUploading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPreview, setShowPreview] = useState(false);
  const [enhancementEnabled, setEnhancementEnabled] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load property data from database when editing
  useEffect(() => {
    if (isEditing && listingId && properties.length > 0) {
      const existingProperty = properties.find(p => p.id === listingId);
      if (existingProperty) {
        // Don't override if initialData was already provided
        if (!initialData || Object.keys(initialData).length === 0) {
          setFormData({
            title: existingProperty.title || '',
            price: existingProperty.price || 0,
            originalPrice: existingProperty.originalPrice || undefined,
            address: existingProperty.address || '',
            city: existingProperty.city || '',
            country: existingProperty.country || 'Bonaire',
            postalCode: existingProperty.postalCode || '',
            latitude: existingProperty.latitude || undefined,
            longitude: existingProperty.longitude || undefined,
            bedrooms: existingProperty.bedrooms || 1,
            bathrooms: existingProperty.bathrooms || 1,
            size: existingProperty.size || 0,
            images: existingProperty.images || [],
            description: existingProperty.description || '',
            type: existingProperty.type || 'koop',
            category: existingProperty.category || 'huizen',
            features: existingProperty.features || [],
            status: existingProperty.status || 'actief',
            featured: existingProperty.featured || false
          });
          toast.success('Property data loaded from database');
        }
      } else if (listingId) {
        toast.error('Property not found in database');
      }
    }
  }, [isEditing, listingId, properties, initialData]);

  // Auto-save functionality
  useEffect(() => {
    if (isEditing || !user?.id) return;

    const timer = setTimeout(() => {
      setAutoSaveStatus('saving');
      localStorage.setItem(`listing_draft_${user.id}`, JSON.stringify(formData));
      setTimeout(() => setAutoSaveStatus('saved'), 500);
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, isEditing, user?.id]);

  // Load draft on mount
  useEffect(() => {
    if (isEditing || !user?.id) return;
    
    const savedDraft = localStorage.getItem(`listing_draft_${user.id}`);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft);
        toast.success('Concept geladen van eerdere sessie');
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [isEditing, user?.id]);

  const enabledIslands = getEnabledIslandOptions();

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titel is verplicht';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Prijs moet groter zijn dan 0';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adres is verplicht';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Stad is verplicht';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Beschrijving is verplicht';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'Minimaal 1 afbeelding is verplicht';
    }

    if (!formData.size || formData.size <= 0) {
      newErrors.size = 'Oppervlakte moet groter zijn dan 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Geocoding function to get coordinates from address
  const geocodeAddress = async () => {
    if (!formData.address || !formData.city || !formData.country) {
      toast.error('Vul eerst adres, stad en land in');
      return;
    }

    setIsGeocodingLocation(true);
    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.country}`;
      console.log('Geocoding address:', fullAddress);
      
      // First try intelligent fallback based on known Bonaire locations
      const fallbackLocation = getBonaireLocationFallback(formData.address, formData.city);
      if (fallbackLocation) {
        setFormData(prev => ({
          ...prev,
          latitude: fallbackLocation.lat,
          longitude: fallbackLocation.lng
        }));
        
        toast.success(`Locatie ingesteld: ${fallbackLocation.name}, Bonaire`);
        console.log('Used intelligent fallback coordinates:', fallbackLocation);
        return;
      }

      // Try Google Maps API if fallback didn't work
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        try {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Geocoding response:', data);
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              const location = data.results[0].geometry.location;
              const foundAddress = data.results[0].formatted_address;
              
              setFormData(prev => ({
                ...prev,
                latitude: location.lat,
                longitude: location.lng
              }));
              
              toast.success(`Locatie gevonden via Google Maps: ${foundAddress}`);
              console.log('Coordinates found via API:', location);
              return;
            } else if (data.status === 'REQUEST_DENIED') {
              console.warn('Google Maps API access denied - using intelligent fallback');
              toast.warning('Google Maps API beperkt - intelligente locatie gebruikt');
            } else {
              console.warn('Google Maps geocoding failed:', data.status);
            }
          }
        } catch (apiError) {
          console.warn('Google Maps API error:', apiError);
        }
      }

      // Final fallback - use central Kralendijk coordinates
      const defaultLocation = { lat: 12.1500, lng: -68.2800, name: 'Kralendijk (centrum)' };
      
      setFormData(prev => ({
        ...prev,
        latitude: defaultLocation.lat,
        longitude: defaultLocation.lng
      }));
      
      toast.info(`Geschatte locatie gebruikt: ${defaultLocation.name}`);
      toast.info('💡 Je kunt de coördinaten handmatig aanpassen indien nodig');
      console.log('Used default fallback coordinates:', defaultLocation);
      
    } catch (error) {
      console.error('Geocoding error:', error);
      
      // Emergency fallback
      const emergencyLocation = { lat: 12.1500, lng: -68.2800 };
      setFormData(prev => ({
        ...prev,
        latitude: emergencyLocation.lat,
        longitude: emergencyLocation.lng
      }));
      
      toast.error('Fout bij locatie bepaling - Kralendijk centrum gebruikt');
      toast.info('💡 Pas de coördinaten handmatig aan indien nodig');
    } finally {
      setIsGeocodingLocation(false);
    }
  };

  // Helper function for intelligent Bonaire location fallback
  const getBonaireLocationFallback = (address: string, city: string) => {
    const searchText = `${address} ${city}`.toLowerCase();
    
    // Known Bonaire locations with coordinates
    const bonairePlaces = [
      // Main towns
      { names: ['kralendijk', 'playa'], lat: 12.1500, lng: -68.2800, name: 'Kralendijk' },
      { names: ['rincon'], lat: 12.2000, lng: -68.3300, name: 'Rincon' },
      
      // Well-known areas
      { names: ['belnem', 'belnem beach'], lat: 12.1200, lng: -68.2400, name: 'Belnem' },
      { names: ['nikiboko'], lat: 12.1650, lng: -68.2750, name: 'Nikiboko' },
      { names: ['sabadeco'], lat: 12.1800, lng: -68.2600, name: 'Sabadeco' },
      { names: ['wanapa'], lat: 12.1300, lng: -68.2900, name: 'Wanapa' },
      
      // Popular streets in Kralendijk
      { names: ['kaya grandi'], lat: 12.1520, lng: -68.2780, name: 'Kaya Grandi' },
      { names: ['kaya gobernador debrot'], lat: 12.1480, lng: -68.2820, name: 'Kaya Gobernador Debrot' },
      { names: ['kaya international'], lat: 12.1510, lng: -68.2760, name: 'Kaya International' },
      
      // Beaches and landmarks
      { names: ['bachelor beach', 'bachelors beach'], lat: 12.1400, lng: -68.2700, name: 'Bachelor Beach' },
      { names: ['pink beach'], lat: 12.0700, lng: -68.2800, name: 'Pink Beach' },
      { names: ['lac bay', 'lac'], lat: 12.0800, lng: -68.2300, name: 'Lac Bay' },
      { names: ['goto meer', 'gotomeer'], lat: 12.2200, lng: -68.3400, name: 'Goto Meer' },
      { names: ['windsock beach'], lat: 12.1450, lng: -68.2650, name: 'Windsock Beach' },
      
      // Resorts and hotels area
      { names: ['harbour village', 'harbour village marina'], lat: 12.1450, lng: -68.2750, name: 'Harbour Village' },
      { names: ['plaza resort'], lat: 12.1380, lng: -68.2680, name: 'Plaza Resort' },
      { names: ['buddy dive resort'], lat: 12.1420, lng: -68.2720, name: 'Buddy Dive Resort' }
    ];
    
    // Find matching location
    for (const place of bonairePlaces) {
      for (const name of place.names) {
        if (searchText.includes(name)) {
          return {
            lat: place.lat,
            lng: place.lng,
            name: place.name
          };
        }
      }
    }
    
    return null;
  };

  // Helper: Scan image with optimized backend
  async function scanImageWithBackend(imageFile: File): Promise<boolean> {
    try {
      console.log(`🔍 Scanning image: ${imageFile.name}`);
      
      const result = await virusScanner.scanImage(imageFile);
      
      if (!result.success) {
        toast.error(result.message);
        return false;
      }
      
      console.log(`✅ Image ${imageFile.name} passed security checks`);
      return true;
      
    } catch (err) {
      console.error('Virus scan error:', err);
      toast.error('Virus scanner error. File passed client-side validation only.');
      
      // For development: allow upload if scanner has issues
      console.warn('Allowing upload with client-side validation only');
      return true;
    }
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the 15 image limit
    const currentImageCount = formData.images.length;
    const newImageCount = files.length;
    const totalImages = currentImageCount + newImageCount;

    if (totalImages > 15) {
      const allowedUploads = 15 - currentImageCount;
      if (allowedUploads <= 0) {
        toast.error('Maximaal 15 afbeeldingen toegestaan. Verwijder eerst enkele afbeeldingen.');
        return;
      } else {
        toast.error(`Je kunt nog maar ${allowedUploads} afbeelding(en) toevoegen. Maximaal 15 afbeeldingen toegestaan.`);
        return;
      }
    }

    setUploadingImages(true);
    try {
      const fileArray = Array.from(files);
      
      // Filter image files only
      const imageFiles = fileArray.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is geen afbeelding`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast.error(`${file.name} is te groot (max 10MB)`);
          return false;
        }
        return true;
      });

      if (imageFiles.length === 0) {
        setUploadingImages(false);
        return;
      }

      // Batch scan all images for faster processing
      console.log(`🔍 Batch scanning ${imageFiles.length} images...`);
      const scanResult = await virusScanner.scanBatch(imageFiles);
      
      if (!scanResult.success) {
        const failedFiles = scanResult.results.filter(r => !r.success);
        for (const failed of failedFiles) {
          toast.error(`${failed.filename}: ${failed.message}`);
        }
      }

      // Process only the files that passed scanning
      const cleanFiles = scanResult.results
        .filter(r => r.success)
        .map((result, index) => imageFiles.find(f => f.name === result.filename))
        .filter(Boolean) as File[];

      console.log(`✅ ${cleanFiles.length}/${imageFiles.length} images passed security checks`);

      const newImages: string[] = [];
      
      // Process clean files
      for (const file of cleanFiles) {
        try {
          // Enhance image if enabled
          let processedFile = file;
          if (enhancementEnabled) {
            processedFile = await ImageEnhancer.quickEnhanceForCarousel(file);
          }

          // Convert to base64 for preview (in a real app, you'd upload to storage)
          const reader = new FileReader();
          const imageUrl = await new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(processedFile);
          });

          newImages.push(imageUrl);
        } catch (error) {
          console.error('Error processing image:', error);
          toast.error(`Fout bij verwerken van ${file.name}`);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

      setErrors(prev => ({ ...prev, images: '' }));
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Fout bij uploaden van afbeeldingen');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      toast.error('Je moet ingelogd zijn om een listing toe te voegen');
      return;
    }

    setUploading(true);
    
    try {
      const propertyData: Omit<Property, 'id'> = {
        ...formData,
        datePosted: new Date().toISOString(),
        makelaarId: user.id,
      };

      let result;
      if (isEditing && listingId) {
        result = await updateProperty(listingId, propertyData);
      } else {
        result = await addProperty(propertyData);
      }

      if (result) {
        toast.success(isEditing ? 'Listing bijgewerkt!' : 'Listing toegevoegd!');
        
        // Clear draft after successful submission
        if (!isEditing && user?.id) {
          localStorage.removeItem(`listing_draft_${user.id}`);
        }
        
        onSuccess?.();
        onClose?.();
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      toast.error('Fout bij opslaan van listing');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      price: 0,
      originalPrice: undefined,
      address: '',
      city: '',
      country: 'Bonaire',
      postalCode: '',
      latitude: undefined,
      longitude: undefined,
      bedrooms: 1,
      bathrooms: 1,
      size: 0,
      images: [],
      description: '',
      type: 'koop',
      category: 'huizen',
      features: [],
      status: 'actief',
      featured: false
    });
    setErrors({});
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const calculateFormProgress = (): number => {
    const requiredFields = [
      'title', 'price', 'address', 'city', 'description', 'size'
    ];
    const filledFields = requiredFields.filter(field => {
      const value = formData[field as keyof PropertyFormData];
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      if (typeof value === 'number') {
        return value > 0;
      }
      return false;
    });
    
    const hasImages = formData.images.length > 0;
    const totalFields = requiredFields.length + 1; // +1 for images
    const completedFields = filledFields.length + (hasImages ? 1 : 0);
    
    return Math.round((completedFields / totalFields) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Listing bewerken' : 'Nieuwe listing toevoegen'}
              </h2>
              {!isEditing && (
                <div className="mt-2">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Voortgang: {calculateFormProgress()}%</span>
                    {autoSaveStatus === 'saving' && (
                      <span className="text-blue-600">Concept wordt opgeslagen...</span>
                    )}
                    {autoSaveStatus === 'saved' && (
                      <span className="text-green-600">Concept opgeslagen ✓</span>
                    )}
                  </div>
                  <div className="w-64 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateFormProgress()}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                <Eye size={16} />
                <span>Preview</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Home size={20} className="mr-2" />
                  Basis informatie
                </h3>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bijv. Prachtige villa met zeezicht"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💲 Prijs *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="295000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Prijs in USD ($)</p>
                  {errors.price && (
                    <p className="text-red-600 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                {/* Original Price (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💲 Oorspronkelijke prijs (optioneel)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      originalPrice: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="350000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Gebruik dit voor afgeprijsde woningen om de oorspronkelijke prijs te tonen (USD $)
                  </p>
                  {formData.originalPrice && formData.originalPrice <= formData.price && (
                    <p className="text-amber-600 text-sm mt-1">
                      ⚠️ Oorspronkelijke prijs moet hoger zijn dan de huidige prijs
                    </p>
                  )}
                </div>

                {/* Type & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'koop' | 'huur' }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="koop">Koop</option>
                      <option value="huur">Huur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categorie *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="huizen">Huizen</option>
                      <option value="appartementen">Appartementen</option>
                      <option value="vakantiewoningen">Vakantiewoningen</option>
                      <option value="nieuwbouw">Nieuwbouw</option>
                      <option value="hotel">Hotel</option>
                      <option value="resort">Resort</option>
                    </select>
                  </div>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Bed size={16} className="inline mr-1" />
                      Slaapkamers
                    </label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: Number(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Bath size={16} className="inline mr-1" />
                      Badkamers
                    </label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: Number(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Oppervlakte* m²
                    </label>
                    <input
                      type="number"
                      value={formData.size}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: Number(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="150"
                    />
                    {errors.size && (
                      <p className="text-red-600 text-sm mt-1">{errors.size}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <MapPin size={20} className="mr-2" />
                  Locatie
                </h3>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bijv. Kaya Grandi 123 of Kralendijk"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Voor Bonaire probeer: "Kralendijk", "Rincon", of bekende straten zoals "Kaya Grandi"
                  </p>
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                {/* City & Country */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stad *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bijv. Kralendijk"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Voor Bonaire: "Kralendijk", "Rincon", of laat leeg als adres al compleet is
                    </p>
                    {errors.city && (
                      <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Land
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {enabledIslands.map(island => (
                        <option key={island.key} value={island.label}>{island.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bijv. 1234AB"
                  />
                </div>

                {/* Location/Coordinates */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Map size={16} className="inline mr-1" />
                      Kaartlocatie
                    </label>
                    <button
                      type="button"
                      onClick={geocodeAddress}
                      disabled={isGeocodingLocation || !formData.address || !formData.city}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isGeocodingLocation ? 'Zoeken...' : 'Zoek locatie'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          latitude: e.target.value ? Number(e.target.value) : undefined 
                        }))}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Breedtegraad"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          longitude: e.target.value ? Number(e.target.value) : undefined 
                        }))}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Lengtegraad"
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Klik "Zoek locatie" om automatisch coördinaten te vinden, of voer ze handmatig in.<br/>
                    <strong>Bonaire referenties:</strong> Kralendijk ≈ 12.1500, -68.2800 • Rincon ≈ 12.2000, -68.3300
                  </p>
                  
                  {formData.latitude && formData.longitude && (
                    <div className="mt-2">
                      <a
                        href={`https://www.google.com/maps/@${formData.latitude},${formData.longitude},17z`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <MapPin size={14} className="mr-1" />
                        Bekijk op Google Maps
                      </a>
                    </div>
                  )}
                </div>

                {/* Map Preview */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Kaart Preview
                  </h4>
                  <MapPreview
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    address={formData.address}
                    city={formData.city}
                    country={formData.country}
                    height={200}
                    className="w-full"
                  />
                </div>

                {/* Status & Featured */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="actief">Actief</option>
                      <option value="concept">Concept</option>
                      <option value="verkocht">Verkocht</option>
                      <option value="verhuurd">Verhuurd</option>
                      <option value="ingetrokken">Ingetrokken</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        <Tag size={16} className="inline mr-1" />
                        Uitgelicht
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <ImageIcon size={20} className="mr-2" />
                  Afbeeldingen * ({formData.images.length}/15)
                </h3>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enhancementEnabled}
                    onChange={(e) => setEnhancementEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>Auto-verbetering</span>
                </label>
              </div>

              <div className="space-y-4">
                {/* Image Upload Area */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    formData.images.length >= 15
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : dragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={formData.images.length < 15 ? handleDragOver : undefined}
                  onDragLeave={formData.images.length < 15 ? handleDragLeave : undefined}
                  onDrop={formData.images.length < 15 ? handleDrop : undefined}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                    disabled={formData.images.length >= 15}
                  />
                  <ImageIcon size={48} className={`mx-auto mb-4 ${formData.images.length >= 15 ? 'text-gray-300' : 'text-gray-400'}`} />
                  {formData.images.length >= 15 ? (
                    <>
                      <p className="text-gray-500 mb-2">Maximaal aantal afbeeldingen bereikt (15/15)</p>
                      <p className="text-sm text-gray-400">Verwijder eerst enkele afbeeldingen om nieuwe toe te voegen</p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-2">Sleep afbeeldingen hierheen of</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImages || formData.images.length >= 15}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingImages ? 'Uploaden...' : 'Selecteer bestanden'}
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Maximaal 15 afbeeldingen • 10MB per afbeelding • JPG, PNG, WebP
                      </p>
                    </>
                  )}
                </div>

                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Verwijder afbeelding"
                          >
                            <X size={12} />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                              Hoofdfoto
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Warning when approaching limit */}
                    {formData.images.length >= 12 && formData.images.length < 15 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <p className="text-amber-700 text-sm">
                          ⚠️ Je nadert de limiet van 15 afbeeldingen. Nog {15 - formData.images.length} afbeelding(en) toegestaan.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {errors.images && (
                  <p className="text-red-600 text-sm">{errors.images}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="inline mr-1" />
                Beschrijving *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Beschrijf de woning in detail..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Kenmerken
              </h3>
              <FeatureSelector
                selectedFeatures={formData.features}
                onFeaturesChange={(features) => setFormData(prev => ({ ...prev, features }))}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {uploading ? (
                  <>
                    <Upload size={16} className="mr-2 animate-spin" />
                    {isEditing ? 'Bijwerken...' : 'Toevoegen...'}
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    {isEditing ? 'Bijwerken' : 'Toevoegen'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <ListingPreview
          formData={formData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
