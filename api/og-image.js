/**
 * Vercel serverless function: generates a 1200×630 OG image using pureimage.
 * Fetches the custom favicon from Supabase, draws it centred on a black canvas,
 * and returns a JPEG — so WhatsApp / Facebook / Instagram show the correct preview.
 */
import { Readable, PassThrough } from 'stream';
import * as PImage from 'pureimage';

const W = 1200;
const H = 630;

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

function bufToStream(buf) {
  return Readable.from([buf]);
}

export default async function handler(req, res) {
  const faviconUrl = await getFaviconUrl(req);

  try {
    // ── 1. Fetch the favicon image ───────────────────────────────────────────
    const imgRes = await fetch(faviconUrl);
    if (!imgRes.ok) throw new Error(`fetch ${imgRes.status}`);
    const imgBuf       = Buffer.from(await imgRes.arrayBuffer());
    const contentType  = imgRes.headers.get('content-type') ?? '';
    const isWebP       = contentType.includes('webp') || faviconUrl.endsWith('.webp');

    if (isWebP) throw new Error('webp-not-supported'); // pureimage can't decode WebP

    // ── 2. Decode image ──────────────────────────────────────────────────────
    const isJpeg = contentType.includes('jpeg') || /\.jpe?g$/i.test(faviconUrl);
    const srcImg = isJpeg
      ? await PImage.decodeJPEGFromStream(bufToStream(imgBuf))
      : await PImage.decodePNGFromStream(bufToStream(imgBuf));

    // ── 3. Draw on 1200×630 canvas ───────────────────────────────────────────
    const canvas = PImage.make(W, H);
    const ctx    = canvas.getContext('2d');

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    // Centre the icon (square, 80 % of height = 504 px)
    const size = Math.round(H * 0.80);
    const x    = Math.round((W - size) / 2);
    const y    = Math.round((H - size) / 2);
    ctx.drawImage(srcImg, x, y, size, size);

    // ── 4. Encode to JPEG and send ───────────────────────────────────────────
    const pass   = new PassThrough();
    const chunks = [];
    pass.on('data', (chunk) => chunks.push(chunk));

    const done = new Promise((resolve, reject) => {
      pass.on('end',   resolve);
      pass.on('error', reject);
    });

    await PImage.encodeJPEGToStream(canvas, pass, 90);
    await done;

    const output = Buffer.concat(chunks);

    res.setHeader('Content-Type',   'image/jpeg');
    res.setHeader('Cache-Control',  'public, s-maxage=3600, stale-while-revalidate=300');
    res.setHeader('Content-Length', output.length);
    return res.end(output);

  } catch (err) {
    console.error('[og-image]', err.message);
    // Fallback: redirect directly to the favicon URL
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.redirect(302, faviconUrl);
  }
}
