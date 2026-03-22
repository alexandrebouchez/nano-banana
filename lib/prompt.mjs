import { getClient } from './client.mjs';
import { ENHANCE_MODEL } from './config.mjs';

const SYSTEM_PROMPT = `You are an expert image-generation prompt engineer.
Enhance the user's prompt using the Subject-Context-Style framework:
- SUBJECT: Add specific visual details (materials, textures, lighting, pose, expression)
- CONTEXT: Define the environment, time of day, atmosphere, background elements
- STYLE: Specify artistic direction (medium, colour palette, camera angle, rendering style)

Rules:
- Keep the output under 200 words
- Preserve the original intent completely
- Output ONLY the enhanced prompt, no explanation or preamble
- Do not add quotation marks around the output`;

/**
 * Enhance a raw prompt via Gemini text model.
 * Short prompts get enriched; prompts already >100 words pass through unchanged.
 */
export async function enhancePrompt(rawPrompt) {
  const wordCount = rawPrompt.trim().split(/\s+/).length;
  if (wordCount > 100) return rawPrompt;

  const client = getClient();
  const response = await client.models.generateContent({
    model: ENHANCE_MODEL,
    contents: [{ role: 'user', parts: [{ text: rawPrompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
  });

  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return rawPrompt;
  return text.trim();
}
