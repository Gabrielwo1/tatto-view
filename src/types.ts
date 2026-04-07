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
  preferredContactMethod?: 'whatsapp' | 'instagram';
  createdAt: string;
  hiddenFromHero?: boolean;
}

export interface Merch {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  link?: string;
  sizes?: string[];
  category?: 'prints' | 'vestuario' | 'acessorios';
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
  preferred_contact_method?: 'whatsapp' | 'instagram' | null;
  created_at: string;
  hidden_from_hero: boolean | null;
}

export interface MerchRow {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  link: string | null;
  sizes: string[] | null;
  category: string | null;
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

// ── Financeiro ────────────────────────────────────────────────────────────────
export const EXPENSE_CATEGORIES = [
  'Studio',
  'Material',
  'Alimentação',
  'Marketing',
  'Equipamento',
  'Aluguel',
  'Salário',
  'Outros',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface Expense {
  id: string;
  description: string;
  amount: number;       // in BRL cents (e.g. 24838 = R$248,38)
  paidBy: string;       // artist id
  date: string;         // ISO date string YYYY-MM-DD
  category: ExpenseCategory;
  participants: string[]; // array of artist ids who share this expense
  createdAt: string;
  receiptUrl?: string;  // optional receipt image URL
}
