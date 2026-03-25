import { getClient } from './client.mjs';
import { REVERSE_MODEL } from './config.mjs';

const SYSTEM_PROMPT = `You are an expert at reverse-engineering AI image generation prompts optimized for Nano Banana (Google Gemini image models).

Given an image, produce a single, flowing text prompt that could recreate it. Write it as a direct scene description — the kind of prompt a skilled artist would type into an AI image generator.

Think through these aspects (but do NOT output labels or section headers):
- Subject: what is depicted, with specific visual details (materials, textures, colors, proportions, pose, expression)
- Environment: background, spatial arrangement, atmosphere
- Lighting: direction, quality, color temperature, shadows
- Technical: camera angle, focal length, depth of field, film grain — if the image looks photographic
- Style: artistic medium (photo, 3D render, illustration, watercolor, etc.), rendering quality, color grading
- Mood: emotional tone conveyed by the composition

Rules:
- Output ONLY the prompt, no explanation, no preamble, no section labels, no bullet points
- Write as one flowing description, using commas and periods to separate details
- Do not start with "Generate", "Create", or "Image of" — describe the scene directly
- Be specific: prefer "deep indigo" over "blue", "soft diffused side lighting" over "good lighting"
- Include resolution/quality keywords when appropriate (8k, high detail, sharp focus, etc.)
- Keep the output between 50 and 200 words — match complexity to image complexity
- Do not add quotation marks around the output`;

/**
 * Reverse-engineer an image into a generation prompt.
 * @param {{ mimeType: string, data: string }} imageData - Base64 image from loadImageAsBase64()
 * @returns {Promise<{ prompt: string|null, inputTokens: number, outputTokens: number }>}
 */
export async function reverseImage(imageData) {
  const client = getClient();
  const response = await client.models.generateContent({
    model: REVERSE_MODEL,
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType: imageData.mimeType, data: imageData.data } },
        { text: 'Describe this image as a detailed prompt that could recreate it.' },
      ],
    }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
  });

  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
  const usage = response?.usageMetadata || {};

  return {
    prompt: text?.trim() || null,
    inputTokens: usage.promptTokenCount || 0,
    outputTokens: usage.candidatesTokenCount || 0,
  };
}
