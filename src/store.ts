import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tattoo, Artist, Merch } from './types';
import { supabase } from './lib/supabase';

// ── Row → App type converters (snake_case → camelCase) ──────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTattoo(r: any): Tattoo {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    imageUrl: r.image_url,
    style: r.style,
    price: r.price ?? '',
    artistId: r.artist_id ?? null,
    status: r.status,
    createdAt: r.created_at,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toArtist(r: any): Artist {
  return {
    id: r.id,
    name: r.name,
    bio: r.bio ?? '',
    photoUrl: r.photo_url,
    specialties: r.specialties ?? [],
    instagram: r.instagram ?? undefined,
    whatsapp: r.whatsapp ?? undefined,
    createdAt: r.created_at,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMerch(r: any): Merch {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    imageUrl: r.image_url,
    link: r.link ?? undefined,
    createdAt: r.created_at,
  };
}

// ── Seed data (used as fallback when Supabase is not configured) ─────────────
const seedArtists: Artist[] = [
  { id: 'artist-1', name: 'Braian Otovicz',     bio: '', photoUrl: '/braiansite.jpeg',  specialties: [], createdAt: new Date('2025-01-01').toISOString() },
  { id: 'artist-2', name: 'Luiz Balestro',      bio: '', photoUrl: '/luiisite.jpeg',    specialties: [], createdAt: new Date('2025-01-02').toISOString() },
  { id: 'artist-3', name: 'Matheus de Oliveira',bio: '', photoUrl: '/douglastatt.jpeg', specialties: [], createdAt: new Date('2025-01-03').toISOString() },
  { id: 'artist-4', name: 'Ana Biasi',           bio: '', photoUrl: 'https://picsum.photos/seed/ana-biasi/400/400', specialties: [], createdAt: new Date('2025-01-04').toISOString() },
  { id: 'artist-5', name: 'João Vitor',          bio: '', photoUrl: 'https://raw.githubusercontent.com/Gabrielwo1/tatto-view/claude/tattoo-shop-app-AunfI/public/jaummmm.jpeg', specialties: [], createdAt: new Date('2025-01-05').toISOString() },
  { id: 'artist-6', name: 'Marlon Torture',      bio: '', photoUrl: 'https://picsum.photos/seed/marlon-torture/400/400', specialties: [], createdAt: new Date('2025-01-06').toISOString() },
];

const seedTattoos: Tattoo[] = [
  { id: 'tattoo-1',  title: 'Leão Realista',           description: 'Impressionante leão em realismo preto e cinza.', imageUrl: 'https://picsum.photos/seed/tattoo1/600/400',  style: 'Realismo',       price: 'R$ 1.200', artistId: null, status: 'available', createdAt: new Date('2024-01-10').toISOString() },
  { id: 'tattoo-2',  title: 'Mandala Geométrica',       description: 'Mandala elaborada com padrões geométricos precisos.', imageUrl: 'https://picsum.photos/seed/tattoo2/600/400',  style: 'Geométrico',     price: 'R$ 800',   artistId: null, status: 'available', createdAt: new Date('2024-01-20').toISOString() },
  { id: 'tattoo-3',  title: 'Flor de Cerejeira',        description: 'Delicadas flores de cerejeira em estilo aquarela.', imageUrl: 'https://picsum.photos/seed/tattoo3/600/400',  style: 'Aquarela',       price: 'R$ 950',   artistId: null, status: 'available', createdAt: new Date('2024-02-05').toISOString() },
  { id: 'tattoo-4',  title: 'Âncora Old School',        description: 'Âncora clássica no estilo old school americano.', imageUrl: 'https://picsum.photos/seed/tattoo4/600/400',  style: 'Old School',     price: 'R$ 600',   artistId: null, status: 'available', createdAt: new Date('2024-02-15').toISOString() },
  { id: 'tattoo-5',  title: 'Serpente Blackwork',       description: 'Cobra enrolada em estilo blackwork com padrões tribais.', imageUrl: 'https://picsum.photos/seed/tattoo5/600/400',  style: 'Blackwork',      price: 'R$ 750',   artistId: null, status: 'available', createdAt: new Date('2024-03-01').toISOString() },
  { id: 'tattoo-6',  title: 'Lobo Tribal',              description: 'Lobo majestuoso em estilo tribal com linhas fortes.', imageUrl: 'https://picsum.photos/seed/tattoo6/600/400',  style: 'Tribal',         price: 'R$ 900',   artistId: null, status: 'available', createdAt: new Date('2024-03-10').toISOString() },
  { id: 'tattoo-7',  title: 'Retrato Realista',         description: 'Retrato hiper-realista em preto e cinza.', imageUrl: 'https://picsum.photos/seed/tattoo7/600/400',  style: 'Realismo',       price: 'R$ 1.800', artistId: null, status: 'available', createdAt: new Date('2024-03-20').toISOString() },
  { id: 'tattoo-8',  title: 'Pássaro Minimalista',      description: 'Pássaro em voo com design minimalista e linhas finas.', imageUrl: 'https://picsum.photos/seed/tattoo8/600/400',  style: 'Minimalista',    price: 'R$ 400',   artistId: null, status: 'available', createdAt: new Date('2024-04-01').toISOString() },
  { id: 'tattoo-9',  title: 'Crânio Neo-Tradicional',   description: 'Crânio decorado com flores e padrões neo-tradicionais.', imageUrl: 'https://picsum.photos/seed/tattoo9/600/400',  style: 'Neo-Tradicional',price: 'R$ 1.100', artistId: null, status: 'archived',  createdAt: new Date('2023-11-15').toISOString() },
  { id: 'tattoo-10', title: 'Rosa Aquarela',            description: 'Rosa em aquarela com degradê de cores quentes.', imageUrl: 'https://picsum.photos/seed/tattoo10/600/400', style: 'Aquarela',       price: 'R$ 700',   artistId: null, status: 'archived',  createdAt: new Date('2023-12-01').toISOString() },
  { id: 'tattoo-11', title: 'Dragão Oriental',          description: 'Dragão oriental em blackwork cobrindo o braço inteiro.', imageUrl: 'https://picsum.photos/seed/tattoo11/600/400', style: 'Blackwork',      price: 'R$ 2.500', artistId: null, status: 'available', createdAt: new Date('2024-04-10').toISOString() },
  { id: 'tattoo-12', title: 'Bússola Geométrica',       description: 'Bússola com design geométrico e detalhes intrincados.', imageUrl: 'https://picsum.photos/seed/tattoo12/600/400', style: 'Geométrico',     price: 'R$ 650',   artistId: null, status: 'archived',  createdAt: new Date('2023-10-20').toISOString() },
];

// ── Store interface ──────────────────────────────────────────────────────────
interface AppState {
  tattoos: Tattoo[];
  artists: Artist[];
  merchs: Merch[];
  isAdmin: boolean;
  /** True once Supabase data has been loaded (or if Supabase is not configured). */
  dataLoaded: boolean;
  loadData: () => Promise<void>;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addTattoo: (tattoo: Omit<Tattoo, 'id' | 'createdAt'>) => void;
  updateTattoo: (id: string, updates: Partial<Tattoo>) => void;
  deleteTattoo: (id: string) => void;
  archiveTattoo: (id: string) => void;
  reorderTattoos: (orderedIds: string[]) => void;
  addArtist: (artist: Omit<Artist, 'id' | 'createdAt'>) => void;
  updateArtist: (id: string, updates: Partial<Artist>) => void;
  deleteArtist: (id: string) => void;
  addMerch: (merch: Omit<Merch, 'id' | 'createdAt'>) => void;
  updateMerch: (id: string, updates: Partial<Merch>) => void;
  deleteMerch: (id: string) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tattoos: seedTattoos,
      artists: seedArtists,
      merchs: [],
      isAdmin: false,
      dataLoaded: false,

      // ── Load from Supabase ───────────────────────────────────────────────
      loadData: async () => {
        if (!supabase) {
          set({ dataLoaded: true });
          return;
        }
        try {
          const [{ data: t, error: te }, { data: a, error: ae }, { data: m, error: me }] =
            await Promise.all([
              supabase.from('tattoos').select('*').order('created_at', { ascending: false }),
              supabase.from('artists').select('*').order('created_at', { ascending: true }),
              supabase.from('merchs').select('*').order('created_at', { ascending: false }),
            ]);
          if (te) throw te;
          if (ae) throw ae;
          if (me) throw me;
          set({
            tattoos: (t ?? []).map(toTattoo),
            artists: (a ?? []).map(toArtist),
            merchs: (m ?? []).map(toMerch),
            dataLoaded: true,
          });
        } catch (err) {
          console.error('[store] Supabase loadData failed, using cached data:', err);
          set({ dataLoaded: true });
        }
      },

      // ── Auth ─────────────────────────────────────────────────────────────
      login: (username, password) => {
        if (username === 'admin' && password === 'tatto123') {
          set({ isAdmin: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAdmin: false }),

      // ── Tattoos ──────────────────────────────────────────────────────────
      addTattoo: (data) => {
        const tattoo: Tattoo = { ...data, id: `tattoo-${Date.now()}`, createdAt: new Date().toISOString() };
        set((s) => ({ tattoos: [tattoo, ...s.tattoos] }));
        supabase?.from('tattoos').insert({
          id: tattoo.id, title: tattoo.title, description: tattoo.description,
          image_url: tattoo.imageUrl, style: tattoo.style, price: tattoo.price,
          artist_id: tattoo.artistId, status: tattoo.status, created_at: tattoo.createdAt,
        }).then(({ error }) => { if (error) console.error('[store] addTattoo:', error); });
      },

      updateTattoo: (id, updates) => {
        set((s) => ({ tattoos: s.tattoos.map((t) => t.id === id ? { ...t, ...updates } : t) }));
        const row: Record<string, unknown> = {};
        if (updates.title       !== undefined) row.title       = updates.title;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.imageUrl    !== undefined) row.image_url   = updates.imageUrl;
        if (updates.style       !== undefined) row.style       = updates.style;
        if (updates.price       !== undefined) row.price       = updates.price;
        if (updates.artistId    !== undefined) row.artist_id   = updates.artistId;
        if (updates.status      !== undefined) row.status      = updates.status;
        supabase?.from('tattoos').update(row).eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] updateTattoo:', error); });
      },

      deleteTattoo: (id) => {
        set((s) => ({ tattoos: s.tattoos.filter((t) => t.id !== id) }));
        supabase?.from('tattoos').delete().eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] deleteTattoo:', error); });
      },

      archiveTattoo: (id) => {
        const tattoo = get().tattoos.find((t) => t.id === id);
        if (!tattoo) return;
        const status = tattoo.status === 'available' ? 'archived' : 'available';
        set((s) => ({ tattoos: s.tattoos.map((t) => t.id === id ? { ...t, status } : t) }));
        supabase?.from('tattoos').update({ status }).eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] archiveTattoo:', error); });
      },

      reorderTattoos: (orderedIds) => {
        set((s) => {
          const map = new Map(s.tattoos.map((t) => [t.id, t]));
          const reordered = orderedIds.map((id) => map.get(id)).filter((t): t is Tattoo => !!t);
          const rest = s.tattoos.filter((t) => !orderedIds.includes(t.id));
          return { tattoos: [...reordered, ...rest] };
        });
      },

      // ── Artists ──────────────────────────────────────────────────────────
      addArtist: (data) => {
        const artist: Artist = { ...data, id: `artist-${Date.now()}`, createdAt: new Date().toISOString() };
        set((s) => ({ artists: [...s.artists, artist] }));
        supabase?.from('artists').insert({
          id: artist.id, name: artist.name, bio: artist.bio, photo_url: artist.photoUrl,
          specialties: artist.specialties, instagram: artist.instagram, whatsapp: artist.whatsapp,
          created_at: artist.createdAt,
        }).then(({ error }) => { if (error) console.error('[store] addArtist:', error); });
      },

      updateArtist: (id, updates) => {
        set((s) => ({ artists: s.artists.map((a) => a.id === id ? { ...a, ...updates } : a) }));
        const row: Record<string, unknown> = {};
        if (updates.name         !== undefined) row.name        = updates.name;
        if (updates.bio          !== undefined) row.bio         = updates.bio;
        if (updates.photoUrl     !== undefined) row.photo_url   = updates.photoUrl;
        if (updates.specialties  !== undefined) row.specialties = updates.specialties;
        if (updates.instagram    !== undefined) row.instagram   = updates.instagram;
        if (updates.whatsapp     !== undefined) row.whatsapp    = updates.whatsapp;
        supabase?.from('artists').update(row).eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] updateArtist:', error); });
      },

      deleteArtist: (id) => {
        set((s) => ({ artists: s.artists.filter((a) => a.id !== id) }));
        supabase?.from('artists').delete().eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] deleteArtist:', error); });
      },

      // ── Merchs ───────────────────────────────────────────────────────────
      addMerch: (data) => {
        const merch: Merch = { ...data, id: `merch-${Date.now()}`, createdAt: new Date().toISOString() };
        set((s) => ({ merchs: [merch, ...s.merchs] }));
        supabase?.from('merchs').insert({
          id: merch.id, name: merch.name, description: merch.description,
          price: merch.price, image_url: merch.imageUrl, link: merch.link,
          created_at: merch.createdAt,
        }).then(({ error }) => { if (error) console.error('[store] addMerch:', error); });
      },

      updateMerch: (id, updates) => {
        set((s) => ({ merchs: s.merchs.map((m) => m.id === id ? { ...m, ...updates } : m) }));
        const row: Record<string, unknown> = {};
        if (updates.name        !== undefined) row.name        = updates.name;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.price       !== undefined) row.price       = updates.price;
        if (updates.imageUrl    !== undefined) row.image_url   = updates.imageUrl;
        if (updates.link        !== undefined) row.link        = updates.link;
        supabase?.from('merchs').update(row).eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] updateMerch:', error); });
      },

      deleteMerch: (id) => {
        set((s) => ({ merchs: s.merchs.filter((m) => m.id !== id) }));
        supabase?.from('merchs').delete().eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] deleteMerch:', error); });
      },
    }),
    {
      name: 'tattoo-shop-storage-v3',
      // Persist everything locally as fallback — Supabase is the source of truth
      // but localStorage ensures data survives if Supabase is unavailable
      partialize: (state) => ({
        isAdmin: state.isAdmin,
        tattoos: state.tattoos,
        artists: state.artists,
        merchs: state.merchs,
      }),
    }
  )
);
