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
  token: string
): Promise<PreviewResult> {
  const MODEL_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";

  const response = await fetch(MODEL_URL, {
    headers: { Authorization: `Bearer ${token}` },
    method: "POST",
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) {
      throw new Error("Limite de cota do Hugging Face atingido. Tente novamente em instantes.");
    }
    throw new Error(`Erro no Hugging Face (${response.status}): ${err}`);
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

