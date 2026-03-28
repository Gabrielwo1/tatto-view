export interface Tattoo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  style: string;
  price?: string;
  depositAmount?: number; // valor do sinal em centavos (ex: 5000 = R$50)
  artistId: string | null;
  status: 'available' | 'archived';
  createdAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
}

export interface WishlistItem {
  id: string;
  itemType: 'tattoo' | 'merch';
  itemId: string;
}

export interface CartItem {
  id: string;
  itemType: 'tattoo' | 'merch';
  itemId: string;
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

export interface TatuadoPost {
  id: string;
  imageUrl: string;
  caption: string;
  artistId: string | null;
  size: 'small' | 'medium' | 'large'; // controls mosaic cell size
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

export interface ShopContent {
  hero: {
    title: string;
    subtitle: string;
  };
  sessionsTagline: string;
  sessionsAvailableLabel: string;
  apparelTagline: string;
  paymentMethods: Array<{ label: string; sub: string }>;
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
