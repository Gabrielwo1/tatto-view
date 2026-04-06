import { create } from 'zustand';
import type { Tattoo, Artist } from './types';
import * as db from './lib/supabase';

interface AppState {
  tattoos: Tattoo[];
  artists: Artist[];
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // Data fetching
  fetchTattoos: () => Promise<void>;
  fetchArtists: () => Promise<void>;

  // Tattoo mutations
  addTattoo: (tattoo: Omit<Tattoo, 'id' | 'createdAt'>) => Promise<void>;
  updateTattoo: (id: string, updates: Partial<Tattoo>) => Promise<void>;
  deleteTattoo: (id: string) => Promise<void>;
  archiveTattoo: (id: string) => Promise<void>;

  // Artist mutations
  addArtist: (artist: Omit<Artist, 'id' | 'createdAt'>) => Promise<void>;
  updateArtist: (id: string, updates: Partial<Artist>) => Promise<void>;
  deleteArtist: (id: string) => Promise<void>;
}

export const useStore = create<AppState>()((set, get) => ({
  tattoos: [],
  artists: [],
  isAdmin: false,
  isLoading: false,
  error: null,

  login: (username, password) => {
    const validUser = import.meta.env.VITE_ADMIN_USER ?? 'admin';
    const validPass = import.meta.env.VITE_ADMIN_PASS ?? '';
    if (username === validUser && password === validPass) {
      set({ isAdmin: true });
      return true;
    }
    return false;
  },

  logout: () => set({ isAdmin: false }),

  fetchTattoos: async () => {
    set({ isLoading: true, error: null });
    try {
      const tattoos = await db.fetchTattoos();
      set({ tattoos });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchArtists: async () => {
    set({ isLoading: true, error: null });
    try {
      const artists = await db.fetchArtists();
      set({ artists });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addTattoo: async (tattooData) => {
    const tattoo = await db.insertTattoo(tattooData);
    set((state) => ({ tattoos: [tattoo, ...state.tattoos] }));
  },

  updateTattoo: async (id, updates) => {
    await db.updateTattoo(id, updates);
    set((state) => ({
      tattoos: state.tattoos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTattoo: async (id) => {
    await db.deleteTattoo(id);
    set((state) => ({ tattoos: state.tattoos.filter((t) => t.id !== id) }));
  },

  archiveTattoo: async (id) => {
    const tattoo = get().tattoos.find((t) => t.id === id);
    if (!tattoo) return;
    const newStatus = tattoo.status === 'available' ? 'archived' : 'available';
    await db.updateTattoo(id, { status: newStatus });
    set((state) => ({
      tattoos: state.tattoos.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    }));
  },

  addArtist: async (artistData) => {
    const artist = await db.insertArtist(artistData);
    set((state) => ({ artists: [...state.artists, artist] }));
  },

  updateArtist: async (id, updates) => {
    await db.updateArtist(id, updates);
    set((state) => ({
      artists: state.artists.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  },

  deleteArtist: async (id) => {
    await db.deleteArtist(id);
    set((state) => ({ artists: state.artists.filter((a) => a.id !== id) }));
  },
}));
