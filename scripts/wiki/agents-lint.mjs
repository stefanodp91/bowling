// agents-lint: AGENTS.md stays under 32 KiB (AGENTS.md, first paragraph), so every agent can read
// it entirely at the start of a session.
import { statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { finding, runGate, withTempDir } from '../lib/gate.mjs';

/** 32 KiB, the limit AGENTS.md sets for itself. */
export const AGENTS_MAX_BYTES = 32 * 1024;

export function agentsFindings(root) {
  const size = statSync(join(root, 'AGENTS.md')).size;
  return size > AGENTS_MAX_BYTES ? [finding('AGENTS.md', undefined, `${size} bytes, over ${AGENTS_MAX_BYTES}: move detail into the wiki`)] : [];
}

export const agentsSelftest = () =>
  withTempDir((dir) => {
    writeFileSync(join(dir, 'AGENTS.md'), 'x'.repeat(AGENTS_MAX_BYTES + 1));
    return agentsFindings(dir);
  });

if (import.meta.url === `file://${process.argv[1]}`) {
  runGate('agents-lint', { check: agentsFindings, selftest: agentsSelftest });
}
