/**
 * fluxPreview.ts — Calls Hugging Face API (Flux.1-schnell) to generate a tattoo mockup.
 */

export interface PreviewResult {
  imageBase64: string;
  mimeType: string;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateFluxPreview(
  prompt: string,
  _token?: string
): Promise<PreviewResult> {
  const encoded = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&model=flux&nologo=true&seed=${Date.now()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Erro ao gerar imagem (${response.status}). Tente novamente.`);
  }

  const resultBlob = await response.blob();
  const base64 = await blobToBase64(resultBlob);

  return {
    imageBase64: base64,
    mimeType: resultBlob.type || 'image/jpeg',
  };
}

/**
 * Builds a detailed prompt for Flux based on tattoo title and body placement.
 * Replaces the Gemini vision step with a template-based approach.
 */
export function buildTattooPrompt(tattooTitle: string, placement: string): string {
  const placementHint = placement
    ? `on the ${placement}, realistic skin texture, natural lighting`
    : 'on skin, realistic skin texture, natural lighting';

  return `Photorealistic tattoo mockup photo, ${tattooTitle} tattoo design ${placementHint}, professional tattoo photography, high resolution, detailed black ink, fresh tattoo, close-up, skin pores visible, studio lighting, ultra realistic`;
}

