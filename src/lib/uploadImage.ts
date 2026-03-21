/**
 * Uploads a base64 data URL to ImgBB and returns the public image URL.
 * Falls back to the original src if the API key is not configured.
 *
 * Setup: add VITE_IMGBB_API_KEY=your_key to your .env file.
 * Get a free key at https://api.imgbb.com/
 */
export async function uploadImage(src: string): Promise<string> {
  // If it's already a remote URL, nothing to do
  if (!src.startsWith('data:')) return src;

  const apiKey = import.meta.env.VITE_IMGBB_API_KEY as string | undefined;
  if (!apiKey) {
    console.warn('[uploadImage] VITE_IMGBB_API_KEY not set — image stored as base64 (local only)');
    return src;
  }

  // Strip the data URL prefix (e.g. "data:image/jpeg;base64,")
  const base64 = src.replace(/^data:image\/\w+;base64,/, '');

  const body = new FormData();
  body.append('key', apiKey);
  body.append('image', base64);

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body,
  });

  if (!res.ok) {
    console.error('[uploadImage] ImgBB upload failed', res.status, await res.text());
    return src; // fallback — keep base64
  }

  const json = await res.json();
  return (json?.data?.url as string) ?? src;
}

/**
 * Uploads multiple images in parallel.
 */
export async function uploadImages(srcs: string[]): Promise<string[]> {
  return Promise.all(srcs.map(uploadImage));
}
