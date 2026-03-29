/**
 * Vercel serverless function: returns the current site logo for OG/WhatsApp previews.
 * Reads customLogo from Supabase site_config and redirects to it.
 * Falls back to /logosemo-3.png if not configured.
 */
export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  let logoUrl = null;

  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/site_config?key=eq.customLogo&select=value`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      if (response.ok) {
        const rows = await response.json();
        const value = rows?.[0]?.value;
        if (value && typeof value === 'string' && value.startsWith('http')) {
          logoUrl = value;
        }
      }
    } catch {
      // fallback below
    }
  }

  if (!logoUrl) {
    // Redirect to default logo (served statically from /public)
    const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    logoUrl = `${proto}://${host}/logosemo-3.png`;
  }

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.redirect(302, logoUrl);
}
