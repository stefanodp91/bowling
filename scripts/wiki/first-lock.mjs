// Creates wiki/acceptance.lock.json from the pages exactly as committed in round zero
// (wiki/method/wiki-tooling.md, rule 5). Run once, when the lock did not exist; kept so anyone can
// verify that the first lock matches round zero: node scripts/wiki/first-lock.mjs --verify.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '../lib/gate.mjs';
import { LOCK_FILE } from './check-acceptance.mjs';
import { ACCEPTANCE_HEADING, parseFrontMatter, sectionText, sha256 } from './parse.mjs';

/** The round zero commit: rules, procedures and every page planned, written by hand. */
export const ROUND_ZERO_COMMIT = '547be397e21abc6d4df6f96edb6bb0b9a8cc631c';

const git = (...args) => execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });

function roundZeroLock() {
  const paths = git('ls-tree', '-r', '--name-only', ROUND_ZERO_COMMIT, 'wiki/').split('\n').filter((p) => p.endsWith('.md'));
  const entries = paths.flatMap((path) => {
    const { frontMatter, body } = parseFrontMatter(git('show', `${ROUND_ZERO_COMMIT}:${path}`));
    if (frontMatter?.type !== 'spec') return [];
    return [[path.replace(/^wiki\//, ''), sha256(sectionText(body, ACCEPTANCE_HEADING))]];
  });
  return Object.fromEntries(entries.sort(([a], [b]) => (a < b ? -1 : 1)));
}

const text = `${JSON.stringify(roundZeroLock(), null, 2)}\n`;
if (process.argv.includes('--verify')) {
  const same = readFileSync(join(REPO_ROOT, LOCK_FILE), 'utf8') === text;
  console.log(same ? 'the lock equals round zero' : 'the lock differs from round zero (a human locked a decided change since)');
} else {
  writeFileSync(join(REPO_ROOT, LOCK_FILE), text);
  console.log(`${LOCK_FILE} written from ${ROUND_ZERO_COMMIT}`);
}
