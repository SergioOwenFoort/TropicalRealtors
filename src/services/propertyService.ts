// Fetch all properties (for admin dashboard) - optimized with specific fields
export async function getAllProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id, title, description, price, original_price, address, city, country, postal_code,
        latitude, longitude, square_meters, bedrooms, bathrooms, property_type,
        date_posted, featured, images, created_by, owner_id, listing_id, updated_at,
        status, category, features, phone_number, created_by_role
      `)
      .order('date_posted', { ascending: false })
      .limit(100); // Add pagination limit
    if (error) throw error;
    return (data || []).map(mapDbToProperty);
  } catch (error) {
    console.error('Error fetching all properties:', error);
    throw error;
  }
}
import { supabase } from '../config/supabase.config';
import { Property, PropertyFilters } from '../types';

// Database field mapping functions
function mapPropertyToDb(property: Omit<Property, 'id'>) {
  return {
    title: property.title,
    description: property.description,
    price: property.price,
    original_price: property.originalPrice,
    address: property.address,
    city: property.city,
    country: property.country || 'Netherlands Antilles',
    postal_code: property.postalCode,
    latitude: property.latitude,
    longitude: property.longitude,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    square_meters: property.size,
    images: property.images,
    property_type: property.type,
    category: property.category,
    features: property.features,
    status: property.status,
    featured: property.featured,
    listing_id: property.listingId, // <-- use listingId
    date_posted: property.datePosted
  };
}

export function mapDbToProperty(dbData: any): Property {
  return {
    id: dbData.id,
    title: dbData.title,
    description: dbData.description,
    price: dbData.price,
    originalPrice: dbData.original_price,
    address: dbData.address,
    city: dbData.city,
    country: dbData.country,
    postalCode: dbData.postal_code,
    latitude: dbData.latitude,
    longitude: dbData.longitude,
    bedrooms: dbData.bedrooms,
    bathrooms: dbData.bathrooms,
    size: dbData.square_meters,
    images: dbData.images || [],
    type: dbData.property_type,
    category: dbData.category,
    features: dbData.features || [],
    status: dbData.status,
    featured: dbData.featured || false,
    makelaarId: dbData.owner_id, // Map owner_id to makelaarId for property ownership
    listingId: dbData.listing_id, // <-- use listingId
    datePosted: dbData.date_posted,
    phone_number: dbData.phone_number,
    created_by_role: dbData.created_by_role
  };
}

export async function addProperty(property: Omit<Property, 'id'>) {
  // Extract makelaarId and created_by_role and set it as created_by and owner_id
  const { makelaarId, created_by_role, ...propertyData } = property;

  // Use mapPropertyToDb to ensure correct DB field names
  const dbProperty = mapPropertyToDb(propertyData);
  
  // Set the created_by, owner_id, and created_by_role fields
  const finalDbProperty = {
    ...dbProperty,
    created_by: makelaarId || null,
    owner_id: makelaarId || null,
    created_by_role: created_by_role || null
  };

  const { data, error } = await supabase
    .from('properties')
    .insert([finalDbProperty])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function searchProperties(filters: PropertyFilters): Promise<Property[]> {
  try {
    let baseQuery = supabase
      .from('properties')
      .select('*');

    if (filters.type) {
      baseQuery = baseQuery.eq('property_type', filters.type);
    }

    if (filters.category) {
      baseQuery = baseQuery.eq('category', filters.category);
    }

    if (filters.country) {
      baseQuery = baseQuery.eq('country', filters.country);
    }

    if (filters.city) {
      baseQuery = baseQuery.eq('city', filters.city);
    }

    if (filters.minPrice) {
      baseQuery = baseQuery.gte('price', filters.minPrice);
    }

    if (filters.maxPrice) {
      baseQuery = baseQuery.lte('price', filters.maxPrice);
    }

    if (filters.minBedrooms) {
      baseQuery = baseQuery.gte('bedrooms', filters.minBedrooms);
    }

    if (filters.minSize) {
      baseQuery = baseQuery.gte('square_meters', filters.minSize);
    }

    const { data, error } = await baseQuery
      .order('date_posted', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []).map(mapDbToProperty);
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Record not found
      throw error;
    }

    return mapDbToProperty(data);
  } catch (error) {
    console.error('Error getting property:', error);
    throw error;
  }
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<boolean> {
  try {
    // Map frontend property fields to database fields
    const dbUpdates: any = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.country !== undefined) dbUpdates.country = updates.country;
    if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode;
    if (updates.latitude !== undefined) dbUpdates.latitude = updates.latitude;
    if (updates.longitude !== undefined) dbUpdates.longitude = updates.longitude;
    if (updates.bedrooms !== undefined) dbUpdates.bedrooms = updates.bedrooms;
    if (updates.bathrooms !== undefined) dbUpdates.bathrooms = updates.bathrooms;
    if (updates.size !== undefined) dbUpdates.square_meters = updates.size;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.type !== undefined) dbUpdates.property_type = updates.type;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.features !== undefined) dbUpdates.features = updates.features;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
    if (updates.makelaarId !== undefined) {
      dbUpdates.owner_id = updates.makelaarId;
      dbUpdates.created_by = updates.makelaarId;
    }
    if (updates.datePosted !== undefined) dbUpdates.date_posted = updates.datePosted;

    const { error } = await supabase
      .from('properties')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
}

export async function deleteProperty(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
}

export async function getFeaturedProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('featured', true)
      .order('date_posted', { ascending: false })
      .limit(6);

    if (error) throw error;
    return (data || []).map(mapDbToProperty);
  } catch (error) {
    console.error('Error getting featured properties:', error);
    throw error;
  }
}

export async function getPropertiesByUser(userId: string): Promise<Property[]> {
  try {
    // Single optimized query using OR conditions instead of 3 separate queries
    const { data: userProperties, error } = await supabase
      .from('properties')
      .select('*')
      .or(`created_by.eq.${userId},owner_id.eq.${userId},listing_id.eq.${userId}`)
      .order('date_posted', { ascending: false });

    if (error) throw error;

    if (!userProperties || userProperties.length === 0) {
      return [];
    }

    // Filter to ensure we only show properties where user has legitimate ownership
    const filteredProperties = userProperties.filter(prop => {
      // Priority: created_by > owner_id > listing_id (but only if also owned/created)
      if (prop.created_by === userId) return true;
      if (prop.owner_id === userId) return true;
      if (prop.listing_id === userId && (prop.owner_id === userId || prop.created_by === userId)) return true;
      return false;
    });

    return filteredProperties.map(mapDbToProperty);
  } catch (error) {
    console.error('Error getting user properties:', error);
    throw error;
  }
}

export async function getPropertiesByRealtor(userId: string): Promise<Property[]> {
  try {
    // Get properties where listing_id matches userId (for realtors)
    const { data: listingIdProps, error: error1 } = await supabase
      .from('properties')
      .select('*')
      .eq('listing_id', userId);

    if (error1) throw error1;

    // Get properties where created_by matches userId
    const { data: createdByProps, error: error2 } = await supabase
      .from('properties')
      .select('*')
      .eq('created_by', userId);

    if (error2) throw error2;

    // Combine results and remove duplicates
    const allProperties = [...(listingIdProps || []), ...(createdByProps || [])];
    const uniqueProperties = allProperties.filter((prop, index, self) => 
      index === self.findIndex(p => p.id === prop.id)
    );

    // Sort by date_posted
    uniqueProperties.sort((a, b) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime());

    return uniqueProperties.map(mapDbToProperty);
  } catch (error) {
    console.error('Error getting realtor properties:', error);
    throw error;
  }
}

export async function getFavoriteProperties(
  favoriteIds: string[],
  page: number = 0,
  limit: number = 6
): Promise<{ properties: Property[]; hasMore: boolean; total: number }> {
  try {
    if (favoriteIds.length === 0) {
      return { properties: [], hasMore: false, total: 0 };
    }

    // Calculate offset for pagination
    const offset = page * limit;

    // Get total count first
    const { count, error: countError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .in('id', favoriteIds);

    if (countError) throw countError;

    // Get paginated results
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', favoriteIds)
      .order('date_posted', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const properties = (data || []).map(mapDbToProperty);
    const total = count || 0;
    const hasMore = offset + limit < total;

    return {
      properties,
      hasMore,
      total
    };
  } catch (error) {
    console.error('Error getting favorite properties:', error);
    throw error;
  }
}

// Utility function to fix existing properties missing created_by field
export async function fixPropertiesOwnership(userId: string): Promise<number> {
  try {
    // First, get all properties that have owner_id matching userId but created_by is null
    const { data: orphanedProperties, error: selectError } = await supabase
      .from('properties')
      .select('id')
      .eq('owner_id', userId)
      .is('created_by', null);

    if (selectError) throw selectError;

    if (!orphanedProperties || orphanedProperties.length === 0) {
      return 0;
    }

    // Update those properties to set created_by = userId
    const propertyIds = orphanedProperties.map(p => p.id);
    const { data, error } = await supabase
      .from('properties')
      .update({ created_by: userId })
      .in('id', propertyIds)
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  } catch (error) {
    console.error('Error fixing properties ownership:', error);
    throw error;
  }
}

// Function to claim a specific property by ID
export async function claimSpecificProperty(userId: string, propertyId: string): Promise<boolean> {
  try {
    // Update the specific property to set both created_by and owner_id = userId
    const { data, error } = await supabase
      .from('properties')
      .update({ 
        created_by: userId,
        owner_id: userId 
      })
      .eq('id', propertyId)
      .select('id, title');

    if (error) throw error;
    
    console.log('Successfully claimed property:', data?.[0]);
    return data && data.length > 0;
  } catch (error) {
    console.error('Error claiming specific property:', error);
    throw error;
  }
}


