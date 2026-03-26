const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined;
const MODEL = 'black-forest-labs/FLUX.1-schnell';

const STYLE_PROMPTS: Record<string, string> = {
  'Realismo':          'photorealistic tattoo design, hyper detailed realism, black and grey shading, fine lines',
  'Blackwork':         'blackwork tattoo design, bold black ink, solid fill, strong lines, geometric blackwork',
  'Aquarela':          'watercolor tattoo design, vibrant colors, soft edges, paint splashes, fluid pigment',
  'Geométrico':        'geometric tattoo design, precise lines, sacred geometry, symmetrical patterns, dotwork',
  'Old School':        'old school tattoo design, traditional american tattoo, bold outlines, primary colors, vintage',
  'Tribal':            'tribal tattoo design, bold black patterns, ancestral motifs, flowing lines',
  'Neo-Tradicional':   'neo traditional tattoo design, bold outlines, rich colors, ornate details, illustrative',
  'Minimalista':       'minimalist tattoo design, fine line, simple elegant shapes, thin lines, negative space',
  'Japonês':           'japanese tattoo design, irezumi style, bold lines, traditional motifs, waves and clouds',
  'Lettering':         'lettering tattoo design, stylized typography, ornamental script, decorative text',
};

function buildPrompt(style: string, description: string, placement: string): string {
  const styleHint = STYLE_PROMPTS[style] ?? `${style} tattoo design`;
  const placementHint = placement ? `, placed on ${placement}` : '';
  return `${styleHint}, ${description}${placementHint}, professional tattoo artwork, tattoo stencil, white background, high contrast, detailed ink work, tattoo design concept`;
}

export async function generateTattooPreview(
  style: string,
  description: string,
  placement: string,
): Promise<string> {
  if (!HF_TOKEN) throw new Error('HF_TOKEN não configurado.');

  const prompt = buildPrompt(style, description, placement);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  let response: Response;
  try {
    response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { num_inference_steps: 4 },
        }),
        signal: controller.signal,
      },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`Erro ao gerar imagem: ${text}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
