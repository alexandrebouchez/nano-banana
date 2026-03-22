#!/usr/bin/env node

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { parseArgs } from '../lib/args.mjs';
import { MODELS, MODEL_ALIASES, DEFAULT_MODEL, RESOLUTIONS, DEFAULT_RESOLUTION } from '../lib/config.mjs';
import { getClient } from '../lib/client.mjs';
import { loadMultipleImages, buildContentParts } from '../lib/images.mjs';
import { enhancePrompt } from '../lib/prompt.mjs';
import { logCost } from '../lib/costs.mjs';
import { getState, updateState } from '../lib/state.mjs';

try {
  const args = parseArgs();
  const rawPrompt = args._[0];

  if (!rawPrompt) {
    process.stderr.write('Usage: generate.mjs "prompt" [--model flash|pro] [--aspect 16:9] [--size 1K|2K|4K] [--output path] [--no-enhance] [--ref path ...] [--consistent]\n');
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

  // Build prompt
  let prompt = rawPrompt;

  // Consistent character mode
  const state = getState();
  if (args.consistent && state.characterDescription) {
    prompt = `${state.characterDescription}\n\n${prompt}`;
  }
  if (args.consistent) {
    prompt += '\nMaintain consistent character appearance with distinctive visual markers.';
  }

  // Enhance unless --no-enhance
  if (!args['no-enhance']) {
    prompt = await enhancePrompt(prompt);
  }

  // Build content parts
  const parts = buildContentParts(prompt, refImages);

  // Call Gemini
  const client = getClient();
  const response = await client.models.generateContent({
    model: modelConfig.id,
    contents: [{ role: 'user', parts }],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageGenerationConfig: {
        imageSize: resolution,
        aspectRatio,
      },
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
    process.stderr.write('ERROR: No image in response. The model may have refused or returned text only.\n');
    const textParts = (candidate.content?.parts || []).filter(p => p.text);
    if (textParts.length) {
      process.stderr.write(`Model said: ${textParts.map(p => p.text).join(' ')}\n`);
    }
    process.exit(1);
  }

  // Write image
  const timestamp = Date.now();
  const outputPath = resolve(args.output || `nano-gen-${timestamp}.png`);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, Buffer.from(imagePart.inlineData.data, 'base64'));

  // Cost tracking
  const inputTokens = response.usageMetadata?.promptTokenCount || 0;
  const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
  const cost = logCost(modelKey, resolution, inputTokens, outputTokens, rawPrompt);

  // Update state
  const stateUpdate = {
    lastImage: outputPath,
    lastPrompt: rawPrompt,
    lastModel: modelKey,
  };
  if (args.consistent) {
    stateUpdate.characterDescription = prompt;
  }
  updateState(stateUpdate);

  // Output
  process.stdout.write(`GENERATED | path:${outputPath} | model:${modelKey} | cost:$${cost.toFixed(4)} | ${resolution}\n`);

} catch (err) {
  process.stderr.write(`ERROR: ${err.message}\n`);
  process.exit(1);
}
