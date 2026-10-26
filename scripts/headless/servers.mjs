// Starts (or reuses) the dev server and Storybook for headless tools.
import { spawn } from 'node:child_process';
import { REPO_ROOT } from '../lib/gate.mjs';

/** Where each server answers, and the npm script that starts it (wiki/workspace/monorepo.md). */
export const SERVERS = {
  storybook: { probe: 'http://localhost:6006/index.json', base: 'http://localhost:6006', script: 'storybook' },
  game: { probe: 'http://localhost:3000/', base: 'http://localhost:3000', script: 'dev' },
};

/** Storybook's first start compiles its manager and preview: allow it time. */
const START_TIMEOUT_MS = 120_000;
const POLL_MS = 500;

async function answers(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

/** Returns a stop function: a no-op for a reused server, a kill for one started here. */
export async function ensureServer(name) {
  const server = SERVERS[name];
  if (await answers(server.probe)) return { base: server.base, stop: () => {} };
  const child = spawn('npm', ['run', server.script], { cwd: REPO_ROOT, stdio: 'ignore', detached: true });
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (!(await answers(server.probe))) {
    if (Date.now() > deadline) {
      process.kill(-child.pid);
      throw new Error(`${name} server did not answer at ${server.probe} within ${START_TIMEOUT_MS / 1000} s`);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  return { base: server.base, stop: () => process.kill(-child.pid) };
}
