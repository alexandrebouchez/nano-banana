#!/usr/bin/env node

import { MODELS, MODEL_ALIASES, DEFAULT_MODEL, ENHANCE_MODEL } from '../lib/config.mjs';

try {
  const lines = ['Available models:'];

  for (const [key, config] of Object.entries(MODELS)) {
    const aliases = Object.entries(MODEL_ALIASES)
      .filter(([alias, target]) => target === key && alias !== key)
      .map(([alias]) => alias);
    const isDefault = key === DEFAULT_MODEL ? ' (default)' : '';
    const aliasStr = aliases.length ? ` | aliases: ${aliases.join(', ')}` : '';

    lines.push(`  ${key}${isDefault}${aliasStr}`);
    lines.push(`    model: ${config.id}`);
    lines.push(`    pricing: $${config.pricing.input}/M input, $${config.pricing.output}/M output`);
  }

  lines.push('');
  lines.push(`Enhancement model: ${ENHANCE_MODEL} (text-only, used for prompt enrichment)`);

  process.stdout.write(`${lines.join('\n')}\n`);
} catch (err) {
  process.stderr.write(`ERROR: ${err.message}\n`);
  process.exit(1);
}
