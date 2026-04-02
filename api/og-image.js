/**
 * Vercel serverless function: returns the current site image (favicon or logo) for OG/social previews.
 * Prioritizes customFavicon from Supabase site_config, falls back to customLogo, then to default file.
 */
export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  const origin = `${req.headers['x-forwarded-proto'] ?? 'https'}://${req.headers['x-forwarded-host'] ?? req.headers.host}`;
  const fallback = `${origin}/dudeicone.png`;

  try {
    if (supabaseUrl && supabaseKey) {
      // Fetch both favicon and logo to choose the best available
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/site_config?key=in.(customFavicon,customLogo)&select=key,value`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      
      if (resp.ok) {
        const rows = await resp.json();
        const config = {};
        rows.forEach(r => { config[r.key] = r.value; });

        // User specifically asked for the "Favicon" image to be used
        const targetUrl = config.customFavicon || config.customLogo;
        
        if (targetUrl && typeof targetUrl === 'string' && targetUrl.startsWith('http')) {
          res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
          return res.redirect(302, targetUrl);
        }
      }
    }
  } catch (err) {
    console.error('[og-image] Error fetching config:', err);
  }

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
  return res.redirect(302, fallback);
}

