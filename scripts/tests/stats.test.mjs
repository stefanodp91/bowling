// wiki/method/stats.md, criterion 1: the counts on a fixture repository built in a temporary folder.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { withTempDir } from '../lib/gate.mjs';
import { commitsPerAgent, longestAgentStreak, statusCounts } from '../stats/counts.mjs';
import { readCommits, readWiki } from '../stats/read-repo.mjs';

const START = Date.parse('2026-10-26T10:00:00Z');
const MINUTE_MS = 60_000;
const OPUS = 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>';
const OTHER = 'Co-Authored-By: Codex GPT-9 <noreply@example.com>';

const page = (status) => `---\ntitle: P\ntype: spec\nstatus: ${status}\ndepends_on: []\ncanonical: []\nverified: 2026-10-26\n---\n\n# P\n`;

/** Builds a git repository whose commits are at `minutes` after START with the given trailers. */
function fixtureRepo(dir, commits) {
  const git = (env, ...args) => execFileSync('git', args, { cwd: dir, env: { ...process.env, ...env } });
  git({}, 'init', '-q');
  mkdirSync(join(dir, 'wiki'), { recursive: true });
  writeFileSync(join(dir, 'wiki/a.md'), page('planned'));
  writeFileSync(join(dir, 'wiki/b.md'), page('built'));
  writeFileSync(join(dir, 'wiki/c.md'), page('built'));
  writeFileSync(join(dir, 'wiki/d.md'), page('approved'));
  commits.forEach(({ minutes, trailer }, i) => {
    writeFileSync(join(dir, `file-${i}.txt`), `${i}\n`);
    const date = new Date(START + minutes * MINUTE_MS).toISOString();
    git({}, 'add', '-A');
    git({ GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date, GIT_AUTHOR_NAME: 'T', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 'T', GIT_COMMITTER_EMAIL: 't@t' },
      'commit', '-q', '--no-verify', '-m', `step ${i}${trailer ? `\n\n${trailer}` : ''}`);
  });
}

test('trailers are counted per agent and model; commits without one are human', () =>
  withTempDir((dir) => {
    fixtureRepo(dir, [{ minutes: 0, trailer: OPUS }, { minutes: 5, trailer: OTHER }, { minutes: 10, trailer: OPUS }, { minutes: 15 }]);
    const counts = commitsPerAgent(readCommits(dir));
    assert.deepEqual(counts, { total: 4, human: 1, perAgent: { 'Claude Opus 5.5': 2, 'Codex GPT-9': 1 } });
  }));

test('a streak survives a 29-minute gap and breaks on a 31-minute gap', () =>
  withTempDir((dir) => {
    fixtureRepo(dir, [
      { minutes: 0, trailer: OPUS },
      { minutes: 29, trailer: OPUS },
      { minutes: 58, trailer: OPUS },
      { minutes: 89, trailer: OPUS },
      { minutes: 90, trailer: OPUS },
    ]);
    assert.deepEqual(longestAgentStreak(readCommits(dir)), { commits: 3, minutes: 58 });
  }));

test('a human commit ends a streak', () => {
  const at = (minutes, message) => ({ date: START + minutes * MINUTE_MS, message });
  const streak = longestAgentStreak([at(0, OPUS), at(1, 'human'), at(2, OPUS), at(3, OPUS)]);
  assert.deepEqual(streak, { commits: 2, minutes: 1 });
});

test('statuses are counted from front matter', () =>
  withTempDir((dir) => {
    fixtureRepo(dir, [{ minutes: 0, trailer: OPUS }]);
    const { specs } = readWiki(dir);
    assert.deepEqual(statusCounts(specs), { planned: 1, built: 2, approved: 1, builtNotApproved: 2 });
  }));
