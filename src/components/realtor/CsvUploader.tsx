import React, { useState, useRef } from 'react';
import { ListingUploader } from './ListingUploader';
import { Upload, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { parseFile } from '../../utils/csvParser';
import { parseExcelOrCsvFile } from '../../utils/excelOrCsvParser';
import { transformPropertyData, validateTransformedData } from '../../utils/dataTransformer';
import { csvLogger } from '../../utils/csvLogger';
import { Property } from '../../types';
import { getEnabledIslandOptions } from '../../utils/islandVisibility';
import { useProperties } from '../../hooks/useProperties';
import { CARIBBEAN_ISLANDS } from '../../data/countries';
import { virusScanner } from '../../services/virusScanner';

export function CsvUploader() {
  const [showSingleUploader, setShowSingleUploader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { properties, addProperty } = useProperties();

  const isDuplicate = (newProperty: Partial<Property>) => {
    return properties.some(existingProperty => 
      existingProperty.address.toLowerCase() === newProperty.address?.toLowerCase() &&
      existingProperty.city.toLowerCase() === newProperty.city?.toLowerCase() &&
      (existingProperty.postalCode || '').toLowerCase() === (newProperty.postalCode || '').toLowerCase()
    );
  };

  // Only allow properties for enabled islands
  const [enabledIslands, setEnabledIslands] = React.useState(getEnabledIslandOptions());
  React.useEffect(() => {
    let last = JSON.stringify(localStorage.getItem('islandVisibility'));
    const check = () => {
      const current = JSON.stringify(localStorage.getItem('islandVisibility'));
      if (current !== last) {
        last = current;
        setEnabledIslands(getEnabledIslandOptions());
      }
    };
    const interval = setInterval(check, 500);
    window.addEventListener('storage', check);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', check);
    };
  }, []);

  const processData = async (data: any[]) => {
    console.log(`🔄 Starting processData with ${data.length} rows`);
    let addedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    const enabledIslandKeys = enabledIslands.map(i => i.key);
    console.log(`🏝️ Enabled islands:`, enabledIslandKeys);
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      console.log(`🔄 Processing row ${i + 1}:`, row);
      
      const property = transformPropertyData(row);
      console.log(`🏠 Transformed property:`, property);
      
      // Only process if property.country is enabled
      if (!property || !property.country || !enabledIslandKeys.includes(property.country)) {
        console.log(`❌ Skipping row ${i + 1}: Invalid property or disabled island`, { property: property?.country, enabled: enabledIslandKeys });
        errorCount++;
        continue;
      }

      const validationErrors = validateTransformedData(property);
      if (validationErrors.length > 0) {
        console.log(`❌ Validation errors for row ${i + 1}:`, validationErrors);
        csvLogger.log('error', `Validatiefouten voor ${property.address}:`, validationErrors);
        errorCount++;
        continue;
      }

      if (isDuplicate(property)) {
        console.log(`⚠️ Duplicate found for row ${i + 1}: ${property.address}`);
        duplicateCount++;
        csvLogger.log('warning', `Duplicaat overgeslagen: ${property.address}, ${property.city}`);
        continue;
      }

      try {
        console.log(`➕ Adding property: ${property.title}`);
        await addProperty(property);
        addedCount++;
        console.log(`✅ Successfully added property ${i + 1}`);
      } catch (error) {
        console.error(`❌ Error adding property ${i + 1}:`, error);
        errorCount++;
        csvLogger.log('error', `Fout bij toevoegen van woning: ${property.address}`, error);
      }
    }

    console.log(`📊 Final results: Added: ${addedCount}, Duplicates: ${duplicateCount}, Errors: ${errorCount}`);

    if (errorCount > 0) {
      toast.error(`${errorCount} woningen konden niet worden toegevoegd`);
    }
    if (duplicateCount > 0) {
      toast(`${addedCount} woningen toegevoegd, ${duplicateCount} overgeslagen (reeds bestaand)`, { icon: '⚠️' });
    }
    if (addedCount > 0) {
      toast.success(`${addedCount} woningen succesvol toegevoegd`);
    }
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    csvLogger.clear();

    try {
      // 1. Scan file with optimized virus scanner
      console.log(`🔍 Scanning CSV file: ${file.name}`);
      const scanResult = await virusScanner.scanPropertyFile(file);
      
      if (!scanResult.success) {
        toast.error(scanResult.message || 'Beveiligingsscan gefaald');
        return;
      }

      console.log(`✅ CSV file passed security checks`);

      // 2. Parse the CSV file
      console.log(`📄 Parsing CSV file...`);
      const result = await parseExcelOrCsvFile(file);
      console.log(`📄 Parse result:`, result);
      
      if (!result || !Array.isArray(result.data)) {
        console.error("❌ Fout bij verwerken van bestand: data is not iterable", result);
        toast.error("Fout bij verwerken van CSV bestand");
        return;
      }

      console.log(`📊 Raw data rows: ${result.data.length}`);
      
      const filteredData = result.data.filter(
        row => row && Object.values(row).some(val => val !== null && val !== undefined && String(val).trim() !== "")
      );
      
      console.log(`📊 Filtered data rows: ${filteredData.length}`);
      console.log(`📊 Sample row:`, filteredData[0]);
      
      if (filteredData.length === 0) {
        toast.error("Geen geldige data gevonden in CSV bestand");
        return;
      }

      // 3. Process the data
      console.log(`⚙️ Processing ${filteredData.length} rows...`);
      await processData(filteredData);
      console.log(`✅ Processing completed`);
      
    } catch (error: any) {
      console.error("❌ Error in handleFile:", error);
      csvLogger.log('error', `Fout bij verwerken van bestand: ${error.message}`);
      toast.error(`Fout: ${error.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Bestand uploaden</h2>
          <p className="text-gray-600">
            Upload een CSV of Excel bestand om meerdere woningen tegelijk toe te voegen
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">
              Sleep een bestand hierheen of{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
                type="button"
              >
                klik om te uploaden
              </button>
            </p>
            <p className="text-sm text-gray-500">CSV of Excel bestanden</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleChange}
            disabled={uploading}
            className="hidden"
          />
        </div>

        <button
          className="w-full mt-2 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          type="button"
          onClick={() => setShowSingleUploader(true)}
        >
          Nieuwe woning toevoegen
        </button>

        {showSingleUploader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 relative min-w-[350px]">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowSingleUploader(false)}
                type="button"
                aria-label="Sluiten"
              >
                ×
              </button>
              <ListingUploader onClose={() => setShowSingleUploader(false)} />
            </div>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-600">
              <p className="font-semibold mb-2">Vereiste kolommen in het bestand:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>title - Titel van de woning (verplicht)</li>
                <li>price - Prijs (numeriek, verplicht)</li>
                <li>address - Adres (verplicht)</li>
                <li>city - Stad (verplicht)</li>
                <li>country - Land (optioneel, bijv. {enabledIslands.map(i => `${i.flag ? i.flag : ''} ${i.label ? i.label : ''}`).join(', ')})</li>
                <li>category - Categorie (appartementen/huizen/vakantiewoningen/nieuwbouw/hotel/resort) (verplicht)</li>
                <li>description - Beschrijving (verplicht)</li>
                <li>images - Afbeelding URLs (komma-gescheiden, minimaal 1, verplicht)</li>
                <li>type - Type (koop/huur) (verplicht)</li>
                <li>size - Woonoppervlak in m² (numeriek, verplicht)</li>
              </ul>
              <p className="mt-2 text-xs text-yellow-700">Optionele kolommen: country, phone_number (of phone), postalCode, bedrooms, bathrooms, features, status, makelaarId</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
