import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { STATE_DIR, MODELS } from './config.mjs';

const COSTS_FILE = join(STATE_DIR, 'costs.json');

function ensureDir() {
  mkdirSync(STATE_DIR, { recursive: true });
}

function emptyData() {
  return { totalGenerations: 0, totalCost: 0, byModel: {}, history: [] };
}

export function getCosts() {
  try {
    return JSON.parse(readFileSync(COSTS_FILE, 'utf-8'));
  } catch {
    return emptyData();
  }
}

function saveCosts(data) {
  ensureDir();
  writeFileSync(COSTS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Calculate cost in USD for a single generation.
 * Pricing is per million tokens.
 */
function calcCost(model, inputTokens, outputTokens) {
  const pricing = MODELS[model]?.pricing;
  if (!pricing) return 0;
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

export function logCost(model, resolution, inputTokens, outputTokens, prompt) {
  const data = getCosts();
  const cost = calcCost(model, inputTokens, outputTokens);

  data.totalGenerations += 1;
  data.totalCost += cost;

  if (!data.byModel[model]) {
    data.byModel[model] = { count: 0, cost: 0 };
  }
  data.byModel[model].count += 1;
  data.byModel[model].cost += cost;

  data.history.push({
    timestamp: new Date().toISOString(),
    model,
    resolution,
    inputTokens,
    outputTokens,
    cost,
    prompt: prompt.slice(0, 120),
  });

  saveCosts(data);
  return cost;
}

export function formatCosts() {
  const data = getCosts();
  if (data.totalGenerations === 0) return 'No generations yet.';

  const lines = [
    `Total: ${data.totalGenerations} generations | $${data.totalCost.toFixed(4)}`,
  ];

  for (const [model, info] of Object.entries(data.byModel)) {
    lines.push(`  ${model}: ${info.count} gens | $${info.cost.toFixed(4)}`);
  }

  const recent = data.history.slice(-5).reverse();
  if (recent.length) {
    lines.push('Recent:');
    for (const h of recent) {
      lines.push(`  ${h.timestamp.slice(0, 16)} | ${h.model} | $${h.cost.toFixed(4)} | ${h.prompt.slice(0, 60)}`);
    }
  }

  return lines.join('\n');
}
