import { createClient } from '@supabase/supabase-js';
import type { Tattoo, Artist } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Row types (Supabase snake_case) ──────────────────────────────────────────

interface ArtistRow {
  id: string;
  name: string;
  bio: string;
  photo_url: string;
  specialties: string[];
  instagram: string | null;
  whatsapp: string | null;
  created_at: string;
  hidden_from_hero: boolean;
  preferred_contact_method: string | null;
}

interface TattooRow {
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

// ── Mappers ───────────────────────────────────────────────────────────────────

export function toArtist(row: ArtistRow): Artist {
  return {
    id: row.id,
    name: row.name,
    bio: row.bio ?? '',
    photoUrl: row.photo_url ?? '',
    specialties: row.specialties ?? [],
    instagram: row.instagram ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    createdAt: row.created_at,
    hiddenFromHero: row.hidden_from_hero ?? false,
    preferredContactMethod: row.preferred_contact_method ?? undefined,
  };
}

export function toTattoo(row: TattooRow): Tattoo {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    imageUrl: row.image_url ?? '',
    style: row.style,
    price: row.price ?? undefined,
    artistId: row.artist_id,
    status: row.status,
    createdAt: row.created_at,
  };
}

// ── Artists CRUD ──────────────────────────────────────────────────────────────

export async function fetchArtists(): Promise<Artist[]> {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as ArtistRow[]).map(toArtist);
}

export async function insertArtist(artist: Omit<Artist, 'id' | 'createdAt'>): Promise<Artist> {
  const { data, error } = await supabase
    .from('artists')
    .insert({
      name: artist.name,
      bio: artist.bio,
      photo_url: artist.photoUrl,
      specialties: artist.specialties,
      instagram: artist.instagram ?? null,
      whatsapp: artist.whatsapp ?? null,
      hidden_from_hero: artist.hiddenFromHero ?? false,
      preferred_contact_method: artist.preferredContactMethod ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return toArtist(data as ArtistRow);
}

export async function updateArtist(id: string, updates: Partial<Artist>): Promise<void> {
  const row: Partial<ArtistRow> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.bio !== undefined) row.bio = updates.bio;
  if (updates.photoUrl !== undefined) row.photo_url = updates.photoUrl;
  if (updates.specialties !== undefined) row.specialties = updates.specialties;
  if (updates.instagram !== undefined) row.instagram = updates.instagram ?? null;
  if (updates.whatsapp !== undefined) row.whatsapp = updates.whatsapp ?? null;
  if (updates.hiddenFromHero !== undefined) row.hidden_from_hero = updates.hiddenFromHero;
  if (updates.preferredContactMethod !== undefined) row.preferred_contact_method = updates.preferredContactMethod ?? null;

  const { error } = await supabase.from('artists').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteArtist(id: string): Promise<void> {
  const { error } = await supabase.from('artists').delete().eq('id', id);
  if (error) throw error;
}

// ── Tattoos CRUD ──────────────────────────────────────────────────────────────

export async function fetchTattoos(): Promise<Tattoo[]> {
  const { data, error } = await supabase
    .from('tattoos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as TattooRow[]).map(toTattoo);
}

export async function insertTattoo(tattoo: Omit<Tattoo, 'id' | 'createdAt'>): Promise<Tattoo> {
  const { data, error } = await supabase
    .from('tattoos')
    .insert({
      title: tattoo.title,
      description: tattoo.description,
      image_url: tattoo.imageUrl,
      style: tattoo.style,
      price: tattoo.price ?? null,
      artist_id: tattoo.artistId,
      status: tattoo.status,
    })
    .select()
    .single();
  if (error) throw error;
  return toTattoo(data as TattooRow);
}

export async function updateTattoo(id: string, updates: Partial<Tattoo>): Promise<void> {
  const row: Partial<TattooRow> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.imageUrl !== undefined) row.image_url = updates.imageUrl;
  if (updates.style !== undefined) row.style = updates.style;
  if (updates.price !== undefined) row.price = updates.price ?? null;
  if (updates.artistId !== undefined) row.artist_id = updates.artistId;
  if (updates.status !== undefined) row.status = updates.status;

  const { error } = await supabase.from('tattoos').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteTattoo(id: string): Promise<void> {
  const { error } = await supabase.from('tattoos').delete().eq('id', id);
  if (error) throw error;
}
