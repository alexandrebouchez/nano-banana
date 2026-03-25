#!/usr/bin/env node

import { execSync } from 'child_process';
import { parseArgs } from '../lib/args.mjs';
import { REVERSE_MODEL, PLUGIN_ROOT } from '../lib/config.mjs';
import { loadImageAsBase64 } from '../lib/images.mjs';
import { reverseImage } from '../lib/reverse.mjs';
import { logCost } from '../lib/costs.mjs';
import { getState, updateState } from '../lib/state.mjs';

try {
  const args = parseArgs();
  const sourceArg = args._[0];

  if (!sourceArg) {
    process.stderr.write('Usage: reverse.mjs "path_or_last" [--generate] [--model flash|pro] [--output path]\n');
    process.exit(1);
  }

  // Resolve source image (support "last")
  let sourcePath = sourceArg;
  if (sourceArg === 'last') {
    const state = getState();
    if (!state.lastImage) {
      process.stderr.write('ERROR: No previous image in state. Generate one first or provide a path.\n');
      process.exit(1);
    }
    sourcePath = state.lastImage;
  }

  // Load image
  const imageData = loadImageAsBase64(sourcePath);

  // Reverse-engineer prompt
  const result = await reverseImage(imageData);

  if (!result.prompt) {
    process.stderr.write('ERROR: Could not extract a prompt from the image.\n');
    process.exit(1);
  }

  // Cost tracking
  const cost = logCost(REVERSE_MODEL, 'reverse', result.inputTokens, result.outputTokens, result.prompt);

  // Update state — set lastPrompt for chaining, keep lastImage as-is
  updateState({
    lastPrompt: result.prompt,
    lastModel: 'reverse',
  });

  // Output
  process.stdout.write(`REVERSED | prompt:${result.prompt} | model:${REVERSE_MODEL} | cost:$${cost.toFixed(4)} | source:${sourcePath}\n`);

  // Auto-chain with generate if --generate flag
  if (args.generate) {
    const genArgs = [JSON.stringify(result.prompt), '--no-enhance'];
    if (args.model) genArgs.push('--model', args.model);
    if (args.output) genArgs.push('--output', args.output);

    const cmd = `node "${PLUGIN_ROOT}/scripts/generate.mjs" ${genArgs.join(' ')}`;
    process.stderr.write('Chaining: generating image from reversed prompt...\n');

    const genOutput = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'inherit'] });
    process.stdout.write(genOutput);
  }

} catch (err) {
  process.stderr.write(`ERROR: ${err.message}\n`);
  process.exit(1);
}
