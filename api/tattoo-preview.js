/**
 * Vercel serverless function: proxies Pollinations.ai image generation.
 * Called as: /api/tattoo-preview?prompt=...
 */
export default async function handler(req, res) {
  const { prompt } = req.query;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const encoded = encodeURIComponent(prompt.slice(0, 200));
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}&model=flux`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Upstream error: ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
}
