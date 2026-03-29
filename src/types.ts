export interface Tattoo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  style: string;
  price?: string;
  artistId: string | null;
  status: 'available' | 'archived';
  createdAt: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  photoUrl: string;
  specialties: string[];
  instagram?: string;
  whatsapp?: string;
  createdAt: string;
}

export interface Merch {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  link?: string;
  sizes?: string[];
  createdAt: string;
}

export interface TattooSession {
  id: string;
  typeNum: string;
  title: string;
  description: string;
  price: string;
  bookingLink: string;
}

// Supabase DB row shapes (snake_case) — used in store converters
export interface TattooRow {
  id: string;
  title: string;
  description: string;
  image_url: string;
  style: string;
  price: string | null;
  artist_id: string | null;
  status: 'available' | 'archived';
  created_at: string;
}

export interface ArtistRow {
  id: string;
  name: string;
  bio: string | null;
  photo_url: string;
  specialties: string[] | null;
  instagram: string | null;
  whatsapp: string | null;
  created_at: string;
}

export interface MerchRow {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  link: string | null;
  created_at: string;
}

export const TATTOO_STYLES = [
  'Realismo',
  'Blackwork',
  'Aquarela',
  'Geométrico',
  'Old School',
  'Tribal',
  'Tradicional',
  'Neo-Tradicional',
  'Minimalista',
];
