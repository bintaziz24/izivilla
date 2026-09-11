export interface PropertyImage {
  id?: number;
  property_id?: number;
  image_url: string;
  is_primary: boolean;
}

export interface Agency {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  phone_whatsapp: string;
  email: string;
  city: string;
  address?: string;
  description?: string;
  website?: string;
  creation_year?: number;
  is_verified: boolean;
  active_listings_count: number;
  subscription_tier?: string;
}

export interface UserAdvertiser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'agency' | 'client' | 'admin';
  user_type: 'owner' | 'agency';
  is_verified: boolean;
  avatar_url?: string;
  listings_count?: number;
  created_at?: string;
}

export interface Property {
  id: number;
  agency_profile_id?: number;
  title: string;
  slug?: string;
  description: string;
  property_type: 'Maison' | 'Appartement' | 'Villa' | 'Terrain' | 'Studio' | 'Chambre' | 'Immeuble' | 'Local commercial' | 'Bureau' | 'Boutique' | 'Entrepôt' | 'Autre' | string;
  transaction_type: 'sale' | 'rent' | 'Vente' | 'Location';
  price_fcfa: number;
  charges_included: boolean;
  region?: string;
  city: string;
  quartier: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  surface_sqm?: number;
  is_furnished: boolean;
  has_air_con: boolean;
  has_generator: boolean;
  has_security: boolean;
  has_parking: boolean;
  has_pool: boolean;
  equipments?: string[];
  latitude: number;
  longitude: number;
  status: 'available' | 'sold' | 'rented' | 'pending';
  is_featured?: boolean;
  is_boosted?: boolean;
  boosted_until?: string;
  views_count: number;

  // Direct Advertiser details (Core Izivilla Value)
  owner_type: 'owner' | 'agency' | 'Propriétaire' | 'Agence';
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  owner_avatar?: string;
  is_verified: boolean;

  contact_phone?: string;
  contact_whatsapp?: string;
  created_at?: string;
  agency?: Agency;
  images?: PropertyImage[];
}

export interface PropertyFilter {
  transaction_type?: string;
  city?: string;
  region?: string;
  quartier?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_surface?: number;
  is_furnished?: boolean;
  advertiser_type?: 'all' | 'owner' | 'agency';
  verified_only?: boolean;
  sort?: string;
}

export interface PropertyAlert {
  id?: number;
  user_email: string;
  city?: string;
  quartier?: string;
  property_type?: string;
  max_price?: number;
  is_furnished?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface AppointmentRequest {
  id?: number;
  property_id: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  preferred_date: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
  property?: Property;
}

export interface DirectMessage {
  id: number;
  property_id: number;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  receiver_name?: string;
  message: string;
  created_at: string;
  property_title?: string;
}

export interface PropertyReport {
  id?: number;
  property_id: number;
  reporter_name?: string;
  reporter_email: string;
  reason: 'Annonce frauduleuse' | 'Prix incorrect' | 'Bien déjà vendu' | 'Informations incorrectes' | 'Contenu inapproprié' | 'Autre' | string;
  description?: string;
  details?: string;
  status?: 'pending' | 'resolved';
  created_at?: string;
}

export interface VerificationRequest {
  id: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  user_type?: 'owner' | 'agency';
  owner_type?: 'owner' | 'agency' | string;
  owner_name?: string;
  owner_email?: string;
  document_type?: string;
  document_number?: string;
  document_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at?: string;
  created_at?: string;
}



