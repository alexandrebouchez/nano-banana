#!/usr/bin/env node

import { parseArgs } from '../lib/args.mjs';
import { enhancePrompt } from '../lib/prompt.mjs';

try {
  const args = parseArgs();
  const rawPrompt = args._[0];

  if (!rawPrompt) {
    process.stderr.write('Usage: enhance.mjs "prompt"\n');
    process.exit(1);
  }

  const enhanced = await enhancePrompt(rawPrompt);
  process.stdout.write(`${enhanced}\n`);

} catch (err) {
  process.stderr.write(`ERROR: ${err.message}\n`);
  process.exit(1);
}
