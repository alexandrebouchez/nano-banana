import { GoogleGenAI } from '@google/genai';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PLUGIN_ROOT, STATE_DIR } from './config.mjs';

let _client = null;

/**
 * Lazy-init GoogleGenAI client.
 * Reads API key from: process.env > plugin .env > ~/.nano-banana/.env
 */
export function getClient() {
  if (_client) return _client;

  let apiKey = process.env.GEMINI_API_KEY;

  // Try plugin .env
  if (!apiKey) {
    try {
      const envContent = readFileSync(join(PLUGIN_ROOT, '.env'), 'utf-8');
      const match = envContent.match(/GEMINI_API_KEY=(.+)/);
      if (match) apiKey = match[1].trim();
    } catch {}
  }

  // Fallback: ~/.nano-banana/.env
  if (!apiKey) {
    try {
      const envContent = readFileSync(join(STATE_DIR, '.env'), 'utf-8');
      const match = envContent.match(/GEMINI_API_KEY=(.+)/);
      if (match) apiKey = match[1].trim();
    } catch {}
  }

  if (!apiKey) {
    process.stderr.write(`ERROR: GEMINI_API_KEY not found.\nSet in: ${PLUGIN_ROOT}/.env or ~/.nano-banana/.env or GEMINI_API_KEY env var\n`);
    process.exit(1);
  }

  _client = new GoogleGenAI({ apiKey });
  return _client;
}
