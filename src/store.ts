import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tattoo, Artist, Merch, TattooSession, ShopContent, TatuadoPost, TattooRow, ArtistRow, MerchRow, Expense, ExpenseCategory } from './types';
import type { ThemeId, LogoColorMode } from './lib/themes';
import { supabase } from './lib/supabase';

// ── Landing Page Content ────────────────────────────────────────────
const defaultLandingContent = {
  hero: {
    tagline: 'Sua pele.\nNossa arte,\nnossa tattoo.',
    description: 'Estúdio de tatuagens com artistas especializados em diferentes estilos.\nDo traço à pele — com arte, técnica e respeito pela sua história.',
  },
};
