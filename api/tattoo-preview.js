/**
 * Vercel serverless function: generates tattoo preview using HuggingFace Inference API.
 * Requires HF_TOKEN env var in Vercel settings (free account at huggingface.co).
 */
export default async function handler(req, res) {
  const { prompt } = req.query;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const token = process.env.HF_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'HF_TOKEN not configured' });
  }

  const safePrompt = prompt.slice(0, 200);

  // Use FLUX.1-schnell — fast, free tier on HuggingFace
  const response = await fetch(
    'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-wait-for-model': 'true',
      },
      body: JSON.stringify({ inputs: safePrompt }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    return res.status(502).json({ error: `HuggingFace error: ${response.status}`, detail: body });
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const buffer = await response.arrayBuffer();

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(Buffer.from(buffer));
}
