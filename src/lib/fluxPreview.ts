/**
 * fluxPreview.ts — Calls Hugging Face API (Flux.1-schnell) to generate a tattoo mockup.
 */

export interface PreviewResult {
  url: string;
}


export async function generateFluxPreview(
  prompt: string,
  _token?: string
): Promise<{ url: string }> {
  const shortPrompt = prompt.slice(0, 200);
  const encoded = encodeURIComponent(shortPrompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&nofeed=true`;
  return { url };
}

/**
 * Builds a detailed prompt for Flux based on tattoo title and body placement.
 * Replaces the Gemini vision step with a template-based approach.
 */
export function buildTattooPrompt(tattooTitle: string, placement: string): string {
  const loc = placement || 'arm';
  return `realistic tattoo of ${tattooTitle} on ${loc}, black ink, professional photo, skin texture, studio lighting`;
}

