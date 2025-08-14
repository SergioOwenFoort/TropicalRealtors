import React, { useState } from 'react';
import { Camera, Upload, X, Edit3 } from 'lucide-react';
import { supabase, supabaseService } from '../../services/supabaseService';
import { Realtor, RealtorUpload } from '../../types/realtor';
import { getEnabledIslandOptions } from '../../utils/islandVisibility';
import { ImageAdjuster } from './ImageAdjuster';
import { virusScanner } from '../../services/virusScanner';

interface RealtorUploaderProps {
  existingRealtor?: Realtor;
  onSuccess?: () => void;
  onCancel?: () => void;
  currentUserEmail?: string;
}

export const RealtorUploader: React.FC<RealtorUploaderProps> = ({
  existingRealtor,
  onSuccess,
  onCancel,
  currentUserEmail
}) => {
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };
  const [formData, setFormData] = useState({
    name: existingRealtor?.name || '',
    email: existingRealtor?.email || currentUserEmail || '',
    phone: existingRealtor?.phone || '',
    island: existingRealtor?.island || 'bonaire' as 'bonaire' | 'aruba' | 'curacao',
    companyName: existingRealtor?.companyName || '',
    specialization: existingRealtor?.specialization || '',
    languages: existingRealtor?.languages?.join(', ') || '',
    location: existingRealtor?.location || '',
    bio: existingRealtor?.bio || ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(existingRealtor?.image_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showImageAdjuster, setShowImageAdjuster] = useState(false);
  const [tempImagePreview, setTempImagePreview] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateAndSetImage = async (file: File) => {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP, or SVG)');
      return;
    }

    // Scan image with optimized virus scanner
    console.log(`🔍 Scanning profile image: ${file.name}`);
    try {
      const scanResult = await virusScanner.scanImage(file);
      if (!scanResult.success) {
        setError(`Beveiligingsscan gefaald: ${scanResult.message}`);
        return;
      }
      console.log(`✅ Profile image passed security checks`);
    } catch (error) {
      console.error('Virus scan error:', error);
      setError('Beveiligingsscan gefaald. Probeer opnieuw.');
      return;
    }

    setError(null);
    setImageFile(file);
    
    // Create preview and show image adjuster
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setTempImagePreview(imageDataUrl);
      setShowImageAdjuster(true);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSetImage(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetImage(files[0]);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `realtor-images/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = existingRealtor?.image_url || '';

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const realtorData: RealtorUpload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        island: formData.island,
        companyName: formData.companyName,
        specialization: formData.specialization,
        languages: formData.languages.split(',').map(lang => lang.trim()).filter(lang => lang.length > 0),
        location: formData.location,
        bio: formData.bio,
        image_url: imageUrl
      };

      if (existingRealtor) {
        await supabaseService.updateRealtor(existingRealtor.id, realtorData);
      } else {
        await supabaseService.addRealtor(realtorData);
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageAdjusterSave = (adjustedImageDataUrl: string) => {
    // Convert data URL to blob
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a new File object from the blob
          const adjustedFile = new File([blob], imageFile?.name || 'adjusted-image.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          setImageFile(adjustedFile);
          setImagePreview(adjustedImageDataUrl);
        }
        setShowImageAdjuster(false);
        setTempImagePreview('');
      }, 'image/jpeg', 0.9);
    };
    
    img.src = adjustedImageDataUrl;
  };

  const handleImageAdjusterCancel = () => {
    setShowImageAdjuster(false);
    setTempImagePreview('');
    setImageFile(null);
  };

  const openImageAdjuster = () => {
    if (imagePreview) {
      setTempImagePreview(imagePreview);
      setShowImageAdjuster(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {existingRealtor ? 'Update Realtor Profile' : 'Add New Realtor'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload with Drag & Drop */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Profile Image</label>
          
          {imagePreview ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <div className="w-48 h-48 rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-50">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Image Adjustment Button */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openImageAdjuster}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <Edit3 size={14} />
                  <span>Adjust Image</span>
                </button>
              </div>
              
              {/* Drag & Drop Zone for Replacement */}
              <div 
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <p className="text-sm text-gray-600 mb-2">
                  {isDragOver ? 'Drop new image here to replace' : 'Drag & drop a new image here to replace'}
                </p>
                <label className="inline-flex items-center gap-2 bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 cursor-pointer transition-colors text-sm">
                  <Upload size={14} />
                  <span>Choose New Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragOver ? 'Drop your image here' : 'Drag & drop your image here'}
              </p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
                <Upload size={16} />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-4">Max 5MB. JPEG, PNG, GIF, WebP, or SVG.</p>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Island *</label>
            <select
              name="island"
              value={formData.island}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {/* Dynamically render enabled islands */}
              {getEnabledIslandOptions().map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Kralendijk, Oranjestad"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              placeholder="e.g., Residential, Commercial, Luxury Properties"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
            <input
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleInputChange}
              placeholder="e.g., Dutch, English, Papiamento"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            placeholder="Tell us about yourself and your experience..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Saving...' : (existingRealtor ? 'Update Profile' : 'Create Profile')}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Image Adjuster Modal */}
      {showImageAdjuster && tempImagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <ImageAdjuster
              imageUrl={tempImagePreview}
              onSave={handleImageAdjusterSave}
              onCancel={handleImageAdjusterCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};
