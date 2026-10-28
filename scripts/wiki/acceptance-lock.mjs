// npm run acceptance:lock -- <page>: records the current hash of a page's acceptance section.
// HUMANS ONLY (AGENTS.md, «Commands»): it is how a decided change to a criterion is accepted.
// --selftest proves it refuses a page that does not exist.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '../lib/gate.mjs';
import { acceptanceHash, LOCK_FILE, readLock } from './check-acceptance.mjs';
import { loadWiki, wikiDirOf } from './parse.mjs';

export function lockPage(root, pagePath) {
  const page = loadWiki(wikiDirOf(root)).find((p) => p.path === pagePath);
  const hash = page === undefined ? undefined : acceptanceHash(page);
  if (hash === undefined) throw new Error(`no spec page with an acceptance section at wiki/${pagePath}`);
  const lock = { ...readLock(root), [pagePath]: hash };
  const sorted = Object.fromEntries(Object.entries(lock).sort(([a], [b]) => (a < b ? -1 : 1)));
  writeFileSync(join(root, LOCK_FILE), `${JSON.stringify(sorted, null, 2)}\n`);
  return hash;
}

if (process.argv.includes('--selftest')) {
  try {
    lockPage(REPO_ROOT, 'does/not-exist.md');
    console.error('acceptance:lock --selftest: FAILED, a missing page was locked');
    process.exit(1);
  } catch (error) {
    console.log(`acceptance:lock --selftest: ok, rejected: ${error.message}`);
  }
} else {
  const pages = process.argv.slice(2).map((arg) => arg.replace(/^wiki\//, ''));
  if (pages.length === 0) {
    console.error('usage: npm run acceptance:lock -- <page path under wiki/>');
    process.exit(1);
  }
  for (const page of pages) console.log(`${page}: ${lockPage(REPO_ROOT, page)}`);
}
