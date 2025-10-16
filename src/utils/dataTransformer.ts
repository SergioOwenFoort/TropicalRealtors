import { Property } from '../types';
import { csvLogger } from './csvLogger';

function generateListingId(): string {
  // Polyfill for UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

const allowedStatus = ["actief", "verkocht", "verhuurd"]; // Update this list to match your DB

export function transformPropertyData(row: Record<string, any>): Omit<Property, 'id'> | null {
  try {
    let status = (row.status || "actief").toLowerCase();
    if (!allowedStatus.includes(status)) {
      status = "actief"; // fallback to default if not allowed
    }
    return {
      title: row.title,
      price: Number(row.price),
      address: row.address,
      city: row.city,
      country: row.country,
      phone_number: row.phone_number || row.phone || "",
      postalCode: row.postalcode || row.postalCode || "",
      bedrooms:
        row.bedrooms !== undefined &&
        row.bedrooms !== null &&
        row.bedrooms !== "" &&
        !isNaN(Number(row.bedrooms))
          ? Number(row.bedrooms)
          : 0,
      bathrooms:
        row.bathrooms !== undefined &&
        row.bathrooms !== null &&
        row.bathrooms !== "" &&
        !isNaN(Number(row.bathrooms))
          ? Number(row.bathrooms)
          : 0,
      size: Number(row.size),
      images: typeof row.images === "string"
        ? row.images.split(",").map((url: string) => url.trim())
        : [],
      description: row.description,
      type: row.type as "koop" | "huur",
      category: row.category as Property["category"],
      features: typeof row.features === "string"
        ? row.features.split(/[,|]/).map((feature: string) => feature.trim())
        : [],
      datePosted: formatDateToISO(new Date()),
      status, // use validated status
      featured: false,
      listingId: generateListingId()
    };
  } catch (error: any) {
    csvLogger.log('error', `Fout bij transformeren van data: ${error.message}`, row);
    return null;
  }
}

export function validateTransformedData(property: Omit<Property, 'id'>): string[] {
  const errors: string[] = [];

  if (!property.title) errors.push('Titel is verplicht');
  if (!property.price || property.price <= 0) errors.push('Ongeldige prijs');
  if (!property.address) errors.push('Adres is verplicht');
  if (!property.city) errors.push('Stad is verplicht');
  if (!property.country) errors.push('Land is verplicht');
  // Removed postalCode validation - it's now optional
  if (property.bedrooms < 0) errors.push('Ongeldig aantal slaapkamers');
  if (property.bathrooms < 0) errors.push('Ongeldig aantal badkamers');
  if (property.size <= 0) errors.push('Ongeldige grootte');
  if (property.images.length === 0) errors.push('Minimaal één afbeelding is verplicht');
  if (!property.description) errors.push('Beschrijving is verplicht');

  return errors;
}
