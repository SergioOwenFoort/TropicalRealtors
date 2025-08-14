import React, { useState, useRef, useEffect } from 'react';
import { getEnabledIslandOptions } from '../../utils/islandVisibility';
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Sparkles, TestTube } from 'lucide-react';
import { CarouselSlideInput } from '../../types';
import { useCarouselSlides } from '../../hooks/useCarouselSlides';
import { useUserRole } from '../../hooks/useUserRole';
import { ImageEnhancer } from '../../utils/imageEnhancer';
import { CarouselUploadTester } from '../../utils/carouselUploadTester';
import { useAuth } from '../../hooks/useAuth';
import { virusScanner } from '../../services/virusScanner';

interface CarouselSlideUploaderProps {
  onClose?: () => void;
  onSuccess?: () => void;
  initialData?: Partial<CarouselSlideInput>;
  isEditing?: boolean;
  slideId?: string;
}

export function CarouselSlideUploader({ 
  onClose, 
  onSuccess, 
  initialData,
  isEditing = false,
  slideId 
}: CarouselSlideUploaderProps) {
  const { createSlide, updateSlide, uploadImage, checkSlotAvailability, getSlideCounts, getSlideCountsByPeriod } = useCarouselSlides();
  const { isAdmin } = useUserRole();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<CarouselSlideInput>({
    image_url: initialData?.image_url || '',
    external_link: initialData?.external_link || '',
    island: initialData?.island || 'bonaire',
    is_active: initialData?.is_active ?? true,
    display_order: initialData?.display_order || 0
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [totalSlideCount, setTotalSlideCount] = useState<number>(0);
  const [slideCountsByPeriod, setSlideCountsByPeriod] = useState<{[key: number]: number}>({});
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementEnabled, setEnhancementEnabled] = useState(true);
  // Calendar helper functions - 13 period system starting Monday June 30, 2025
  const CALENDAR_START_DATE = new Date(2025, 5, 30); // June 30, 2025 (Monday)
  
  const getCurrentPeriod = (): number => {
    const now = new Date();
    const diffTime = now.getTime() - CALENDAR_START_DATE.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    const period = Math.floor(diffWeeks / 4) + 1;
    
    // Ensure period is between 1 and 13
    return Math.max(1, Math.min(13, period));
  };

  const getPeriodDateRange = (period: number): { start: Date; end: Date } => {
    const weeksFromStart = (period - 1) * 4;
    const periodStart = new Date(CALENDAR_START_DATE.getTime() + (weeksFromStart * 7 * 24 * 60 * 60 * 1000));
    const periodEnd = new Date(periodStart.getTime() + (27 * 24 * 60 * 60 * 1000)); // 4 weeks - 1 day
    
    return { start: periodStart, end: periodEnd };
  };

  const formatPeriodDate = (date: Date): string => {
    return date.toLocaleDateString('nl-NL', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getPeriodOptions = () => {
    const options = [];
    const currentPeriod = getCurrentPeriod();
    
    for (let period = 1; period <= 13; period++) {
      const { start, end } = getPeriodDateRange(period);
      const isCurrent = period === currentPeriod;
      const isPast = period < currentPeriod;
      
      // Get actual slide count for this period
      const slidesInThisPeriod = slideCountsByPeriod[period] || 0;
      const slideCountDisplay = `${slidesInThisPeriod}/8`;
      
      options.push({
        value: period,
        label: `Periode ${period}${isCurrent ? ' (Huidig)' : isPast ? ' (Voorbij)' : ' (Toekomst)'}`,
        dateRange: `${formatPeriodDate(start)} - ${formatPeriodDate(end)}`,
        isCurrent,
        isPast,
        slideCount: slideCountDisplay
      });
    }
    
    return options;
  };

  const [selectedPeriod, setSelectedPeriod] = useState<number>(() => getCurrentPeriod());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch slide counts when island changes
  useEffect(() => {
    const fetchCounts = async () => {
      const count = await getSlideCounts(formData.island);
      setTotalSlideCount(count);
      
      // Fetch slide counts for all periods
      const periodCounts: {[key: number]: number} = {};
      for (let period = 1; period <= 13; period++) {
        const periodCount = await getSlideCountsByPeriod(formData.island, period);
        periodCounts[period] = periodCount;
      }
      setSlideCountsByPeriod(periodCounts);
    };
    
    fetchCounts();
  }, [formData.island, getSlideCounts, getSlideCountsByPeriod]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.image_url && !imagePreview && !selectedFile) {
      newErrors.image = 'Afbeelding is verplicht';
    }

    if (formData.external_link && !isValidUrl(formData.external_link)) {
      newErrors.external_link = 'Voer een geldige URL in';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSlotAvailability = async (): Promise<boolean> => {
    if (isEditing) {
      return true; // Editing existing slide
    }

    // Check availability for the selected period
    const currentPeriodCount = slideCountsByPeriod[selectedPeriod] || 0;
    
    if (currentPeriodCount >= 8) {
      setErrors(prev => ({
        ...prev,
        general: `Periode ${selectedPeriod} voor ${formData.island} is vol (maximaal 8 slides per periode)`
      }));
      return false;
    }

    return true;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Alleen afbeeldingen zijn toegestaan' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({ ...prev, image: 'Afbeelding mag maximaal 5MB zijn' }));
      return;
    }

    // Check image dimensions
    const dimensionsValid = await validateImageDimensions(file);
    if (!dimensionsValid) {
      return; // Error already set in validateImageDimensions
    }

    // Scan image with optimized virus scanner
    console.log(`🔍 Scanning carousel image: ${file.name}`);
    const scanResult = await virusScanner.scanImage(file);
    if (!scanResult.success) {
      setErrors(prev => ({ ...prev, image: scanResult.message || 'Beveiligingsscan gefaald' }));
      return;
    }
    console.log(`✅ Carousel image passed security checks`);

    setErrors(prev => ({ ...prev, image: '' }));
    setIsEnhancing(true);

    try {
      let processedFile = file;
      
      // Enhance image if enabled
      if (enhancementEnabled) {
        processedFile = await ImageEnhancer.quickEnhanceForCarousel(file);
      }

      setSelectedFile(processedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Error enhancing image:', error);
      // Fallback to original file if enhancement fails
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: 'Afbeelding verbetering gefaald, origineel gebruikt' }));
    } finally {
      setIsEnhancing(false);
    }
  };

  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const minWidth = 800;
        const minHeight = 400;
        
        if (img.width < minWidth || img.height < minHeight) {
          setErrors(prev => ({ 
            ...prev, 
            image: `Afbeelding moet minimaal ${minWidth}x${minHeight} pixels zijn. Huidige afmeting: ${img.width}x${img.height} pixels` 
          }));
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => {
        setErrors(prev => ({ ...prev, image: 'Kan afbeelding niet laden' }));
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!selectedFile) {
      console.log('📷 No file selected, using existing URL:', formData.image_url);
      return formData.image_url || null;
    }

    console.log('🔄 Starting carousel image upload process...', { 
      fileName: selectedFile.name, 
      fileSize: selectedFile.size,
      fileType: selectedFile.type 
    });

    try {
      const imageUrl = await uploadImage(selectedFile);
      console.log('📷 Upload result:', { imageUrl, success: !!imageUrl });
      
      if (imageUrl) {
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
        console.log('✅ Image upload successful:', imageUrl);
        return imageUrl;
      } else {
        console.error('❌ Upload failed: No URL returned');
        setErrors(prev => ({ ...prev, image: 'Fout bij uploaden van afbeelding - geen URL ontvangen' }));
        return null;
      }
    } catch (error) {
      console.error('💥 Upload error caught:', error);
      setErrors(prev => ({ ...prev, image: 'Fout bij uploaden van afbeelding: ' + (error as Error).message }));
      return null;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const slotAvailable = await validateSlotAvailability();
    if (!slotAvailable) return;

    setUploading(true);
    setErrors({});

    try {
      // Upload image first if needed
      const imageUrl = await handleImageUpload();
      if (!imageUrl && !formData.image_url) {
        setErrors(prev => ({ ...prev, image: 'Afbeelding uploaden gefaald' }));
        return;
      }

      const slideData = {
        ...formData,
        image_url: imageUrl || formData.image_url,
      };

      let result;
      if (isEditing && slideId) {
        result = await updateSlide(slideId, slideData);
      } else {
        result = await createSlide(slideData);
      }

      if (result) {
        onSuccess?.();
        onClose?.();
      } else {
        setErrors(prev => ({ ...prev, general: 'Fout bij opslaan van slide' }));
      }
    } catch (error) {
      console.error('Error saving slide:', error);
      setErrors(prev => ({ ...prev, general: 'Fout bij opslaan van slide' }));
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      image_url: '',
      external_link: '',
      island: formData.island,
      is_active: true,
      display_order: 0
    });
    setImagePreview('');
    setSelectedFile(null);
    setErrors({});
  };

  // Test function to debug upload issues
  const testStorageAndUpload = async () => {
    console.log('🧪 Starting storage and upload tests...');
    
    try {
      // Test storage buckets
      await CarouselUploadTester.testStorageBuckets();
      
      // Test with current file if available
      if (selectedFile && user?.id) {
        await CarouselUploadTester.testImageUpload(selectedFile, user.id);
      } else {
        console.log('📝 No file selected or user not available for upload test');
      }
    } catch (error) {
      console.error('💥 Test error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Slide bewerken' : 'Nieuwe slide toevoegen'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Island Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eiland
              </label>
              <select
                value={formData.island}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  island: e.target.value as any
                }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getEnabledIslandOptions().map(island => (
                  <option key={island.key} value={island.key}>{island.label}</option>
                ))}
              </select>
            </div>

            {/* 13-Period Calendar System */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periode Selectie (4-weken cyclus)
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getPeriodOptions().map((option) => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    className={option.isCurrent ? 'font-bold' : ''}
                  >
                    {option.label} | {option.dateRange} | {option.slideCount}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Afbeelding
                </label>
                <div className="flex items-center space-x-2">
                  <Sparkles size={16} className="text-blue-500" />
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
              </div>
              
              {/* Image Requirements Info */}
              <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-xs text-gray-600">
                  <strong>Vereisten:</strong> Minimaal 800x400 pixels • Maximum 5MB • Formaten: JPG, PNG, WebP
                </p>
              </div>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                } ${isEnhancing ? 'opacity-75' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {isEnhancing ? (
                  <div className="flex flex-col items-center">
                    <Sparkles size={48} className="mx-auto text-blue-500 mb-4 animate-pulse" />
                    <p className="text-blue-600 font-medium">Afbeelding wordt intelligent verbeterd...</p>
                    <p className="text-sm text-gray-500 mt-1">Scherpte en contrast worden geoptimaliseerd</p>
                    <p className="text-xs text-gray-400 mt-1">Tekst in afbeeldingen wordt beschermd tegen vervaging</p>
                  </div>
                ) : imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setSelectedFile(null);
                        setFormData(prev => ({ ...prev, image_url: '' }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Sleep een afbeelding hierheen of</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Selecteer bestand
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Ideaal: 1200x600px+ voor scherpe carousel weergave
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
              {errors.image && (
                <p className="text-red-600 text-sm mt-1">{errors.image}</p>
              )}
              {enhancementEnabled && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-700 text-xs leading-relaxed">
                    <Sparkles size={12} className="inline mr-1" />
                    <strong>Intelligente auto-verbetering:</strong> Optimaliseert scherpte, contrast en kleuren voor betere carousel weergave. 
                    Gebruikt geavanceerde tekst-detectie om tekst in afbeeldingen helder te houden zonder vervaging.
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    <strong>Aanbevolen:</strong> 1200x600 pixels of hoger voor optimale kwaliteit na verbetering.
                  </p>
                </div>
              )}
            </div>

            {/* External Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <LinkIcon size={16} className="inline mr-1" />
                Website link (optioneel)
              </label>
              <input
                type="url"
                value={formData.external_link}
                onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
              {errors.external_link && (
                <p className="text-red-600 text-sm mt-1">{errors.external_link}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {uploading ? (
                  <>
                    <Upload size={16} className="mr-2 animate-spin" />
                    {isEditing ? 'Bijwerken...' : 'Uploaden...'}
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    {isEditing ? 'Bijwerken' : 'Uploaden'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
