/**
 * geminiPreview.ts — Calls Gemini API to composite a tattoo onto a body photo.
 *
 * NOTE: The API key is called directly from the frontend for simplicity.
 * For production, move this to a Supabase Edge Function or server proxy.
 */

const GEMINI_API_KEY = 'AIzaSyCNfhldj2L54kNxge_V03Kyw23Bp8S_iys';
const GEMINI_MODEL = 'gemini-2.0-flash-exp'; // Supports multimodal image generation/editing
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const PROMPT = `You are an elite tattoo visualization AI.
TASK: Composite the tattoo design (SECOND image) onto the body part shown in the FIRST image.

QUALITIES:
- PHOTOREALISM: The tattoo must follow skin texture, pores, and natural body curvature.
- LIGHTING MATCH: Match the ambient light, highlights, and shadows of the body photo perfectly.
- HEALED LOOK: Apply a subtle natural skin overlay so it doesn't look like a computer graphic.
- COMPOSITION: Warp the tattoo to follow the specific limb anatomy shown.
- PRESERVATION: Do NOT change the original body photo background or skin beyond the tattoo area.

STYLE: The tattoo is professional art. Maintain all details of the original design.
OUTPUT: Return only the high-resolution composited photo.`;

/**
 * Resizes an image (Blob) to a max dimension and returns base64 string.
 */
async function resizeAndToBase64(blob: Blob, maxDim = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve(dataUrl.replace(/^data:image\/\w+;base64,/, ''));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Fetches a remote image URL and returns it as { base64, mimeType }.
 */
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.statusText}`);
  const blob = await resp.blob();
  const base64 = await resizeAndToBase64(blob);
  return { base64, mimeType: 'image/jpeg' };
}

/**
 * Converts a File to base64 with resizing.
 */
async function fileToBase64(file: File): Promise<string> {
  return resizeAndToBase64(file);
}

export interface PreviewResult {
  imageBase64: string;
  mimeType: string;
}

/**
 * Generate a tattoo preview on a body photo.
 * @param tattooImageUrl  URL of the tattoo design image
 * @param bodyPhotoFile   File object from the user's upload (body photo)
 * @returns               The generated composite image as base64
 */
export async function generateTattooPreview(
  tattooImageUrl: string,
  bodyPhotoFile: File
): Promise<PreviewResult> {
  // Convert body photo to base64
  const bodyBase64 = await fileToBase64(bodyPhotoFile);
  const bodyMimeType = 'image/jpeg';

  // Fetch tattoo image from URL and convert
  const tattoo = await fetchImageAsBase64(tattooImageUrl);

  const payload = {
    contents: [
      {
        parts: [
          { text: PROMPT },
          {
            inline_data: {
              mime_type: bodyMimeType,
              data: bodyBase64,
            },
          },
          {
            inline_data: {
              mime_type: tattoo.mimeType,
              data: tattoo.base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  };

  const resp = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error('Gemini API error:', errText);
    if (resp.status === 429) {
      throw new Error('Limite de uso da IA atingido. Por favor, aguarde um minuto e tente novamente.');
    }
    throw new Error(`Erro na API (${resp.status}). Tente novamente mais tarde.`);
  }

  const data = await resp.json();
  const candidates = data.candidates || [];

  // Extract image from response
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.inline_data) {
        return {
          imageBase64: part.inline_data.data,
          mimeType: part.inline_data.mime_type || 'image/png',
        };
      }
    }
  }

  // No image found — extract text for debugging
  let text = '';
  for (const candidate of candidates) {
    for (const part of candidate.content?.parts || []) {
      if (part.text) text += part.text;
    }
  }

  throw new Error(text || 'Gemini did not return an image. Try a different photo.');
}
