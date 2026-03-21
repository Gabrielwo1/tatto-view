import { supabase } from './supabase';

/**
 * Uploads a base64 data URL to image hosting and returns the public URL.
 * Priority: Supabase Storage → ImgBB → base64 fallback (local only).
 */
export async function uploadImage(src: string): Promise<string> {
  if (!src.startsWith('data:')) return src;

  // ── 1. Supabase Storage (preferred) ───────────────────────────────────────
  if (supabase) {
    try {
      const mime = src.match(/data:([^;]+);/)?.[1] ?? 'image/jpeg';
      const ext  = mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Convert base64 to Blob
      const base64 = src.replace(/^data:[^;]+;base64,/, '');
      const bytes  = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const blob   = new Blob([bytes], { type: mime });

      const { data, error } = await supabase.storage
        .from('images')
        .upload(name, blob, { contentType: mime, upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (err) {
      console.warn('[uploadImage] Supabase Storage failed, trying ImgBB:', err);
    }
  }

  // ── 2. ImgBB fallback ─────────────────────────────────────────────────────
  const imgbbKey = import.meta.env.VITE_IMGBB_API_KEY as string | undefined;
  if (imgbbKey) {
    try {
      const base64 = src.replace(/^data:[^;]+;base64,/, '');
      const form   = new FormData();
      form.append('key', imgbbKey);
      form.append('image', base64);

      const res  = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (res.ok && json?.data?.url) return json.data.url as string;
      throw new Error(json?.error?.message ?? 'ImgBB error');
    } catch (err) {
      console.warn('[uploadImage] ImgBB failed:', err);
    }
  }

  // ── 3. No hosting configured — base64 fallback (local only) ───────────────
  console.warn('[uploadImage] No image hosting configured. Image will only appear on this device.');
  return src;
}

/** Uploads multiple images in parallel. */
export async function uploadImages(srcs: string[]): Promise<string[]> {
  return Promise.all(srcs.map(uploadImage));
}
