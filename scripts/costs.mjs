#!/usr/bin/env node

import { formatCosts } from '../lib/costs.mjs';

try {
  const output = formatCosts();
  process.stdout.write(`${output}\n`);
} catch (err) {
  process.stderr.write(`ERROR: ${err.message}\n`);
  process.exit(1);
}
