export interface Property {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  address: string;
  city: string;
  country: string;
  phone_number?: string;
  postalCode?: string; // Made optional
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  images: string[];
  description: string;
  type: 'koop' | 'huur';
  category: 'appartementen' | 'huizen' | 'nieuwbouw' | 'winkel' | 'kantoor' | 'werkplaats';
  features: string[];
  datePosted: string;
  status: 'actief' | 'concept' | 'verkocht' | 'verhuurd' | 'ingetrokken';
  makelaarId?: string;
  featured: boolean;
  view_count?: number;
  last_viewed_at?: string;
  favorite_count?: number;
  listingId?: string;
  created_by_role?: 'owner' | 'realtor' | 'horo' | 'admin';
}

export interface VacationProperty {
  id: string;
  name: string;
  price: number;
  address: string;
  city: string;
  country: string;
  phone_number?: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  images: string[];
  description: string;
  property_type: 'vacation_villa' | 'vacation_apartment' | 'vacation_resort' | 'vacation_hotel' | 'vacation_studio' | 'vacation_penthouse';
  amenities: string[];
  features: string[];
  rating: number;
  distance_from_center: number;
  featured: boolean;
  check_in_time: string;
  check_out_time: string;
  minimum_stay: number;
  maximum_stay: number;
  cancellation_policy: string;
  house_rules: string[];
  instant_booking: boolean;
  status: 'available' | 'booked' | 'maintenance' | 'inactive';
  island: string;
  horo_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  favorites: string[];
}

export interface CarouselSlide {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  external_link?: string; // Keep as external_link since that's what DB has
  island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius';
  is_active: boolean;
  display_order: number;
  period_number?: number;
  year: number;
  always_visible: boolean;
  click_count?: number;
  last_clicked_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CarouselSlideInput {
  title?: string;
  description?: string;
  image_url: string;
  external_link?: string; // Keep as external_link
  island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten';
  is_active?: boolean;
  display_order?: number;
  period_number?: number;
  year?: number;
  always_visible?: boolean;
  created_by?: string;
}

export type UserRole = 'user' | 'realtor' | 'horo' | 'owner' | 'admin';

export interface ApiResponse {
  success: boolean;
  results?: {
    added: number;
    duplicates: number;
    errors: number;
    details: string[];
  };
  error?: string;
}

export interface PropertyFilters {
  type?: 'koop' | 'huur';
  category?: 'appartementen' | 'huizen' | 'nieuwbouw' | 'winkel' | 'kantoor' | 'werkplaats';
  country?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minSize?: number;
}

// Message types for the messaging system
export interface Message {
  id: string;
  property_id: string;
  property_title?: string;
  sender_id: string;
  recipient_id: string;
  sender_name?: string;
  sender_email?: string;
  recipient_name?: string;
  recipient_email?: string;
  subject: string;
  message: string;
  message_type: 'inquiry' | 'viewing_request' | 'general';
  status: 'unread' | 'read' | 'replied' | 'archived';
  viewing_date?: string;
  viewing_time?: string;
  viewing_notes?: string;
  contact_info?: any;
  created_at: string;
  updated_at: string;
  read_at?: string;
  replied_at?: string;
}

export interface SendMessageRequest {
  property_id: string;
  recipient_id: string;
  message: string;
  message_type: 'inquiry' | 'viewing_request' | 'general';
  subject?: string;
  viewing_date?: string;
  viewing_time?: string;
  viewing_notes?: string;
}

export interface MessageFilters {
  folder?: 'inbox' | 'sent' | 'all' | 'archived';
  status?: 'unread' | 'read' | 'replied' | 'archived';
  message_type?: 'inquiry' | 'viewing_request' | 'general';
}

export interface MessageStats {
  total: number;
  unread: number;
  archived: number;
}

// Re-export the Realtor interface
export type { Realtor, RealtorUpload } from './realtor';
