/**
 * Vercel serverless function: serves the OG image for social previews.
 *
 * Strategy:
 * 1. Tries to generate a proper 1200×630 JPEG using pureimage (best quality)
 * 2. Falls back to proxying the favicon image directly (works for all crawlers)
 *
 * This ensures WhatsApp/Facebook/Instagram always get an image even if
 * pureimage fails to load in the serverless environment.
 */

async function getFaviconUrl(req) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/site_config?key=eq.customFavicon&select=value`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
      );
      if (resp.ok) {
        const rows = await resp.json();
        const value = rows?.[0]?.value;
        if (value && typeof value === 'string' && value.startsWith('http')) return value;
      }
    } catch (_) { /* fall through */ }
  }

  const origin = `${req.headers['x-forwarded-proto'] ?? 'https'}://${req.headers['x-forwarded-host'] ?? req.headers.host}`;
  return `${origin}/dudeicone.png`;
}

async function generateWithPureimage(imgBuf, contentType) {
  const { Readable, PassThrough } = await import('stream');
  const PImage = await import('pureimage');

  const isJpeg = contentType.includes('jpeg') || contentType.includes('jpg');

  const srcImg = isJpeg
    ? await PImage.decodeJPEGFromStream(Readable.from([imgBuf]))
    : await PImage.decodePNGFromStream(Readable.from([imgBuf]));

  const W = 1200, H = 630;
  const canvas = PImage.make(W, H);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  const size = Math.round(H * 0.80);
  ctx.drawImage(srcImg, Math.round((W - size) / 2), Math.round((H - size) / 2), size, size);

  const pass = new PassThrough();
  const chunks = [];
  pass.on('data', (c) => chunks.push(c));
  const done = new Promise((res, rej) => { pass.on('end', res); pass.on('error', rej); });
  await PImage.encodeJPEGToStream(canvas, pass, 90);
  await done;

  return { buffer: Buffer.concat(chunks), mime: 'image/jpeg' };
}

export default async function handler(req, res) {
  const faviconUrl = await getFaviconUrl(req);

  try {
    const imgRes = await fetch(faviconUrl);
    if (!imgRes.ok) throw new Error(`fetch ${imgRes.status}`);
    const imgBuf      = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get('content-type') ?? 'image/png';
    const isWebP      = contentType.includes('webp') || faviconUrl.endsWith('.webp');

    if (!isWebP) {
      try {
        const { buffer, mime } = await generateWithPureimage(imgBuf, contentType);
        res.setHeader('Content-Type', mime);
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300');
        res.setHeader('Content-Length', buffer.length);
        return res.end(buffer);
      } catch (pureErr) {
        console.warn('[og-image] pureimage failed, falling back to proxy:', pureErr.message);
      }
    }

    // Fallback: proxy the image directly
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300');
    res.setHeader('Content-Length', imgBuf.length);
    return res.end(imgBuf);

  } catch (err) {
    console.error('[og-image] fatal:', err.message);
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.redirect(302, faviconUrl);
  }
}
