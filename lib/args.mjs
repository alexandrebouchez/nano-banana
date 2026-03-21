/**
 * Zero-dep CLI argument parser.
 * First positional arg = _[0], flags parsed as --key value or --flag (boolean).
 * Supports repeatable flags: --ref path1 --ref path2 → { ref: [path1, path2] }
 */
const REPEATABLE = new Set(['ref']);

export function parseArgs(argv = process.argv.slice(2)) {
  const result = { _: [] };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (REPEATABLE.has(key)) {
        if (!result[key]) result[key] = [];
        if (next && !next.startsWith('--')) {
          result[key].push(next);
          i += 2;
        } else {
          i++;
        }
      } else if (next && !next.startsWith('--')) {
        result[key] = next;
        i += 2;
      } else {
        result[key] = true;
        i++;
      }
    } else {
      result._.push(arg);
      i++;
    }
  }
  return result;
}
