import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tattoo, Artist } from './types';

interface AppState {
  tattoos: Tattoo[];
  artists: Artist[];
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addTattoo: (tattoo: Omit<Tattoo, 'id' | 'createdAt'>) => void;
  updateTattoo: (id: string, tattoo: Partial<Tattoo>) => void;
  deleteTattoo: (id: string) => void;
  archiveTattoo: (id: string) => void;
  addArtist: (artist: Omit<Artist, 'id' | 'createdAt'>) => void;
  updateArtist: (id: string, artist: Partial<Artist>) => void;
  deleteArtist: (id: string) => void;
}

const seedArtists: Artist[] = [
  {
    id: 'artist-1',
    name: 'Braian Otovicz',
    bio: '',
    photoUrl: '/braiansite.jpeg',
    specialties: [],
    instagram: undefined,
    createdAt: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'artist-2',
    name: 'Luii Tatto',
    bio: '',
    photoUrl: 'https://picsum.photos/seed/luii-tatto/400/400',
    specialties: [],
    instagram: undefined,
    createdAt: new Date('2025-01-02').toISOString(),
  },
  {
    id: 'artist-3',
    name: 'Douglas Tatto',
    bio: '',
    photoUrl: 'https://picsum.photos/seed/douglas-tatto/400/400',
    specialties: [],
    instagram: undefined,
    createdAt: new Date('2025-01-03').toISOString(),
  },
  {
    id: 'artist-4',
    name: 'Ana Biasi',
    bio: '',
    photoUrl: 'https://picsum.photos/seed/ana-biasi/400/400',
    specialties: [],
    instagram: undefined,
    createdAt: new Date('2025-01-04').toISOString(),
  },
  {
    id: 'artist-5',
    name: 'Jaum Tatto',
    bio: '',
    photoUrl: 'https://picsum.photos/seed/jaum-tatto/400/400',
    specialties: [],
    instagram: undefined,
    createdAt: new Date('2025-01-05').toISOString(),
  },
  {
    id: 'artist-6',
    name: 'Marlon Torture',
    bio: '',
    photoUrl: 'https://picsum.photos/seed/marlon-torture/400/400',
    specialties: [],
    instagram: undefined,
    createdAt: new Date('2025-01-06').toISOString(),
  },
];

const seedTattoos: Tattoo[] = [
  {
    id: 'tattoo-1',
    title: 'Leão Realista',
    description: 'Impressionante leão em realismo preto e cinza, com detalhes na juba e expressão feroz. Perfeito para quem busca força e majestade.',
    imageUrl: 'https://picsum.photos/seed/tattoo1/600/400',
    style: 'Realismo',
    price: 'R$ 1.200',
    artistId: null,
    status: 'available',
    createdAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: 'tattoo-2',
    title: 'Mandala Geométrica',
    description: 'Mandala elaborada com padrões geométricos precisos. Simboliza equilíbrio e harmonia, ideal para braço ou costas.',
    imageUrl: 'https://picsum.photos/seed/tattoo2/600/400',
    style: 'Geométrico',
    price: 'R$ 800',
    artistId: null,
    status: 'available',
    createdAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: 'tattoo-3',
    title: 'Flor de Cerejeira Aquarela',
    description: 'Delicadas flores de cerejeira em estilo aquarela com tons rosa e roxo. Uma peça feminina e artística.',
    imageUrl: 'https://picsum.photos/seed/tattoo3/600/400',
    style: 'Aquarela',
    price: 'R$ 950',
    artistId: null,
    status: 'available',
    createdAt: new Date('2024-02-05').toISOString(),
  },
  {
    id: 'tattoo-4',
    title: 'Âncora Old School',
    description: 'Âncora clássica no estilo old school americano com rosas e fita. Tradição e estilo em uma só peça.',
    imageUrl: 'https://picsum.photos/seed/tattoo4/600/400',
    style: 'Old School',
    price: 'R$ 600',
    artistId: null,
    status: 'available',
    createdAt: new Date('2024-02-15').toISOString(),
  },
  {
    id: 'tattoo-5',
    title: 'Serpente Blackwork',
    description: 'Cobra enrolada em estilo blackwork com padrões tribais. Design impactante e atemporal.',
    imageUrl: 'https://picsum.photos/seed/tattoo5/600/400',
    style: 'Blackwork',
    price: 'R$ 750',
    artistId: null,
    status: 'available',
    createdAt: new Date('2024-03-01').toISOString(),
  },
  {
    id: 'tattoo-6',
    title: 'Lobo Tribal',
    description: 'Lobo majestuoso em estilo tribal com linhas fortes e contrastantes. Representa lealdade e espírito livre.',
    imageUrl: 'https://picsum.photos/seed/tattoo6/600/400',
    style: 'Tribal',
    price: 'R$ 900',
    artistId: null,
    status: 'available',
    createdAt: new Date('2024-03-10').toISOString(),
  },
  {
    id: 'tattoo-7',
    title: 'Retrato Realista',
    description: 'Retrato hiper-realista em preto e cinza. Técnica avançada de sombreamento para máximo realismo.',
    imageUrl: 'https://picsum.photos/seed/tattoo7/600/400',
    style: 'Realismo',
    price: 'R$ 1.800',
    artistId: null,
    status: 'available',
    createdAt: new Date('2024-03-20').toISOString(),
  },
  {
    id: 'tattoo-8',
    title: 'Pássaro Minimalista',
    description: 'Pássaro em voo com design minimalista e linhas finas. Elegante e discreto, perfeito para qualquer parte do corpo.',
    imageUrl: 'https://picsum.photos/seed/tattoo8/600/400',
    style: 'Minimalista',
    price: 'R$ 400',
    artistId: null,
    status: 'available',
    createdAt: new Date('2024-04-01').toISOString(),
  },
  {
    id: 'tattoo-9',
    title: 'Crânio Neo-Tradicional',
    description: 'Crânio decorado com flores e padrões neo-tradicionais. Cores vibrantes e linhas marcadas.',
    imageUrl: 'https://picsum.photos/seed/tattoo9/600/400',
    style: 'Neo-Tradicional',
    price: 'R$ 1.100',
    artistId: null,
    status: 'archived',
    createdAt: new Date('2023-11-15').toISOString(),
  },
  {
    id: 'tattoo-10',
    title: 'Rosa Aquarela',
    description: 'Rosa em aquarela com degradê de cores quentes. Uma declaração de amor à arte e à natureza.',
    imageUrl: 'https://picsum.photos/seed/tattoo10/600/400',
    style: 'Aquarela',
    price: 'R$ 700',
    artistId: null,
    status: 'archived',
    createdAt: new Date('2023-12-01').toISOString(),
  },
  {
    id: 'tattoo-11',
    title: 'Dragão Oriental',
    description: 'Dragão oriental em blackwork cobrindo o braço inteiro. Peça de sleeve impressionante e detalhada.',
    imageUrl: 'https://picsum.photos/seed/tattoo11/600/400',
    style: 'Blackwork',
    price: 'R$ 2.500',
    artistId: null,
    status: 'available',
    createdAt: new Date('2024-04-10').toISOString(),
  },
  {
    id: 'tattoo-12',
    title: 'Bússola Geométrica',
    description: 'Bússola com design geométrico e detalhes intrincados. Símbolo de orientação e aventura.',
    imageUrl: 'https://picsum.photos/seed/tattoo12/600/400',
    style: 'Geométrico',
    price: 'R$ 650',
    artistId: null,
    status: 'archived',
    createdAt: new Date('2023-10-20').toISOString(),
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tattoos: seedTattoos,
      artists: seedArtists,
      isAdmin: false,

      login: (username: string, password: string) => {
        if (username === 'admin' && password === 'tatto123') {
          set({ isAdmin: true });
          return true;
        }
        return false;
      },

      logout: () => set({ isAdmin: false }),

      addTattoo: (tattooData) => {
        const tattoo: Tattoo = {
          ...tattooData,
          id: `tattoo-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tattoos: [...state.tattoos, tattoo] }));
      },

      updateTattoo: (id, updates) => {
        set((state) => ({
          tattoos: state.tattoos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTattoo: (id) => {
        set((state) => ({ tattoos: state.tattoos.filter((t) => t.id !== id) }));
      },

      archiveTattoo: (id) => {
        const tattoo = get().tattoos.find((t) => t.id === id);
        if (tattoo) {
          const newStatus = tattoo.status === 'available' ? 'archived' : 'available';
          set((state) => ({
            tattoos: state.tattoos.map((t) =>
              t.id === id ? { ...t, status: newStatus } : t
            ),
          }));
        }
      },

      addArtist: (artistData) => {
        const artist: Artist = {
          ...artistData,
          id: `artist-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ artists: [...state.artists, artist] }));
      },

      updateArtist: (id, updates) => {
        set((state) => ({
          artists: state.artists.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      },

      deleteArtist: (id) => {
        set((state) => ({ artists: state.artists.filter((a) => a.id !== id) }));
      },
    }),
    {
      name: 'tattoo-shop-storage-v2',
    }
  )
);
