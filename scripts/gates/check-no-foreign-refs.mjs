// check-no-foreign-refs: no tracked file, file name or commit message contains a forbidden term
// (AGENTS.md rule 6; wiki/method/gates.md, «check-no-foreign-refs in detail»).
// Only SHA-256 hashes of the terms are stored. If this gate fails on real content, remove the term
// from the content; never edit this list.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { finding, runGate, trackedFiles, withTempDir } from '../lib/gate.mjs';

const FORBIDDEN_HASHES = new Set([
  '39cd17db5d5074f4aa4572ad9733a9fb4b2e5ce453d21e8c9ea07240cf55a2e8',
  '90e70e0dff2d7c8b1eea8a60b7fd22bc27dfd76fc286802d7df084316fa0462c',
  '15544ef39dac74f26587a1c3dfa7d6bff1cedaab10d9e208ef78750dead11c3e',
]);

/** Longest run of consecutive tokens hashed together (a term may be up to three words). */
const MAX_RUN_TOKENS = 3;

/** A byte 0 in the first block marks a binary file, which is not scanned. */
const BINARY_PROBE_BYTES = 8000;

const sha256 = (text) => createHash('sha256').update(text).digest('hex');

/** Line numbers (1-based) of `text` that contain a forbidden term. */
export function forbiddenLines(text, hashes) {
  return text.split('\n').flatMap((line, index) => {
    const tokens = line.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 0);
    for (let start = 0; start < tokens.length; start += 1) {
      for (let size = 1; size <= MAX_RUN_TOKENS && start + size <= tokens.length; size += 1) {
        if (hashes.has(sha256(tokens.slice(start, start + size).join('')))) return [index + 1];
      }
    }
    return [];
  });
}

function isBinary(buffer) {
  return buffer.subarray(0, BINARY_PROBE_BYTES).includes(0);
}

export function checkForeignRefs(root, hashes, { files = trackedFiles(root), messages = commitMessages(root) } = {}) {
  const inPaths = files
    .filter((path) => forbiddenLines(path, hashes).length > 0)
    .map((path) => finding(path, undefined, 'the file name contains a forbidden term: rename it'));
  const inContent = files.flatMap((path) => {
    let buffer;
    try {
      buffer = readFileSync(join(root, path));
    } catch {
      return []; // tracked but deleted in the working tree: nothing to read
    }
    if (isBinary(buffer)) return [];
    return forbiddenLines(buffer.toString('utf8'), hashes).map((line) =>
      finding(path, line, 'contains a forbidden term: remove it from the content'),
    );
  });
  const inMessages = messages
    .filter(({ body }) => forbiddenLines(body, hashes).length > 0)
    .map(({ hash }) => finding(`commit ${hash}`, undefined, 'the commit message contains a forbidden term'));
  return [...inPaths, ...inContent, ...inMessages];
}

function commitMessages(root) {
  // %x00 makes git print a byte 0 after each message, which no message contains.
  const SEPARATOR = '\u0000';
  const raw = execFileSync('git', ['log', '--format=%H%n%B%x00'], { cwd: root, encoding: 'utf8' });
  return raw
    .split(SEPARATOR)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => ({ hash: entry.slice(0, entry.indexOf('\n')), body: entry }));
}

// The commit-msg hook passes the message being written, which is not in the history yet.
const messageFileIndex = process.argv.indexOf('--message-file');
if (messageFileIndex !== -1) {
  const path = process.argv[messageFileIndex + 1] ?? '';
  if (forbiddenLines(readFileSync(path, 'utf8'), FORBIDDEN_HASHES).length > 0) {
    console.error('check-no-foreign-refs: the commit message contains a forbidden term; rewrite it.');
    process.exit(1);
  }
  process.exit(0);
}

runGate('check-no-foreign-refs', {
  check: (root) => checkForeignRefs(root, FORBIDDEN_HASHES),
  selftest: () =>
    withTempDir((dir) => {
      const word = 'zorblaxquint';
      const hashes = new Set([...FORBIDDEN_HASHES, sha256(word)]);
      writeFileSync(join(dir, 'notes.md'), `harmless line\nthe ${word.toUpperCase()}-thing is here\n`);
      return checkForeignRefs(dir, hashes, { files: ['notes.md'], messages: [] });
    }),
});
