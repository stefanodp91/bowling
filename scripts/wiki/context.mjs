// npm run wiki:context -- <files…>: the pages to read before touching those files
// (wiki/method/wiki-tooling.md, rule 3; prompts/2-read-before-acting.md).
import { finding, REPO_ROOT, runGate, withTempDir } from '../lib/gate.mjs';
import { describePage, pagesCovering } from './coverage.mjs';
import { writeFixtureWiki } from './fixture.mjs';

/** The fixture maps game/src/domain/run.ts to game/run.md (criterion 3 until that page is built). */
function contextSelftest() {
  return withTempDir((dir) => {
    writeFixtureWiki(dir);
    const found = pagesCovering(dir, ['game/src/domain/run.ts']).map((p) => p.path);
    const missing = pagesCovering(dir, ['game/src/ui/Nothing.tsx']);
    // The gate contract wants a rejection: a file no page covers must yield no page.
    return found.includes('game/run.md') && missing.length === 0
      ? [finding('game/src/ui/Nothing.tsx', undefined, 'covered by no page (and game/src/domain/run.ts → game/run.md)')]
      : [];
  });
}

if (process.argv.includes('--selftest')) {
  runGate('wiki:context', { check: () => [], selftest: contextSelftest });
} else {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('usage: npm run wiki:context -- <files…>');
    process.exit(1);
  }
  const pages = pagesCovering(REPO_ROOT, files);
  if (pages.length === 0) console.log('No page covers these files: read wiki/index.md and say so (prompt 2, step 4).');
  for (const page of pages) console.log(describePage(page));
}
