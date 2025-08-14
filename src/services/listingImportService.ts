import { Property } from '../types';
import { ListingUrl } from '../types/listing';
import { insertProperty } from './supabaseInsertProperty';

/**
 * Import a listing from a given URL, extract only the allowed fields, and save as a Property.
 * This function is a stub: you must implement the actual fetching and parsing logic for your target sites.
 * Only the fields defined in the Property interface will be saved.
 */
export async function importListingFromUrl(listingUrl: ListingUrl): Promise<Property | null> {
  // 1. Fetch the page (replace with your actual fetch logic)
  const response = await fetch(listingUrl.url);
  if (!response.ok) throw new Error('Failed to fetch listing URL');
  const html = await response.text();

  // 2. Parse the HTML and extract only the allowed fields (stub example)
  // You must implement the actual extraction logic for your use case
  const extracted: Partial<Property> = {
    // Example: title: extractTitle(html),
    // Example: price: extractPrice(html),
    // ...
  };

  // 3. Validate and construct the Property object
  // Only include fields defined in Property interface
  const property: Property = {
    id: crypto.randomUUID(),
    title: extracted.title || 'Unknown',
    price: extracted.price || 0,
    address: extracted.address || '',
    city: extracted.city || '',
    country: extracted.country || '',
    bedrooms: extracted.bedrooms || 0,
    bathrooms: extracted.bathrooms || 0,
    size: extracted.size || 0,
    images: extracted.images || [],
    description: extracted.description || '',
    type: extracted.type || 'koop',
    category: extracted.category || 'huizen',
    features: extracted.features || [],
    datePosted: new Date().toISOString(),
    status: 'actief',
    makelaarId: listingUrl.user_id,
    featured: false,
  };

  // 4. Save to your Supabase cloud database
  await insertProperty(property);

  return property;
}

/**
 * Only the fields in the Property interface are extracted and saved.
 * No extra data from the page is stored.
 */
