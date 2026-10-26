// The common contract of every gate (wiki/method/gates.md, rule 1): exit 0 = pass, 1 = fail, a
// message per finding, and a --selftest that proves the gate rejects a wrong case.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Absolute path of the repository root (this file is scripts/lib/gate.mjs). */
export const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));

/** A finding: the file, the line when there is one, and what is wrong and what to do. */
export function finding(file, line, message) {
  return { file, line, message };
}

export function formatFinding({ file, line, message }) {
  return line === undefined ? `${file}: ${message}` : `${file}:${line}: ${message}`;
}

/**
 * Runs a gate. `check(root)` returns findings for the repository at `root`; `selftest()` builds a
 * wrong case and returns the findings the gate produced on it, which must not be empty.
 */
export function runGate(name, { check, selftest }) {
  const isSelftest = process.argv.includes('--selftest');
  if (isSelftest) {
    const findings = selftest();
    if (findings.length === 0) {
      console.error(`${name} --selftest: FAILED, the wrong case was accepted.`);
      process.exit(1);
    }
    console.log(`${name} --selftest: ok, rejected:`);
    for (const f of findings) console.log(`  ${formatFinding(f)}`);
    return;
  }
  const findings = check(REPO_ROOT);
  if (findings.length > 0) {
    console.error(`${name}: ${findings.length} problem(s)`);
    for (const f of findings) console.error(`  ${formatFinding(f)}`);
    process.exit(1);
  }
  console.log(`${name}: ok`);
}

/** Creates a temporary directory, passes it to `fn`, removes it afterwards. */
export function withTempDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'bowling-gate-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Every file under `dir` (absolute), recursively, skipping node_modules. */
export function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    if (entry === 'node_modules') return [];
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** Path relative to `root`, with forward slashes, for messages and pattern matching. */
export function rel(root, path) {
  return relative(root, path).split(sep).join('/');
}

/** Files tracked by git under `root` (relative paths). */
export function trackedFiles(root) {
  return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter((f) => f.length > 0);
}

export function readText(path) {
  return readFileSync(path, 'utf8');
}
