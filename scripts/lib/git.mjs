// Runs git on the repository in a given folder, whatever the caller's environment says.
import { execFileSync } from 'node:child_process';

/**
 * The variables that make git pick a repository other than the one in its working folder, as git
 * itself lists them (`git rev-parse --local-env-vars`). A hook runs with some of them set
 * (`GIT_INDEX_FILE` always, `GIT_DIR` in a worktree), and every git child inherits them: without
 * this, a fixture repository built by a test inside the pre-commit hook is the real one (AGENTS.md,
 * «Traps»).
 */
const REPOSITORY_ENV_VARS = execFileSync('git', ['rev-parse', '--local-env-vars'], { encoding: 'utf8' })
  .split('\n')
  .filter((name) => name.length > 0);

/** The current environment without the repository variables, plus `extra`. */
export function envForRepoAt(extra = {}) {
  const env = { ...process.env };
  for (const name of REPOSITORY_ENV_VARS) delete env[name];
  return { ...env, ...extra };
}

/** Runs git in `root` on the repository found there, and returns its output as text. */
export function gitIn(root, args, extraEnv = {}) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', env: envForRepoAt(extraEnv) });
}
