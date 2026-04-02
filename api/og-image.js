/**
 * Vercel serverless function: returns the current site image (favicon or logo) for OG/social previews.
 * Serves the image directly (proxy) to avoid issues with social crawlers following redirects.
 */
export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  const origin = `${req.headers['x-forwarded-proto'] ?? 'https'}://${req.headers['x-forwarded-host'] ?? req.headers.host}`;
  const defaultFallback = `${origin}/dudeicone.png`;

  try {
    let imageUrl = defaultFallback;

    if (supabaseUrl && supabaseKey) {
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/site_config?key=in.(customFavicon,customLogo)&select=key,value`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      
      if (resp.ok) {
        const rows = await resp.json();
        const config = {};
        rows.forEach(r => { config[r.key] = r.value; });
        
        const dbUrl = config.customFavicon || config.customLogo;
        if (dbUrl && typeof dbUrl === 'string' && dbUrl.startsWith('http')) {
          imageUrl = dbUrl;
        }
      }
    }

    // Fetch the image and serve it directly
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) throw new Error('Failed to fetch target image');

    const contentType = imageResp.headers.get('content-type') || 'image/png';
    const buffer = await imageResp.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    return res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error('[og-image] Error processing image:', err);
    // Final fallback to raw file if proxy fails
    return res.redirect(302, defaultFallback);
  }
}
