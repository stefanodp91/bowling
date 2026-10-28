// npm run wiki:touched: the pages to re-check after a change, and the changed files no page covers
// (wiki/method/wiki-tooling.md, rule 4; prompts/3-update-docs-after-change.md, step 1).
import { execFileSync } from 'node:child_process';
import { finding, REPO_ROOT, runGate, withTempDir } from '../lib/gate.mjs';
import { covers, describePage, pagesCovering } from './coverage.mjs';
import { writeFixtureWiki } from './fixture.mjs';
import { loadWiki, specPages, wikiDirOf } from './parse.mjs';

const lines = (text) => text.split('\n').filter((l) => l.length > 0);

/** Changed against HEAD (staged and unstaged) plus untracked files. */
export function changedFiles(root) {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  return [...new Set([...lines(git('diff', '--name-only', 'HEAD')), ...lines(git('ls-files', '--others', '--exclude-standard'))])].sort();
}

export function crossWithWiki(root, files) {
  const pages = pagesCovering(root, files);
  const allCanonical = specPages(loadWiki(wikiDirOf(root))).flatMap((p) => p.frontMatter.canonical ?? []);
  const uncovered = files.filter((f) => !f.startsWith('wiki/') && !allCanonical.some((entry) => covers(entry, f)));
  return { pages, uncovered };
}

if (process.argv.includes('--selftest')) {
  runGate('wiki:touched', {
    check: () => [],
    selftest: () =>
      withTempDir((dir) => {
        writeFixtureWiki(dir);
        const { pages, uncovered } = crossWithWiki(dir, ['game/src/domain/run.ts', 'game/src/orphan.ts']);
        const ok = pages.some((p) => p.path === 'game/run.md') && uncovered.includes('game/src/orphan.ts');
        return ok ? uncovered.map((f) => finding(f, undefined, 'changed and covered by no page')) : [];
      }),
  });
} else {
  const { pages, uncovered } = crossWithWiki(REPO_ROOT, changedFiles(REPO_ROOT));
  console.log('Pages to re-check:');
  console.log(pages.length === 0 ? '  (none)' : pages.map((p) => `  ${describePage(p)}`).join('\n'));
  console.log('Changed files no page covers:');
  console.log(uncovered.length === 0 ? '  (none)' : uncovered.map((f) => `  ${f}`).join('\n'));
}
