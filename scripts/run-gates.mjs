// Runs every gate in scripts/gates/ (wiki/method/gates.md, rule 2).
//   node scripts/run-gates.mjs              the static gates (npm run gates, part of check)
//   node scripts/run-gates.mjs --full       static + headless gates (part of check:full)
//   node scripts/run-gates.mjs --selftest   every gate's --selftest (npm run gates:selftest)
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './lib/gate.mjs';

/** Gates that drive a browser: too slow for every commit, run by check:full only. */
export const HEADLESS_GATES = new Set(['check-pilot.mjs']);

const GATES_DIR = join(REPO_ROOT, 'scripts/gates');
const selftest = process.argv.includes('--selftest');
const full = process.argv.includes('--full');

const gates = readdirSync(GATES_DIR)
  .filter((f) => /^check-.*\.mjs$/.test(f))
  .filter((f) => selftest || full || !HEADLESS_GATES.has(f))
  .sort();

/**
 * Gates may import the game's TypeScript (config, domain): tsx loads it, with the game's tsconfig
 * for its path aliases (@models/...).
 */
const TS_LOADER = ['--import', 'tsx'];
const TS_ENV = { ...process.env, TSX_TSCONFIG_PATH: join(REPO_ROOT, 'game/tsconfig.json') };

const failed = gates.filter((gate) => {
  const args = [...TS_LOADER, join(GATES_DIR, gate), ...(selftest ? ['--selftest'] : [])];
  return spawnSync(process.execPath, args, { stdio: 'inherit', cwd: REPO_ROOT, env: TS_ENV }).status !== 0;
});

if (failed.length > 0) {
  console.error(`gates failed: ${failed.join(', ')}`);
  process.exit(1);
}
