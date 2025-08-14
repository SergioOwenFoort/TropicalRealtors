export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          avatar_url: string | null
          role: 'user' | 'realtor' | 'owner' | 'admin'
          created_at: string
          updated_at: string | null
          favorites: string[]
        }
        Insert: {
          id: string
          email: string
          display_name: string
          avatar_url?: string | null
          role?: 'user' | 'realtor' | 'owner' | 'admin'
          created_at?: string
          updated_at?: string | null
          favorites?: string[]
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          avatar_url?: string | null
          role?: 'user' | 'realtor' | 'owner' | 'admin'
          created_at?: string
          updated_at?: string | null
          favorites?: string[]
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          address: string
          city: string
          country: string
          postal_code: string
          bedrooms: number
          bathrooms: number
          square_meters: number
          property_type: 'koop' | 'huur'
          category: 'appartementen' | 'huizen' | 'vakantiewoningen' | 'nieuwbouw' | 'hotel' | 'resort'
          features: string[]
          images: string[]
          status: 'actief' | 'concept' | 'verkocht' | 'verhuurd' | 'ingetrokken'
          owner_id: string
          created_by: string
          date_posted: string
          featured: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          address: string
          city: string
          country: string
          postal_code: string
          bedrooms: number
          bathrooms: number
          square_meters: number
          property_type: 'koop' | 'huur'
          category: 'appartementen' | 'huizen' | 'vakantiewoningen' | 'nieuwbouw' | 'hotel' | 'resort'
          features: string[]
          images: string[]
          status?: 'actief' | 'concept' | 'verkocht' | 'verhuurd' | 'ingetrokken'
          owner_id: string
          created_by: string
          date_posted?: string
          featured?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          address?: string
          city?: string
          country?: string
          postal_code?: string
          bedrooms?: number
          bathrooms?: number
          square_meters?: number
          property_type?: 'koop' | 'huur'
          category?: 'appartementen' | 'huizen' | 'vakantiewoningen' | 'nieuwbouw' | 'hotel' | 'resort'
          features?: string[]
          images?: string[]
          status?: 'actief' | 'concept' | 'verkocht' | 'verhuurd' | 'ingetrokken'
          owner_id?: string
          created_by?: string
          date_posted?: string
          featured?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      realtors: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          specialization: string
          bio: string
          image_url: string
          company_name: string
          rating: number | null
          languages: string[]
          location: string
          island: 'bonaire' | 'aruba' | 'curacao'
          user_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          specialization: string
          bio: string
          image_url: string
          company_name: string
          rating?: number | null
          languages?: string[]
          location: string
          island: 'bonaire' | 'aruba' | 'curacao'
          user_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          specialization?: string
          bio?: string
          image_url?: string
          company_name?: string
          rating?: number | null
          languages?: string[]
          location?: string
          island?: 'bonaire' | 'aruba' | 'curacao'
          user_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
    }
  }
}
