// check-notices: THIRD_PARTY_NOTICES.md names every production dependency of the game
// (wiki/release/open-source.md, rule 2). A missing one fails, naming it: run npm run notices.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { finding, REPO_ROOT, runGate } from '../lib/gate.mjs';
import { productionDependencies, readLock } from '../release/production-deps.mjs';
import { headingOf, NOTICES_FILE } from '../release/notices.mjs';

export function checkNotices(lock, noticesText) {
  if (noticesText === undefined) return [finding(NOTICES_FILE, undefined, 'missing: run npm run notices')];
  const headings = new Set(noticesText.split('\n').filter((l) => l.startsWith('## ')));
  return productionDependencies(lock)
    .filter((dep) => !headings.has(headingOf(dep)))
    .map((dep) => finding(NOTICES_FILE, undefined, `production dependency ${dep.name} ${dep.version} is not listed: run npm run notices`));
}

const notices = () => {
  const path = join(REPO_ROOT, NOTICES_FILE);
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
};

runGate('check-notices', {
  check: () => checkNotices(readLock(), notices()),
  selftest: () => {
    // The real lock plus one invented production dependency the notices cannot list.
    const lock = readLock();
    const fixture = {
      ...lock,
      packages: {
        ...lock.packages,
        game: { ...lock.packages.game, dependencies: { ...lock.packages.game.dependencies, 'selftest-unlisted-dep': '1.0.0' } },
        'node_modules/selftest-unlisted-dep': { version: '1.0.0', license: 'MIT' },
      },
    };
    return checkNotices(fixture, notices());
  },
});
