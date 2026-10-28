// wiki/method/gates.md, criterion 5: the table on that page has one row per file in scripts/gates/.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { REPO_ROOT } from '../lib/gate.mjs';

test('every gate file has a row in wiki/method/gates.md', () => {
  const page = readFileSync(join(REPO_ROOT, 'wiki/method/gates.md'), 'utf8');
  const rows = new Set([...page.matchAll(/^\| `(check-[a-z0-9-]+)`/gm)].map((m) => m[1]));
  const files = readdirSync(join(REPO_ROOT, 'scripts/gates')).map((f) => f.replace(/\.mjs$/, ''));
  const missing = files.filter((f) => !rows.has(f));
  assert.deepEqual(missing, [], `gates without a row in wiki/method/gates.md: ${missing.join(', ')}`);
});
