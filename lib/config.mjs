import { homedir } from 'os';
import { join } from 'path';

export const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || new URL('..', import.meta.url).pathname.replace(/\/$/, '');
export const STATE_DIR = join(homedir(), '.nano-banana');

export const MODELS = {
  flash: { id: 'gemini-3.1-flash-image-preview', pricing: { input: 0.25, output: 60 } },
  pro:   { id: 'gemini-3-pro-image-preview',     pricing: { input: 2.00, output: 120 } },
};
export const DEFAULT_MODEL = 'flash';

export const MODEL_ALIASES = {
  flash: 'flash', nb2: 'flash', 'nano-banana-2': 'flash',
  pro: 'pro', 'nb-pro': 'pro', 'nano-banana-pro': 'pro',
};

export const RESOLUTIONS = {
  '512': '512x512',
  '1K': '1024x1024',
  '2K': '2048x2048',
  '4K': '4096x4096',
};
export const DEFAULT_RESOLUTION = '1K';

export const ASPECT_RATIOS = ['1:1','16:9','9:16','4:3','3:4','3:2','2:3','4:5','5:4','21:9','1:4','1:8','4:1','8:1'];

export const SUPPORTED_IMAGE_TYPES = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

// Text models (vision-capable, text-only output, cheap)
export const ENHANCE_MODEL = 'gemini-3.1-flash-lite-preview';
export const REVERSE_MODEL = 'gemini-3.1-flash-lite-preview';

// Pricing for text-only models (per million tokens) — used by costs.mjs
export const TEXT_MODELS = {
  'gemini-3.1-flash-lite-preview': { pricing: { input: 0.25, output: 1.50 } },
};
