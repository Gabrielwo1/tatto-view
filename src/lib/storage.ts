import { supabase } from './supabase';

const ARTIST_BUCKET = 'artists';
const TATTOO_BUCKET = 'tattoos';

/**
 * Converte uma imagem para WebP
 */
async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        },
        'image/webp',
        0.85
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

export async function uploadArtistPhoto(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  
  // Convert to WebP
  const webpBlob = await convertToWebP(file);
  const fileName = `${Date.now()}.webp`;
  
  const { error: uploadError } = await supabase.storage
    .from(ARTIST_BUCKET)
    .upload(fileName, webpBlob, {
      contentType: 'image/webp',
    });

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
