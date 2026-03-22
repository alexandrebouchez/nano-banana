import { readFileSync } from 'fs';
import { extname, resolve } from 'path';

const MIME_MAP = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp',
};

export function loadImageAsBase64(imagePath) {
  const resolved = resolve(imagePath);
  const ext = extname(resolved).toLowerCase();
  const mimeType = MIME_MAP[ext];
  if (!mimeType) throw new Error(`Unsupported image type: ${ext}. Supported: ${Object.keys(MIME_MAP).join(', ')}`);
  const data = readFileSync(resolved);
  return { mimeType, data: data.toString('base64') };
}

export function loadMultipleImages(paths) {
  return paths.map(p => loadImageAsBase64(p));
}

export function buildContentParts(textPrompt, referenceImages = []) {
  const parts = [];
  for (const img of referenceImages) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  }
  parts.push({ text: textPrompt });
  return parts;
}
