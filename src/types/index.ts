export interface Property {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  address: string;
  city: string;
  country: string;
  postalCode?: string; // Made optional
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  images: string[];
  description: string;
  type: 'koop' | 'huur';
  category: 'appartementen' | 'huizen' | 'vakantiewoningen' | 'nieuwbouw' | 'hotel' | 'resort';
  features: string[];
  datePosted: string;
  status: 'actief' | 'concept' | 'verkocht' | 'verhuurd' | 'ingetrokken';
  makelaarId?: string;
  featured: boolean;
  view_count?: number;
  last_viewed_at?: string;
  favorite_count?: number;
  listingId?: string;
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

export type UserRole = 'user' | 'realtor' | 'owner' | 'admin';

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
  category?: 'appartementen' | 'huizen' | 'vakantiewoningen' | 'nieuwbouw' | 'hotel' | 'resort';
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
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  message_type: 'inquiry' | 'viewing_request' | 'general';
  status: 'unread' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface SendMessageRequest {
  property_id: string;
  recipient_id: string;
  message: string;
  message_type: 'inquiry' | 'viewing_request' | 'general';
  subject?: string;
}

export interface MessageFilters {
  folder?: 'inbox' | 'sent' | 'all';
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
