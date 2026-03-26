import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client — null when env vars are not configured.
 * The app works offline/local without it (falls back to localStorage).
 */
export const supabase = url && key ? createClient(url, key) : null;
