import { csvLogger } from './csvLogger';

export function validateFileSize(file: File, maxSize: number = 10 * 1024 * 1024): boolean {
  if (file.size > maxSize) {
    csvLogger.log('error', `Bestand is te groot (maximum ${maxSize / (1024 * 1024)}MB)`);
    return false;
  }
  return true;
}

export function validateFileType(file: File): boolean {
  const validTypes = ['.csv', '.xlsx'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!validTypes.includes(fileExtension)) {
    csvLogger.log('error', `Ongeldig bestandsformaat. Toegestane formaten: ${validTypes.join(', ')}`);
    return false;
  }
  return true;
}

export function validateHeaders(headers: string[]): string[] {
  const requiredHeaders = [
    'title',
    'price',
    'address',
    'city',
    'country',
    'postalCode',
    'bedrooms',
    'bathrooms',
    'size',
    'images',
    'description',
    'type',
    'category',
    'features',
    'status'
  ];

  const missingHeaders = requiredHeaders.filter(header => 
    !headers.map(h => h.toLowerCase()).includes(header.toLowerCase())
  );

  if (missingHeaders.length > 0) {
    csvLogger.log('error', `Ontbrekende kolommen: ${missingHeaders.join(', ')}`);
  }

  return missingHeaders;
}
