/**
 * fluxPreview.ts — Calls Hugging Face API (Flux.1-schnell) to generate a tattoo mockup.
 */

// NOTE: The user needs to provide this token. 
// We will store it in localStorage or use a placeholder for now.
const HF_TOKEN_KEY = 'hf_access_token'; 

export interface PreviewResult {
  imageBase64: string;
  mimeType: string;
}

/**
 * Resizes an image (Blob) to a max dimension and returns base64 string.
 */
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

/**
 * Calls Hugging Face Inference API for Flux.1-schnell.
 * Since Flux is mainly Text-to-Image, we use a hybrid approach or a prompt-based generation.
 */
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
 * Uses Gemini 1.5 Flash (Free/High Quota) to generate a detailed prompt for Flux
 * based on the user's body part and the tattoo design.
 */
export async function generatePromptWithGemini(
  tattooImageUrl: string,
  bodyPhotoFile: File,
  geminiApiKey: string
): Promise<string> {
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

  // Helper to get base64
  const fileToBase64 = (file: Blob): Promise<string> => {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.onload = () => resolve((reader.result as string).split(',')[1]);
       reader.onerror = reject;
       reader.readAsDataURL(file);
     });
  };

  const bodyBase64 = await fileToBase64(bodyPhotoFile);
  const tattooResp = await fetch(tattooImageUrl);
  const tattooBlob = await tattooResp.blob();
  const tattooBase64 = await fileToBase64(tattooBlob);

  const payload = {
    contents: [{
      parts: [
        { text: "Describe a photorealistic tattoo mockup scene. Look at the body part in IMAGE 1 and the tattoo in IMAGE 2. Create a detailed prompt for an AI image generator to create a realistic photo of THIS EXACT TATTOO on THIS EXACT BODY PART. Include lighting, skin texture, and realistic composition. Return ONLY the prompt text, nothing else." },
        { inline_data: { mime_type: "image/jpeg", data: bodyBase64 } },
        { inline_data: { mime_type: "image/jpeg", data: tattooBase64 } }
      ]
    }]
  };

  const resp = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) throw new Error("Erro ao gerar prompt com Gemini.");
  
  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Photorealistic tattoo mockup";
}
