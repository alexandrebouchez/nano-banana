import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { STATE_DIR } from './config.mjs';

const STATE_FILE = join(STATE_DIR, 'state.json');

function ensureDir() {
  mkdirSync(STATE_DIR, { recursive: true });
}

export function getState() {
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return {
      lastImage: null,
      lastPrompt: null,
      lastModel: null,
      lastTimestamp: null,
      characterDescription: null,
    };
  }
}

export function updateState(patch) {
  ensureDir();
  const current = getState();
  const next = { ...current, ...patch, lastTimestamp: new Date().toISOString() };
  writeFileSync(STATE_FILE, JSON.stringify(next, null, 2));
  return next;
}
