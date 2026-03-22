#!/usr/bin/env node

import { writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { dirname, resolve, join } from 'path';
import { tmpdir } from 'os';
import { parseArgs } from '../lib/args.mjs';
import { MODELS, MODEL_ALIASES, DEFAULT_MODEL, RESOLUTIONS, DEFAULT_RESOLUTION } from '../lib/config.mjs';
import { getClient } from '../lib/client.mjs';
import { loadImageAsBase64, loadMultipleImages, buildContentParts } from '../lib/images.mjs';
import { extractAlpha } from '../lib/alpha.mjs';
import { logCost } from '../lib/costs.mjs';
import { updateState } from '../lib/state.mjs';

try {
  const args = parseArgs();
  const rawPrompt = args._[0];

  if (!rawPrompt) {
    process.stderr.write('Usage: transparent.mjs "prompt" [--model flash|pro] [--aspect 1:1] [--size 1K] [--output path] [--ref path ...]\n');
    process.exit(1);
  }

  // Resolve model
  const modelKey = MODEL_ALIASES[args.model || DEFAULT_MODEL] || DEFAULT_MODEL;
  const modelConfig = MODELS[modelKey];
  if (!modelConfig) {
    process.stderr.write(`ERROR: Unknown model "${args.model}". Available: ${Object.keys(MODELS).join(', ')}\n`);
    process.exit(1);
  }

  // Resolution and aspect
  const resolution = RESOLUTIONS[args.size || DEFAULT_RESOLUTION] || RESOLUTIONS[DEFAULT_RESOLUTION];
  const aspectRatio = args.aspect || '1:1';

  // Load reference images
  const refPaths = args.ref || [];
  const refImages = refPaths.length > 0 ? loadMultipleImages(refPaths) : [];

  const client = getClient();
  const ts = Date.now();
  const tempDir = tmpdir();
  const whitePath = join(tempDir, `temp-white-${ts}.png`);
  const blackPath = join(tempDir, `temp-black-${ts}.png`);

  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  // --- Pass 1: Generate on white background ---
  const whitePrompt = `${rawPrompt} on a pure solid white #FFFFFF background`;
  const whiteParts = buildContentParts(whitePrompt, refImages);

  const whiteResponse = await client.models.generateContent({
    model: modelConfig.id,
    contents: [{ role: 'user', parts: whiteParts }],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageGenerationConfig: { imageSize: resolution, aspectRatio },
    },
  });

  const whiteCandidate = whiteResponse?.candidates?.[0];
  let whiteImagePart = null;
  for (const part of whiteCandidate?.content?.parts || []) {
    if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
      whiteImagePart = part;
      break;
    }
  }
  if (!whiteImagePart) {
    process.stderr.write('ERROR: No image in white-background response\n');
    process.exit(1);
  }
  writeFileSync(whitePath, Buffer.from(whiteImagePart.inlineData.data, 'base64'));
  totalInputTokens += whiteResponse.usageMetadata?.promptTokenCount || 0;
  totalOutputTokens += whiteResponse.usageMetadata?.candidatesTokenCount || 0;

  // --- Pass 2: Edit to black background ---
  const whiteImage = loadImageAsBase64(whitePath);
  const editInstruction = 'Change the white background to a solid pure black #000000 background. Keep everything else exactly unchanged.';
  const editParts = [
    { inlineData: { mimeType: whiteImage.mimeType, data: whiteImage.data } },
    { text: editInstruction },
  ];

  const blackResponse = await client.models.generateContent({
    model: modelConfig.id,
    contents: [{ role: 'user', parts: editParts }],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  const blackCandidate = blackResponse?.candidates?.[0];
  let blackImagePart = null;
  for (const part of blackCandidate?.content?.parts || []) {
    if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
      blackImagePart = part;
      break;
    }
  }
  if (!blackImagePart) {
    process.stderr.write('ERROR: No image in black-background response\n');
    process.exit(1);
  }
  writeFileSync(blackPath, Buffer.from(blackImagePart.inlineData.data, 'base64'));
  totalInputTokens += blackResponse.usageMetadata?.promptTokenCount || 0;
  totalOutputTokens += blackResponse.usageMetadata?.candidatesTokenCount || 0;

  // --- Pass 3: Extract alpha via difference matting ---
  const outputPath = resolve(args.output || `nano-transparent-${ts}.png`);
  mkdirSync(dirname(outputPath), { recursive: true });
  await extractAlpha(whitePath, blackPath, outputPath);

  // Cleanup temp files
  try { unlinkSync(whitePath); } catch {}
  try { unlinkSync(blackPath); } catch {}

  // Cost tracking (sum of both passes)
  const totalCost = logCost(modelKey, resolution, totalInputTokens, totalOutputTokens, rawPrompt);

  // Update state
  updateState({
    lastImage: outputPath,
    lastPrompt: rawPrompt,
    lastModel: modelKey,
  });

  // Output
  process.stdout.write(`TRANSPARENT | path:${outputPath} | model:${modelKey} | cost:$${totalCost.toFixed(4)} | ${resolution} | passes:2\n`);

} catch (err) {
  process.stderr.write(`ERROR: ${err.message}\n`);
  process.exit(1);
}
