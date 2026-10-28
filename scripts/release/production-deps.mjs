// The game's production dependencies: everything reachable from game/package.json «dependencies»
// (and the required peers they install) in package-lock.json — what ends up in game/dist.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '../lib/gate.mjs';

/** Files that carry a licence or a notice, as packages name them. */
const LICENCE_FILE = /^(licen[cs]e|copying|notice)(\.(md|txt))?$/i;

function resolve(packages, name, from) {
  for (const candidate of [`${from}/node_modules/${name}`, `node_modules/${name}`]) if (packages[candidate] !== undefined) return candidate;
  return undefined;
}

/** [{ name, version, license, path }] sorted by name then version. */
export function productionDependencies(lock, rootWorkspace = 'game') {
  const packages = lock.packages ?? {};
  const seen = new Map();
  const stack = Object.keys(packages[rootWorkspace]?.dependencies ?? {}).map((name) => [name, rootWorkspace]);
  while (stack.length > 0) {
    const [name, from] = stack.pop();
    const path = resolve(packages, name, from);
    if (path === undefined || seen.has(path)) continue;
    const entry = packages[path];
    seen.set(path, { name, version: entry.version, license: entry.license ?? 'UNKNOWN', path });
    const optionalPeers = entry.peerDependenciesMeta ?? {};
    const peers = Object.keys(entry.peerDependencies ?? {}).filter((p) => optionalPeers[p]?.optional !== true);
    for (const dep of [...Object.keys(entry.dependencies ?? {}), ...peers]) stack.push([dep, path]);
  }
  return [...seen.values()].sort((a, b) => (a.name === b.name ? (a.version < b.version ? -1 : 1) : a.name < b.name ? -1 : 1));
}

export function readLock(root = REPO_ROOT) {
  return JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
}

/** The licence and notice texts a package ships, by file name. */
export function licenceTexts(root, dep) {
  const dir = join(root, dep.path);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => LICENCE_FILE.test(f))
    .sort()
    .map((f) => ({ file: f, text: readFileSync(join(dir, f), 'utf8').trim() }));
}
