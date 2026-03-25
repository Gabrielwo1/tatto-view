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
