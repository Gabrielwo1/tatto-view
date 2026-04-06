import { supabase } from './supabase';

const ARTIST_BUCKET = 'artists';
const TATTOO_BUCKET = 'tattoos';

export async function uploadArtistPhoto(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const fileName = `${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from(ARTIST_BUCKET)
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(ARTIST_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function uploadTattooImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const fileName = `${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from(TATTOO_BUCKET)
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(TATTOO_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
