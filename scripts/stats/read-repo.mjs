// Reads the facts npm run stats needs from git and the wiki of a repository.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadWiki, specPages, wikiDirOf } from '../wiki/parse.mjs';

const git = (root, ...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });

export function readCommits(root) {
  return git(root, 'log', '--format=%H%x1f%cI%x1f%B%x00')
    .split('\0')
    .map((entry) => entry.replace(/^\n/, ''))
    .filter((entry) => entry.trim().length > 0)
    .map((entry) => {
      const [hash, date, message] = entry.split('\x1f');
      return { hash, date: Date.parse(date), message };
    });
}

export function readGates(root) {
  const dir = join(root, 'scripts/gates');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mjs'))
    .sort()
    .map((file) => {
      const added = git(root, 'log', '--diff-filter=A', '--format=%h %cs', '--', `scripts/gates/${file}`).trim().split('\n').pop();
      return { gate: file.replace(/\.mjs$/, ''), added: added || 'not committed yet' };
    });
}

export function readShots(root) {
  const log = join(root, 'shots/shots.log');
  return existsSync(log) ? readFileSync(log, 'utf8').split('\n').filter((l) => l.trim().length > 0).length : undefined;
}

export function readWiki(root) {
  const pages = loadWiki(wikiDirOf(root));
  const review = pages.find((p) => p.path === 'review.md');
  return { specs: specPages(pages), reviewBody: review?.body ?? '' };
}
