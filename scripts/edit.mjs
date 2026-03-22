#!/usr/bin/env node

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { parseArgs } from '../lib/args.mjs';
import { MODELS, MODEL_ALIASES, DEFAULT_MODEL } from '../lib/config.mjs';
import { getClient } from '../lib/client.mjs';
import { loadImageAsBase64, loadMultipleImages } from '../lib/images.mjs';
import { logCost } from '../lib/costs.mjs';
import { getState, updateState } from '../lib/state.mjs';

try {
  const args = parseArgs();
  const sourceArg = args._[0];
  const instructions = args._[1];

  if (!sourceArg || !instructions) {
    process.stderr.write('Usage: edit.mjs "path_or_last" "instructions" [--model flash|pro] [--output path] [--ref path ...]\n');
    process.exit(1);
  }

  // Resolve source image
  let sourcePath = sourceArg;
  if (sourceArg === 'last') {
    const state = getState();
    if (!state.lastImage) {
      process.stderr.write('ERROR: No previous image in state. Generate one first.\n');
      process.exit(1);
    }
    sourcePath = state.lastImage;
  }

  // Load source image
  const sourceImage = loadImageAsBase64(sourcePath);

  // Load additional ref images
  const refPaths = args.ref || [];
  const refImages = refPaths.length > 0 ? loadMultipleImages(refPaths) : [];

  // Resolve model
  const modelKey = MODEL_ALIASES[args.model || DEFAULT_MODEL] || DEFAULT_MODEL;
  const modelConfig = MODELS[modelKey];
  if (!modelConfig) {
    process.stderr.write(`ERROR: Unknown model "${args.model}". Available: ${Object.keys(MODELS).join(', ')}\n`);
    process.exit(1);
  }

  // Build parts: source image + ref images + text instructions
  const parts = [
    { inlineData: { mimeType: sourceImage.mimeType, data: sourceImage.data } },
  ];
  for (const img of refImages) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  }
  parts.push({ text: instructions });

  // Call Gemini
  const client = getClient();
  const response = await client.models.generateContent({
    model: modelConfig.id,
    contents: [{ role: 'user', parts }],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  // Extract image from response
  const candidate = response?.candidates?.[0];
  if (!candidate) {
    process.stderr.write('ERROR: No candidates in response\n');
    process.exit(1);
  }

  let imagePart = null;
  for (const part of candidate.content?.parts || []) {
    if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
      imagePart = part;
      break;
    }
  }

  if (!imagePart) {
    process.stderr.write('ERROR: No image in response.\n');
    const textParts = (candidate.content?.parts || []).filter(p => p.text);
    if (textParts.length) {
      process.stderr.write(`Model said: ${textParts.map(p => p.text).join(' ')}\n`);
    }
    process.exit(1);
  }

  // Write image
  const timestamp = Date.now();
  const outputPath = resolve(args.output || `nano-edit-${timestamp}.png`);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, Buffer.from(imagePart.inlineData.data, 'base64'));

  // Cost tracking
  const inputTokens = response.usageMetadata?.promptTokenCount || 0;
  const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
  const cost = logCost(modelKey, 'edit', inputTokens, outputTokens, instructions);

  // Update state
  updateState({
    lastImage: outputPath,
    lastPrompt: instructions,
    lastModel: modelKey,
  });

  // Output
  process.stdout.write(`EDITED | path:${outputPath} | model:${modelKey} | cost:$${cost.toFixed(4)} | source:${sourcePath}\n`);

} catch (err) {
  process.stderr.write(`ERROR: ${err.message}\n`);
  process.exit(1);
}
