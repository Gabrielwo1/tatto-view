/**
 * fluxPreview.ts — Calls our /api/tattoo-preview proxy (Vercel serverless)
 * which fetches from Pollinations.ai server-side to avoid CORS/auth issues.
 */

export interface PreviewResult {
  url: string;
}

export async function generateFluxPreview(
  prompt: string,
  _token?: string
): Promise<{ url: string }> {
  const encoded = encodeURIComponent(prompt.slice(0, 200));
  const res = await fetch(`/api/tattoo-preview?prompt=${encoded}`);
  if (!res.ok) {
    throw new Error(`Erro ao gerar imagem (${res.status}). Tente novamente.`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  return { url };
}

/**
 * Builds a prompt for the image generation based on tattoo title and body placement.
 */
export function buildTattooPrompt(tattooTitle: string, placement: string): string {
  const loc = placement || 'arm';
  return `realistic tattoo of ${tattooTitle} on ${loc}, black ink, professional photo, skin texture, studio lighting`;
}
