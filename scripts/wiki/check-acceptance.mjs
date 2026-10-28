// check-acceptance: every spec page's «Acceptance criteria» section matches its hash in
// wiki/acceptance.lock.json (wiki/method/wiki-tooling.md, rule 5; AGENTS.md rule 3).
// A difference means the section was edited. Only a human records a decided change, with
// npm run acceptance:lock -- <page>.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { finding, runGate, withTempDir } from '../lib/gate.mjs';
import { ACCEPTANCE_HEADING, loadWiki, sectionText, sha256, specPages, wikiDirOf } from './parse.mjs';
import { writeFixtureWiki } from './fixture.mjs';

export const LOCK_FILE = 'wiki/acceptance.lock.json';

export function acceptanceHash(page) {
  const text = sectionText(page.body, ACCEPTANCE_HEADING);
  return text === undefined ? undefined : sha256(text);
}

export function readLock(root) {
  const path = join(root, LOCK_FILE);
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
}

export function acceptanceFindings(root) {
  const lock = readLock(root);
  return specPages(loadWiki(wikiDirOf(root))).flatMap((page) => {
    const where = `wiki/${page.path}`;
    const hash = acceptanceHash(page);
    if (hash === undefined) return [finding(where, undefined, `no «## ${ACCEPTANCE_HEADING}» section`)];
    if (lock[page.path] === undefined) return [finding(where, undefined, `acceptance section not locked in ${LOCK_FILE}; a human runs npm run acceptance:lock -- ${page.path}`)];
    if (lock[page.path] !== hash) return [finding(where, undefined, `acceptance section edited (hash differs from ${LOCK_FILE}); restore it, or write the case in wiki/review.md «To judge»`)];
    return [];
  });
}

export const acceptanceSelftest = () =>
  withTempDir((dir) => {
    writeFixtureWiki(dir);
    const page = join(dir, 'wiki/game/run.md');
    writeFileSync(page, readFileSync(page, 'utf8').replace('Something passes.', 'Something passes!'));
    return acceptanceFindings(dir);
  });

if (import.meta.url === `file://${process.argv[1]}`) {
  runGate('check-acceptance', { check: acceptanceFindings, selftest: acceptanceSelftest });
}
