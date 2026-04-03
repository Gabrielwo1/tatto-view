/**
 * Vercel serverless function: serves the custom favicon as the OG image.
 * Proxies the image directly so WhatsApp/Facebook/Instagram show the correct preview.
 */
export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  const origin = `${req.headers['x-forwarded-proto'] ?? 'https'}://${req.headers['x-forwarded-host'] ?? req.headers.host}`;
  const fallback = `${origin}/WhatsApp%20Image%202026-0sss3-31%20at%2010.12.46.jpeg`;

  let imageUrl = fallback;

  if (supabaseUrl && supabaseKey) {
    try {
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/site_config?key=eq.customFavicon&select=value`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
      );
      if (resp.ok) {
        const rows = await resp.json();
        const value = rows?.[0]?.value;
        if (value && typeof value === 'string' && value.startsWith('http')) imageUrl = value;
      }
    } catch (_) { /* fall through to fallback */ }
  }

  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`fetch ${imgRes.status}`);
    const buffer      = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get('content-type') ?? 'image/png';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300');
    res.setHeader('Content-Length', buffer.length);
    return res.end(buffer);
  } catch (err) {
    console.error('[og-image]', err.message);
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.redirect(302, fallback);
  }
}
