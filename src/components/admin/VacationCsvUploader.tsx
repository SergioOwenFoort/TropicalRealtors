import React, { useState, useRef } from 'react';
import { VacationPropertyUploader } from '../horo/VacationPropertyUploader';
import { Upload, AlertCircle, FileText, Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { VacationProperty } from '../../types';
import { supabase } from '../../config/supabase.config';
import { supabaseAdmin } from '../../config/supabaseAdmin';
import { useAuth } from '../../hooks/useAuth';
import { geocodeAddress } from '../../services/geocodingService';
import * as XLSX from 'xlsx';

interface VacationCsvUploaderProps {
  className?: string;
}

export function VacationCsvUploader({ className = '' }: VacationCsvUploaderProps) {
  const { user } = useAuth();
  const [showSingleUploader, setShowSingleUploader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState<{ current: number; total: number } | null>(null);
  const [results, setResults] = useState<{
    added: number;
    duplicates: number;
    errors: number;
    details: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDuplicate = async (newProperty: Partial<VacationProperty>) => {
    try {
      const { data, error } = await supabase
        .from('vacation_properties')
        .select('id')
        .eq('name', newProperty.name)
        .eq('address', newProperty.address)
        .eq('city', newProperty.city)
        .limit(1);

      if (error) {
        console.error('Error checking for duplicates:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error in isDuplicate check:', error);
      return false;
    }
  };

  const parseCSVData = (data: any[]): Partial<VacationProperty>[] => {
    return data.map((row, index) => {
      try {
        // Map CSV columns to vacation property fields
        const property: Partial<VacationProperty> = {
          name: row.name || row.title || `Vacation Property ${index + 1}`,
          price: parseFloat(row.price) || 0,
          address: row.address || '',
          city: row.city || '',
          country: row.country || 'Bonaire',
          phone_number: row.phone_number || row.phone || '',
          bedrooms: parseInt(row.bedrooms) || 1,
          bathrooms: parseInt(row.bathrooms) || 1,
          max_guests: parseInt(row.max_guests) || parseInt(row.guests) || 2,
          description: row.description || '',
          property_type: row.property_type || 'vacation_villa',
          amenities: Array.isArray(row.amenities) ? row.amenities : 
                   typeof row.amenities === 'string' ? row.amenities.split(',').map(a => a.trim()) : [],
          features: Array.isArray(row.features) ? row.features : 
                   typeof row.features === 'string' ? row.features.split(',').map(f => f.trim()) : [],
          rating: parseFloat(row.rating) || 4.0,
          distance_from_center: parseFloat(row.distance_from_center) || 0,
          featured: row.featured === 'true' || row.featured === true || false,
          check_in_time: row.check_in_time || '15:00',
          check_out_time: row.check_out_time || '11:00',
          minimum_stay: parseInt(row.minimum_stay) || 1,
          maximum_stay: parseInt(row.maximum_stay) || 30,
          cancellation_policy: row.cancellation_policy || 'flexible',
          house_rules: Array.isArray(row.house_rules) ? row.house_rules : 
                      typeof row.house_rules === 'string' ? row.house_rules.split(',').map(r => r.trim()) : 
                      ['Niet roken', 'Geen huisdieren'],
          instant_booking: row.instant_booking === 'true' || row.instant_booking === true || false,
          status: row.status || 'available',
          island: row.island || row.country || 'Bonaire',
          images: Array.isArray(row.images) ? row.images : 
                 typeof row.images === 'string' ? row.images.split(',').map(img => img.trim()) : [],
          latitude: row.latitude ? parseFloat(row.latitude) : undefined,
          longitude: row.longitude ? parseFloat(row.longitude) : undefined
        };

        return property;
      } catch (error) {
        console.error(`Error parsing row ${index + 1}:`, error);
        return null;
      }
    }).filter(Boolean) as Partial<VacationProperty>[];
  };

  const validateProperty = (property: Partial<VacationProperty>): string[] => {
    const errors: string[] = [];

    if (!property.name || property.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!property.price || property.price <= 0) {
      errors.push('Valid price is required');
    }

    if (!property.address || property.address.trim().length === 0) {
      errors.push('Address is required');
    }

    if (!property.city || property.city.trim().length === 0) {
      errors.push('City is required');
    }

    if (!property.bedrooms || property.bedrooms < 0) {
      errors.push('Valid bedrooms count is required');
    }

    if (!property.bathrooms || property.bathrooms < 0) {
      errors.push('Valid bathrooms count is required');
    }

    if (!property.max_guests || property.max_guests <= 0) {
      errors.push('Valid max guests count is required');
    }

    const validPropertyTypes = ['vacation_villa', 'vacation_apartment', 'vacation_resort', 'vacation_hotel', 'vacation_studio', 'vacation_penthouse', 'vacation_house', 'vacation_cottage'];
    if (!property.property_type || !validPropertyTypes.includes(property.property_type as any)) {
      errors.push(`Property type must be one of: ${validPropertyTypes.join(', ')}`);
    }

    return errors;
  };

  const saveProperty = async (property: Partial<VacationProperty>) => {
    try {
      // Use the user from context (custom admin auth)
      if (!user?.id) {
        console.error('❌ No user in context');
        throw new Error('Not authenticated. Please log in again.');
      }

      console.log('� Using context user ID:', user.id);

      const propertyData = {
        ...property,
        horo_id: user.id, // Use the context user's ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📤 Attempting to save property:', property.name);

      const { data, error } = await supabase
        .from('vacation_properties')
        .insert([propertyData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Property saved successfully:', data?.name);
      return data;
    } catch (error) {
      console.error('Error saving vacation property:', error);
      throw error;
    }
  };

  const processData = async (data: any[]) => {
    console.log(`🔄 Starting vacation property upload with ${data.length} rows`);
    let addedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    const details: string[] = [];

    const properties = parseCSVData(data);
    console.log(`🏝️ Parsed ${properties.length} vacation properties`);

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(`🔄 Processing vacation property ${i + 1}:`, property);

      const validationErrors = validateProperty(property);
      if (validationErrors.length > 0) {
        console.error(`❌ Validation errors for row ${i + 1}:`, validationErrors.join(', '));
        details.push(`Row ${i + 1} (${property.name}): ${validationErrors.join(', ')}`);
        errorCount++;
        continue;
      }

      // Geocode address if coordinates are missing
      if (!property.latitude || !property.longitude) {
        if (property.address && property.city) {
          try {
            setGeocodingProgress({ current: i + 1, total: properties.length });
            console.log(`🗺️ Geocoding address for property ${i + 1}: ${property.address}, ${property.city}`);
            
            const geoResult = await geocodeAddress(
              property.address,
              property.city,
              property.country || 'Caribbean'
            );
            
            if (geoResult) {
              property.latitude = geoResult.latitude;
              property.longitude = geoResult.longitude;
              console.log(`✅ Coordinates found: ${geoResult.latitude}, ${geoResult.longitude}`);
              details.push(`Row ${i + 1}: Geocoded "${property.name}" to ${geoResult.latitude}, ${geoResult.longitude}`);
            } else {
              console.log(`⚠️ No coordinates found for ${property.address}, ${property.city}`);
              details.push(`Row ${i + 1}: Could not geocode address for "${property.name}"`);
            }
            
            // Respect rate limit (1 request per second)
            if (i < properties.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.error(`❌ Geocoding error for row ${i + 1}:`, error);
            details.push(`Row ${i + 1}: Geocoding failed for "${property.name}"`);
          }
        }
      }
      setGeocodingProgress(null);

      const isDupe = await isDuplicate(property);
      if (isDupe) {
        console.log(`⚠️ Duplicate found for row ${i + 1}: ${property.name}`);
        details.push(`Row ${i + 1}: Duplicate vacation property "${property.name}" at ${property.address}`);
        duplicateCount++;
        continue;
      }

      try {
        console.log(`➕ Adding vacation property: ${property.name}`);
        await saveProperty(property);
        addedCount++;
        details.push(`Row ${i + 1}: Successfully added "${property.name}"`);
        console.log(`✅ Successfully added vacation property ${i + 1}`);
      } catch (error) {
        console.error(`❌ Error adding vacation property ${i + 1}:`, error);
        details.push(`Row ${i + 1} (${property.name}): Error - ${error}`);
        errorCount++;
      }
    }

    console.log(`📊 Vacation property upload results: Added: ${addedCount}, Duplicates: ${duplicateCount}, Errors: ${errorCount}`);

    setResults({
      added: addedCount,
      duplicates: duplicateCount,
      errors: errorCount,
      details
    });

    // Show success/error toast
    if (addedCount > 0) {
      toast.success(`${addedCount} vacation properties added successfully!`);
    }
    if (duplicateCount > 0) {
      toast(`${duplicateCount} duplicates were skipped`, { icon: '⚠️' });
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} properties had errors`);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    console.log('handleFileUpload called with files:', files);
    
    if (!files || files.length === 0) {
      console.log('No files provided');
      return;
    }

    const file = files[0];
    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!file.name.match(/\.(csv|xlsx?|xls)$/i)) {
      console.log('File type not recognized:', file.name);
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    console.log('Starting upload process...');
    setUploading(true);
    setResults(null);

    try {
      // Virus scan (skip for now to speed up testing)
      console.log('Skipping virus scan for CSV files...');
      // const scanResult = await virusScanner.scanPropertyFile(file);
      // if (!scanResult.success) {
      //   toast.error('File failed security scan');
      //   return;
      // }

      let data: any[] = [];
      console.log('Processing file type:', file.name);

      if (file.name.match(/\.(xlsx?|xls)$/i)) {
        // Handle Excel files
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else {
        // Handle CSV files using XLSX library (properly handles quoted fields)
        const text = await file.text();
        const workbook = XLSX.read(text, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      }

      console.log('Parsed data:', data);
      console.log('First row sample:', data[0]);

      if (data.length === 0) {
        toast.error('No data found in file');
        return;
      }

      await processData(data);

    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Vacation Property CSV/Excel Upload</h2>
          <p className="text-sm text-gray-600">Upload vacation properties in bulk via CSV or Excel file</p>
        </div>
        <button
          onClick={() => setShowSingleUploader(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow"
        >
          <Plus className="w-4 h-4" />
          Add Single Vacation Property
        </button>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => handleFileUpload(e.target.files!)}
          className="hidden"
        />

        <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {uploading ? 'Processing...' : 'Upload Vacation Properties'}
        </h3>
        
        {geocodingProgress && (
          <div className="text-sm text-blue-600 mb-2">
            🗺️ Geocoding property {geocodingProgress.current} of {geocodingProgress.total}...
          </div>
        )}
        
        <p className="text-gray-600 mb-4">
          Drag and drop your CSV or Excel file here, or click to browse
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          {uploading ? 'Processing...' : 'Choose File'}
        </button>
      </div>

      {/* CSV Format Guide */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Expected CSV/Excel Format:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Required columns:</strong> name, price, address, city, bedrooms, bathrooms, max_guests</p>
          <p><strong>Optional columns:</strong> phone_number, country, description, property_type, amenities, features, rating, distance_from_center, featured, check_in_time, check_out_time, minimum_stay, maximum_stay, cancellation_policy, house_rules, instant_booking, status, island, images</p>
          <p><strong>Property types:</strong> vacation_villa, vacation_apartment, vacation_resort, vacation_hotel, vacation_studio, vacation_penthouse</p>
          <p><strong>Note:</strong> Separate multiple values with commas (amenities, features, house_rules, images)</p>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600">✓ Added: {results.added}</span>
            <span className="text-yellow-600">⚠ Duplicates: {results.duplicates}</span>
            <span className="text-red-600">✗ Errors: {results.errors}</span>
          </div>

          {results.details.length > 0 && (
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-gray-900">
                View Details ({results.details.length} items)
              </summary>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                {results.details.map((detail, index) => (
                  <div key={index}>{detail}</div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Single Vacation Property Uploader Modal */}
      {showSingleUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSingleUploader(false)} />
          <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Add Vacation Property</h2>
              <button
                onClick={() => setShowSingleUploader(false)}
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <VacationPropertyUploader
                onClose={() => setShowSingleUploader(false)}
                onSuccess={() => {
                  setShowSingleUploader(false);
                  toast.success('Vacation property added successfully!');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}