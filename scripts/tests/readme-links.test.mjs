// wiki/release/open-source.md, criterion 4: every relative link in README.md resolves.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { REPO_ROOT } from '../lib/gate.mjs';

export function relativeTargets(markdown) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  return [...withoutCode.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((m) => m[1].split('#')[0])
    .filter((target) => target.length > 0 && !/^[a-z]+:/i.test(target));
}

test('every relative link in README.md resolves', () => {
  const targets = relativeTargets(readFileSync(join(REPO_ROOT, 'README.md'), 'utf8'));
  assert.ok(targets.length > 0, 'README.md has relative links');
  assert.deepEqual(targets.filter((t) => !existsSync(join(REPO_ROOT, t))), []);
});

test('the link finder catches a broken link', () => {
  assert.deepEqual(relativeTargets('see [x](nowhere/file.md) and [y](https://example.com)'), ['nowhere/file.md']);
});
