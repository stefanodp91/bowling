// check-engines: the installed graphic and audio engines are exactly the versions and release URLs
// declared in game/package.json (wiki/method/gates.md, «The starting set»).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { finding, readText, runGate } from '../lib/gate.mjs';

/** The two engines; their URLs come from game/package.json, never from this file. */
const ENGINES = ['obsidian-eclipse-graphic-engine', 'obsidian-eclipse-audio-engine'];

/** A release URL ends in /download/v<version>/<name>-<version>.tgz. */
const RELEASE_URL = /^https:\/\/github\.com\/[^/]+\/([^/]+)\/releases\/download\/v([^/]+)\/\1-\2\.tgz$/;

export function checkEngines({ declared, lock, installedVersion }) {
  return ENGINES.flatMap((name) => {
    const url = declared[name];
    if (url === undefined) return [finding('game/package.json', undefined, `${name} is not declared`)];
    const match = RELEASE_URL.exec(url);
    if (match === null || match[1] !== name) {
      return [finding('game/package.json', undefined, `${name} must come from its release URL, got «${url}»`)];
    }
    const version = match[2];
    const locked = lock.packages?.[`node_modules/${name}`];
    const problems = [];
    if (locked?.resolved !== url) {
      problems.push(finding('package-lock.json', undefined, `${name} resolves to «${locked?.resolved}», expected «${url}»; run npm install`));
    }
    if (locked?.version !== version) {
      problems.push(finding('package-lock.json', undefined, `${name} is locked at ${locked?.version}, expected ${version}`));
    }
    const installed = installedVersion(name);
    if (installed !== version) {
      problems.push(finding(`node_modules/${name}`, undefined, `installed ${installed ?? 'nothing'}, expected ${version}; run npm ci`));
    }
    return problems;
  });
}

function readRepo(root) {
  const game = JSON.parse(readText(join(root, 'game/package.json')));
  return {
    declared: { ...game.dependencies, ...game.devDependencies },
    lock: JSON.parse(readText(join(root, 'package-lock.json'))),
    installedVersion: (name) => {
      const path = join(root, 'node_modules', name, 'package.json');
      return existsSync(path) ? JSON.parse(readText(path)).version : undefined;
    },
  };
}

runGate('check-engines', {
  check: (root) => checkEngines(readRepo(root)),
  selftest: () => {
    const url = 'https://github.com/someone/obsidian-eclipse-graphic-engine/releases/download/v1.0.0/obsidian-eclipse-graphic-engine-1.0.0.tgz';
    const audio = 'https://github.com/someone/obsidian-eclipse-audio-engine/releases/download/v1.0.0/obsidian-eclipse-audio-engine-1.0.0.tgz';
    return checkEngines({
      declared: { 'obsidian-eclipse-graphic-engine': url, 'obsidian-eclipse-audio-engine': audio },
      lock: {
        packages: {
          'node_modules/obsidian-eclipse-graphic-engine': { version: '1.0.0', resolved: 'file:../local-checkout' },
          'node_modules/obsidian-eclipse-audio-engine': { version: '1.0.0', resolved: audio },
        },
      },
      installedVersion: () => '1.0.0',
    });
  },
});
