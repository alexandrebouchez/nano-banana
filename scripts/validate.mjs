#!/usr/bin/env node
// validate.mjs — SessionStart hook: check API key availability.

import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const STATE_DIR = join(homedir(), '.nano-banana');

let apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  try {
    const envContent = readFileSync(join(PLUGIN_ROOT, '.env'), 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match) apiKey = match[1].trim();
  } catch {}
}

if (!apiKey) {
  try {
    const envContent = readFileSync(join(STATE_DIR, '.env'), 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match) apiKey = match[1].trim();
  } catch {}
}

if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  process.stderr.write(`Nano Banana: API key not configured. Set GEMINI_API_KEY in one of:\n  1. Environment variable: export GEMINI_API_KEY=...\n  2. Plugin .env: ${PLUGIN_ROOT}/.env\n  3. User config: ~/.nano-banana/.env\n  Get a key at https://aistudio.google.com/apikey\n`);
} else {
  process.stdout.write(`Nano Banana: ready\n`);
}
