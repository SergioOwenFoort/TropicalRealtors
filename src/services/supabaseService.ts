import { supabase as supabaseClient } from '../config/supabase.config';
import { Property, Realtor, RealtorUpload } from '../types';
import type { Database } from '../types/database.types';

// Export supabase client directly for components that need it
export const supabase = supabaseClient;

type DbProperty = Database['public']['Tables']['properties']['Row'];
type InsertProperty = Database['public']['Tables']['properties']['Insert'];
type UpdateProperty = Database['public']['Tables']['properties']['Update'];

type DbRealtor = Database['public']['Tables']['realtors']['Row'];
type InsertRealtor = Database['public']['Tables']['realtors']['Insert'];
type UpdateRealtor = Database['public']['Tables']['realtors']['Update'];

export class SupabaseService {
  private static instance: SupabaseService;

  private constructor() {}

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // Property CRUD operations
  async addProperty(property: Omit<Property, 'id'>): Promise<Property> {
    const propertyData: InsertProperty = {
      title: property.title,
      description: property.description,
      price: property.price,
      address: property.address,
      city: property.city,
      country: property.country,
      postal_code: property.postalCode,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      square_meters: property.size,
      property_type: property.type,
      category: property.category,
      features: property.features,
      images: property.images,
      status: property.status,
      owner_id: property.makelaarId,
      created_by: property.makelaarId,
      featured: property.featured,
      date_posted: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single();

    if (error) {
      console.error('Error adding property:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create property');
    }

    return this.mapDbPropertyToProperty(data);
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<boolean> {
    const updateData: UpdateProperty = {
      ...(updates.title && { title: updates.title }),
      ...(updates.description && { description: updates.description }),
      ...(updates.price && { price: updates.price }),
      ...(updates.address && { address: updates.address }),
      ...(updates.city && { city: updates.city }),
      ...(updates.country && { country: updates.country }),
      ...(updates.postalCode && { postal_code: updates.postalCode }),
      ...(updates.bedrooms && { bedrooms: updates.bedrooms }),
      ...(updates.bathrooms && { bathrooms: updates.bathrooms }),
      ...(updates.size && { square_meters: updates.size }),
      ...(updates.type && { property_type: updates.type }),
      ...(updates.category && { category: updates.category }),
      ...(updates.features && { features: updates.features }),
      ...(updates.images && { images: updates.images }),
      ...(updates.status && { status: updates.status }),
      ...(updates.featured !== undefined && { featured: updates.featured }),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating property:', error);
      throw error;
    }

    return true;
  }

  async deleteProperty(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting property:', error);
      throw error;
    }

    return true;
  }

  async getPropertyById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error getting property:', error);
      throw error;
    }

    return data ? this.mapDbPropertyToProperty(data) : null;
  }

  async getProperties(options: {
    limit?: number;
    featured?: boolean;
    userId?: string;
    orderBy?: { column: keyof DbProperty; ascending?: boolean };
  } = {}): Promise<Property[]> {
    console.log('Fetching properties with options:', options);

    try {
      let query = supabase.from('properties').select('*');

      if (options.featured !== undefined) {
        query = query.eq('featured', options.featured);
      }

      if (options.userId) {
        query = query.eq('created_by', options.userId);
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false
        });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      console.log('Fetched properties:', data);
      console.log('Error if any:', error);

      if (error) {
        console.error('Error getting properties:', error);
        throw error;
      }

      return (data || []).map(this.mapDbPropertyToProperty);
    } catch (error) {
      console.error('Error in getProperties:', error);
      throw error;
    }
  }

  // Realtor CRUD operations
  async addRealtor(realtor: RealtorUpload, userId?: string): Promise<Realtor> {
    // Get current user if no userId provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || undefined;
    }

    const realtorData: InsertRealtor = {
      name: realtor.name,
      email: realtor.email,
      phone: realtor.phone,
      specialization: realtor.specialization,
      bio: realtor.bio,
      image_url: realtor.image_url,
      company_name: realtor.companyName,
      rating: realtor.rating || null,
      languages: realtor.languages || [],
      location: realtor.location,
      island: realtor.island,
      user_id: userId,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('realtors')
      .insert([realtorData])
      .select()
      .single();

    if (error) {
      console.error('Error adding realtor:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create realtor');
    }

    return this.mapDbRealtorToRealtor(data);
  }

  async updateRealtor(id: string, updates: Partial<Realtor>): Promise<boolean> {
    const updateData: UpdateRealtor = {
      ...(updates.name && { name: updates.name }),
      ...(updates.email && { email: updates.email }),
      ...(updates.phone && { phone: updates.phone }),
      ...(updates.specialization && { specialization: updates.specialization }),
      ...(updates.bio && { bio: updates.bio }),
      ...(updates.image_url && { image_url: updates.image_url }),
      ...(updates.companyName && { company_name: updates.companyName }),
      ...(updates.rating !== undefined && { rating: updates.rating }),
      ...(updates.languages && { languages: updates.languages }),
      ...(updates.location && { location: updates.location }),
      ...(updates.island && { island: updates.island }),
      ...(updates.userId && { user_id: updates.userId }),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('realtors')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating realtor:', error);
      throw error;
    }

    return true;
  }

  async deleteRealtor(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('realtors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting realtor:', error);
      // Provide more specific error information
      if (error.code === '42501') {
        throw new Error('Permission denied: Only admins can delete realtors');
      }
      throw error;
    }

    return true;
  }

  async getRealtorById(id: string): Promise<Realtor | null> {
    const { data, error } = await supabase
      .from('realtors')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error getting realtor:', error);
      throw error;
    }

    return data ? this.mapDbRealtorToRealtor(data) : null;
  }

  async getRealtorsCount(options: {
    island?: 'bonaire' | 'aruba' | 'curacao';
    userId?: string;
  } = {}): Promise<number> {
    try {
      let query = supabase.from('realtors').select('*', { count: 'exact', head: true });

      if (options.island) {
        query = query.eq('island', options.island);
      }

      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error counting realtors:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getRealtorsCount:', error);
      throw error;
    }
  }

  async getRealtors(options: {
    island?: 'bonaire' | 'aruba' | 'curacao';
    userId?: string;
    limit?: number;
    page?: number;
    orderBy?: { column: keyof DbRealtor; ascending?: boolean };
  } = {}): Promise<Realtor[]> {
    try {
      let query = supabase.from('realtors').select('*');

      if (options.island) {
        query = query.eq('island', options.island);
      }

      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        });
      } else {
        // Default ordering by name
        query = query.order('name');
      }

      if (options.limit) {
        // Calculate range based on page and limit for pagination
        if (options.page && options.page > 1) {
          const start = (options.page - 1) * options.limit;
          const end = start + options.limit - 1;
          query = query.range(start, end);
        } else {
          query = query.limit(options.limit);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting realtors:', error);
        throw error;
      }

      return (data || []).map(this.mapDbRealtorToRealtor);
    } catch (error) {
      console.error('Error in getRealtors:', error);
      throw error;
    }
  }

  // Profile operations
  async getProfile(userId: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return profile;
  }
  async updateProfile(userId: string, updates: Database['public']['Tables']['profiles']['Update']) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  }

  // User/Profile management operations
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          display_name,
          role,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      // First delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw profileError;
      }

      // Note: In a production environment, you might also want to delete the user from auth.users
      // This requires admin privileges and should be done server-side
      // For now, we just delete from profiles which will make the user inaccessible
      
      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      throw error;
    }
  }

  private mapDbRealtorToRealtor(dbRealtor: DbRealtor): Realtor {
    return {
      id: dbRealtor.id,
      name: dbRealtor.name,
      email: dbRealtor.email,
      phone: dbRealtor.phone,
      specialization: dbRealtor.specialization,
      bio: dbRealtor.bio,
      image_url: dbRealtor.image_url,
      companyName: dbRealtor.company_name || '',
      rating: dbRealtor.rating || undefined,
      languages: dbRealtor.languages,
      location: dbRealtor.location,
      island: dbRealtor.island,
      userId: dbRealtor.user_id || undefined
    };
  }
  
  private mapDbPropertyToProperty(dbProperty: DbProperty): Property {
    return {
      id: dbProperty.id,
      title: dbProperty.title,
      description: dbProperty.description,
      price: dbProperty.price,
      address: dbProperty.address,
      city: dbProperty.city,
      country: dbProperty.country,
      postalCode: dbProperty.postal_code,
      bedrooms: dbProperty.bedrooms,
      bathrooms: dbProperty.bathrooms,
      size: dbProperty.square_meters,
      type: dbProperty.property_type,
      category: dbProperty.category,
      features: dbProperty.features,
      images: dbProperty.images,
      status: dbProperty.status,
      makelaarId: dbProperty.owner_id,
      featured: dbProperty.featured || false,
      datePosted: dbProperty.date_posted || new Date().toISOString()
    };
  }
}

export const supabaseService = SupabaseService.getInstance();
