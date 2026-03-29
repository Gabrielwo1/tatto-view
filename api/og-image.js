/**
 * Vercel serverless function: returns the current site logo for OG/social previews.
 * Reads customLogo from Supabase site_config; falls back to /logosemo-3.png.
 */
export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  const origin = `${req.headers['x-forwarded-proto'] ?? 'https'}://${req.headers['x-forwarded-host'] ?? req.headers.host}`;
  const fallback = `${origin}/logosemo-3.png`;

  try {
    if (supabaseUrl && supabaseKey) {
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/site_config?key=eq.customLogo&select=value`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      if (resp.ok) {
        const rows = await resp.json();
        const value = rows?.[0]?.value;
        if (value && typeof value === 'string' && value.startsWith('http')) {
          res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
          return res.redirect(302, value);
        }
      }
    }
  } catch (_) {
    // fall through to default
  }

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
  return res.redirect(302, fallback);
}
